import React, { useState, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { BASE_URL } from '../../../config';
import { ShieldAlert, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ConflictSystem = () => {
  const [medicine1, setMedicine1] = useState('');
  const [medicine2, setMedicine2] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(new Set()); // استخدام Set بدل object

  // جلب قايمة الأدوية
  useEffect(() => {
    const fetchMedicines = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(`${BASE_URL}medicines`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok) {
          setMedicines(data);
        } else {
          setError(data.message || 'Failed to fetch medicines.');
        }
      } catch (err) {
        setError('An error occurred while fetching medicines.');
      }
    };

    fetchMedicines();
  }, []);

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setShowDetails(new Set()); // إعادة تعيين showDetails

    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${BASE_URL}sanctum/csrf-cookie`);
      const res = await fetch(`${BASE_URL}interactions/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ medicine_1: medicine1, medicine_2: medicine2 }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch (err) {
      setError('An error occurred while checking interactions.');
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لاختصار النصوص
  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // دالة لتبديل عرض التفاصيل
  const toggleDetails = (key) => {
    setShowDetails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <ShieldAlert className="h-8 w-8 text-indigo-600" />
            Drug Interaction Checker
          </h1>
          <p className="text-md text-slate-600 mt-2">
            Quickly check for potential drug interactions.
          </p>
        </motion.div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medicine 1</label>
              <input
                type="text"
                value={medicine1}
                onChange={(e) => setMedicine1(e.target.value)}
                placeholder="Enter first medicine"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                list="medicines1"
              />
              <datalist id="medicines1">
                {medicines.map((med, index) => (
                  <option key={index} value={med} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medicine 2</label>
              <input
                type="text"
                value={medicine2}
                onChange={(e) => setMedicine2(e.target.value)}
                placeholder="Enter second medicine"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                list="medicines2"
              />
              <datalist id="medicines2">
                {medicines.map((med, index) => (
                  <option key={index} value={med} />
                ))}
              </datalist>
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={isLoading || !medicine1 || !medicine2}
            className={`w-full py-2 rounded-lg font-semibold text-white ${
              isLoading || !medicine1 || !medicine2
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors duration-300`}
          >
            {isLoading ? 'Checking...' : 'Check Interactions'}
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center mb-8">
            <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <TypeAnimation sequence={[error, 300]} wrapper="p" speed={80} />
          </div>
        )}

        {response && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
              <TypeAnimation sequence={['Interaction Results', 300]} wrapper="span" speed={80} />
            </h2>

            {response.data?.interactions?.length > 0 && (
              <div className="mb-6">
                {response.data.interactions.map((interaction, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg mb-3 border-l-4 ${
                      interaction.severity === 'high'
                        ? 'border-red-500 bg-red-50'
                        : interaction.severity === 'moderate'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-indigo-600" />
                        <p className="font-medium text-sm">
                          <TypeAnimation sequence={[`Severity: ${interaction.severity}`, 300]} wrapper="span" speed={80} />
                        </p>
                      </div>
                      <button
                        onClick={() => toggleDetails(`interaction-${index}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                      >
                        {showDetails.has(`interaction-${index}`) ? 'Hide Details' : 'Show Details'}
                        {showDetails.has(`interaction-${index}`) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-slate-600 text-sm mt-2">
                      <TypeAnimation
                        sequence={[showDetails.has(`interaction-${index}`) ? interaction.description : truncateText(interaction.description, 60), 300]}
                        wrapper="span"
                        speed={80}
                        key={showDetails.has(`interaction-${index}`) ? 'full' : 'truncated'} // إضافة key لإعادة الـ render
                      />
                    </p>
                  </div>
                ))}
              </div>
            )}

            {response.data?.interactions?.length === 0 && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <TypeAnimation sequence={['No significant interactions found.', 300]} wrapper="p" speed={80} />
              </div>
            )}

            {response.data?.contraindications?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Medical History Warnings
                </h3>
                {response.data.contraindications.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg mb-3 border-l-4 border-red-500 bg-red-50">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600 text-sm">
                        <TypeAnimation
                          sequence={[showDetails.has(`contraindication-${index}`) ? item.warning : truncateText(item.warning, 60), 300]}
                          wrapper="span"
                          speed={80}
                          key={showDetails.has(`contraindication-${index}`) ? 'full' : 'truncated'} // إضافة key لإعادة الـ render
                        />
                      </p>
                      <button
                        onClick={() => toggleDetails(`contraindication-${index}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                      >
                        {showDetails.has(`contraindication-${index}`) ? 'Hide Details' : 'Show Details'}
                        {showDetails.has(`contraindication-${index}`) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-red-600 text-xs font-medium text-center mt-4">
              <TypeAnimation sequence={[response.disclaimer, 300]} wrapper="span" speed={80} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConflictSystem;