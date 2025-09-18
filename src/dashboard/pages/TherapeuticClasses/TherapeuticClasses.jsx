import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { therapeuticClassesService } from '../../services';
import { useToast } from '../../hooks/useToast';

const TherapeuticClasses = () => {
  const [therapeuticClasses, setTherapeuticClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTherapeuticClasses();
  }, [currentPage, searchTerm]);

  const fetchTherapeuticClasses = async () => {
    try {
      setLoading(true);
      const response = await therapeuticClassesService.getTherapeuticClasses({
        page: currentPage,
        search: searchTerm,
        per_page: 10
      });
      
      setTherapeuticClasses(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch therapeutic classes');
      showToast('Error loading therapeutic classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await therapeuticClassesService.updateTherapeuticClass(editingItem.id, formData);
        showToast('Therapeutic class updated successfully', 'success');
      } else {
        await therapeuticClassesService.createTherapeuticClass(formData);
        showToast('Therapeutic class created successfully', 'success');
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', category: '' });
      fetchTherapeuticClasses();
    } catch (err) {
      showToast(err.message || 'Failed to save therapeutic class', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this therapeutic class?')) {
      try {
        await therapeuticClassesService.deleteTherapeuticClass(id);
        showToast('Therapeutic class deleted successfully', 'success');
        fetchTherapeuticClasses();
      } catch (err) {
        showToast(err.message || 'Failed to delete therapeutic class', 'error');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await therapeuticClassesService.restoreTherapeuticClass(id);
      showToast('Therapeutic class restored successfully', 'success');
      fetchTherapeuticClasses();
    } catch (err) {
      showToast(err.message || 'Failed to restore therapeutic class', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading therapeutic classes...</p>
      </div>
    );
  }

  return (
    <div className="therapeutic-classes-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Therapeutic Classes Management</h2>
        <Button 
          variant="primary" 
          onClick={() => {
            setEditingItem(null);
            setFormData({ name: '', description: '', category: '' });
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus me-2"></i>Add New Therapeutic Class
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="mb-4">
        <CardBody>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Therapeutic Classes</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Therapeutic Classes Table */}
      <Card>
        <CardBody>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {therapeuticClasses.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.description || 'N/A'}</td>
                  <td>{item.category || 'N/A'}</td>
                  <td>
                    <Badge bg={item.deleted_at ? 'danger' : 'success'}>
                      {item.deleted_at ? 'Deleted' : 'Active'}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      {item.deleted_at ? (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleRestore(item.id)}
                        >
                          <i className="fas fa-undo"></i>
                        </Button>
                      ) : (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Edit Therapeutic Class' : 'Add New Therapeutic Class'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Cardiovascular, Respiratory"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default TherapeuticClasses;
