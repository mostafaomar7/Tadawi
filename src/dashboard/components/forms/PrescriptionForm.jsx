import React, { useState, useEffect } from 'react';
import { prescriptionsService } from '../../services/prescriptions';

export default function PrescriptionForm({ prescription, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    status: 'pending',
    notes: '',
    medicines: [],
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (prescription) {
      setFormData({
        patient_id: prescription.patient_id || '',
        doctor_id: prescription.doctor_id || '',
        status: prescription.status || 'pending',
        notes: prescription.notes || '',
        medicines: prescription.medicines || [],
        image: null
      });
    }
    
    // In a real app, you would fetch these from API
    setPatients([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
    ]);
    
    setDoctors([
      { id: 1, name: 'Dr. Ahmed Ali', specialization: 'Cardiology' },
      { id: 2, name: 'Dr. Sarah Mohamed', specialization: 'Dermatology' },
      { id: 3, name: 'Dr. Omar Hassan', specialization: 'Neurology' }
    ]);
    
    setMedicines([
      { id: 1, name: 'Paracetamol', dosage: '500mg' },
      { id: 2, name: 'Ibuprofen', dosage: '400mg' },
      { id: 3, name: 'Amoxicillin', dosage: '250mg' },
      { id: 4, name: 'Aspirin', dosage: '100mg' }
    ]);
  }, [prescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = {
      ...newMedicines[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medicines: newMedicines
    }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        medicine_id: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      medicines: newMedicines
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('patient_id', formData.patient_id);
      formDataToSend.append('doctor_id', formData.doctor_id);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('notes', formData.notes);
      
      // Add medicines as JSON
      formDataToSend.append('medicines', JSON.stringify(formData.medicines));
      
      // Add image if provided
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Sending prescription data to backend:', Object.fromEntries(formDataToSend));

      if (prescription) {
        await prescriptionsService.updatePrescription(prescription.id, formDataToSend);
      } else {
        await prescriptionsService.createPrescription(formDataToSend);
      }
      onSave();
    } catch (err) {
      console.error('Prescription form submission error:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.message || 'An error occurred while saving the prescription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-form">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Patient *</label>
              <select
                className="form-control"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Doctor *</label>
              <select
                className="form-control"
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
                <option value="uploaded">Uploaded</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Prescription Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              <small className="text-muted">
                Upload prescription image (JPG, PNG, PDF - Max 5MB)
              </small>
            </div>
          </div>
        </div>

        {/* Prescription Medicines */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Prescription Medicines</h5>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addMedicine}
            >
              <i className="fas fa-plus me-1"></i>Add Medicine
            </button>
          </div>

          {formData.medicines.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <p>No medicines added yet. Click "Add Medicine" to start.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.medicines.map((medicine, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-control form-control-sm"
                          value={medicine.medicine_id}
                          onChange={(e) => handleMedicineChange(index, 'medicine_id', e.target.value)}
                          required
                        >
                          <option value="">Select Medicine</option>
                          {medicines.map(med => (
                            <option key={med.id} value={med.id}>
                              {med.name} ({med.dosage})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          required
                        />
                      </td>
                      <td>
                        <select
                          className="form-control form-control-sm"
                          value={medicine.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                          required
                        >
                          <option value="">Select Frequency</option>
                          <option value="once_daily">Once Daily</option>
                          <option value="twice_daily">Twice Daily</option>
                          <option value="three_times_daily">Three Times Daily</option>
                          <option value="four_times_daily">Four Times Daily</option>
                          <option value="as_needed">As Needed</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={medicine.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={medicine.instructions}
                          onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeMedicine(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-3">
          <label className="form-label">Doctor's Notes</label>
          <textarea
            className="form-control"
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional notes or instructions..."
          />
        </div>

        {/* Form Actions */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            <i className="fas fa-times me-2"></i>Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary-gradient text-white border-0"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>{prescription ? 'Update Prescription' : 'Create Prescription'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
