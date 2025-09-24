// src/pages/doctor/WriteReport.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import API from '../../services/api';
import './WriteReport.css';

export default function WriteReport() {
  const [appointment, setAppointment] = useState(null);
  const [reportForm, setReportForm] = useState({
    diagnosis: '',
    prescriptions: [
      {
        medicine: '',
        dosage: '',
        frequency: '',
        duration: ''
      }
    ],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // Get appointmentId from URL params
  const getAppointmentId = () => {
    const params = new URLSearchParams(location.search);
    return params.get('appointmentId');
  };

  // Fetch appointment details
  const fetchAppointment = async () => {
    try {
      const appointmentId = getAppointmentId();
      if (!appointmentId) {
        throw new Error('No appointment ID provided');
      }

      const res = await API.get(`/appointments/doctor/${appointmentId}`);
      setAppointment(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setMessage({ type: 'error', text: 'Failed to load appointment. Please try again.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, []);

  // Add new prescription field
  const addPrescription = () => {
    setReportForm({
      ...reportForm,
      prescriptions: [
        ...reportForm.prescriptions,
        {
          medicine: '',
          dosage: '',
          frequency: '',
          duration: ''
        }
      ]
    });
  };

  // Remove prescription field
  const removePrescription = (index) => {
    if (reportForm.prescriptions.length > 1) {
      const newPrescriptions = [...reportForm.prescriptions];
      newPrescriptions.splice(index, 1);
      setReportForm({
        ...reportForm,
        prescriptions: newPrescriptions
      });
    }
  };

  // Handle prescription field change
  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...reportForm.prescriptions];
    newPrescriptions[index][field] = value;
    setReportForm({
      ...reportForm,
      prescriptions: newPrescriptions
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!reportForm.diagnosis) {
      newErrors.diagnosis = 'Diagnosis is required';
    }
    
    // Validate prescriptions
    reportForm.prescriptions.forEach((prescription, index) => {
      if (!prescription.medicine) {
        newErrors[`prescription-${index}-medicine`] = 'Medicine name is required';
      }
      if (!prescription.dosage) {
        newErrors[`prescription-${index}-dosage`] = 'Dosage is required';
      }
      if (!prescription.frequency) {
        newErrors[`prescription-${index}-frequency`] = 'Frequency is required';
      }
      if (!prescription.duration) {
        newErrors[`prescription-${index}-duration`] = 'Duration is required';
      }
    });

    return newErrors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setSubmitting(true);
      const appointmentId = getAppointmentId();
      
      const res = await API.post('/reports', {
        appointmentId,
        diagnosis: reportForm.diagnosis,
        prescriptions: reportForm.prescriptions,
        notes: reportForm.notes
      });

      // Show success message
      setMessage({ 
        type: 'success', 
        text: 'Medical report created successfully! PDF generated and sent to patient.' 
      });

      // Redirect to assigned patients after 3 seconds
      setTimeout(() => {
        navigate('/doctor/patients');
      }, 3000);
    } catch (err) {
      console.error('Error creating report:', err);
      setSubmitting(false);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.msg || 'Failed to create report. Please try again.' 
      });
    }
  };

  if (loading) {
    return (
      <div className="write-report-container">
        <Navbar />
        <div className="write-report-content">
          <Sidebar />
          <main className="write-report-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading appointment details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="write-report-container">
        <Navbar />
        <div className="write-report-content">
          <Sidebar />
          <main className="write-report-main">
            <div className="hospital-error">
              <div className="hospital-error-icon">⚠️</div>
              <p>No appointment found today. Please go back and select a patient.</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/doctor/patients')}
              >
                Go to Assigned Patients
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="write-report-container">
      <Navbar />
      <div className="write-report-content">
        <Sidebar />
        <main className="write-report-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📝 Write Medical Report</h1>
            <p className="hospital-subtitle">
              Document your consultation for {appointment.patientId?.name}
            </p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Patient Info Card */}
          <Card header="Patient Information" className="patient-info-card">
            <div className="patient-info-grid">
              <div className="info-item">
                <label>Patient Name:</label>
                <span>{appointment.patientId?.name}</span>
              </div>
              <div className="info-item">
                <label>Reason for Visit:</label>
                <span>{appointment.reason}</span>
              </div>
              <div className="info-item">
                <label>Appointment Time:</label>
                <span>{new Date(appointment.date).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`appointment-status appointment-status--${appointment.status}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          </Card>

          {/* Report Form */}
          <Card header="Medical Report">
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-group">
                <Input
                  label="Diagnosis"
                  placeholder="e.g., Acute Bronchitis, Hypertension"
                  value={reportForm.diagnosis}
                  onChange={(e) => setReportForm({ ...reportForm, diagnosis: e.target.value })}
                  state={errors.diagnosis ? 'error' : 'default'}
                  helpText={errors.diagnosis || ''}
                  required
                />
              </div>

              {/* Prescriptions Section */}
              <div className="form-group">
                <label className="section-label">Prescriptions</label>
                <p className="section-description">
                  Add medications with dosage, frequency, and duration
                </p>
                
                {reportForm.prescriptions.map((prescription, index) => (
                  <div key={index} className="prescription-group">
                    <div className="prescription-header">
                      <h4 className="prescription-title">Prescription {index + 1}</h4>
                      {reportForm.prescriptions.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removePrescription(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="prescription-grid">
                      <div className="form-group">
                        <Input
                          label="Medicine Name"
                          placeholder="e.g., Amoxicillin, Paracetamol"
                          value={prescription.medicine}
                          onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}
                          state={errors[`prescription-${index}-medicine`] ? 'error' : 'default'}
                          helpText={errors[`prescription-${index}-medicine`] || ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Dosage"
                          placeholder="e.g., 500mg, 10mg"
                          value={prescription.dosage}
                          onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                          state={errors[`prescription-${index}-dosage`] ? 'error' : 'default'}
                          helpText={errors[`prescription-${index}-dosage`] || ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Frequency"
                          placeholder="e.g., 2 times a day, Every 6 hours"
                          value={prescription.frequency}
                          onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                          state={errors[`prescription-${index}-frequency`] ? 'error' : 'default'}
                          helpText={errors[`prescription-${index}-frequency`] || ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Duration"
                          placeholder="e.g., 7 days, 2 weeks"
                          value={prescription.duration}
                          onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                          state={errors[`prescription-${index}-duration`] ? 'error' : 'default'}
                          helpText={errors[`prescription-${index}-duration`] || ''}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPrescription}
                  className="add-prescription-btn"
                >
                  ➕ Add Another Prescription
                </Button>
              </div>

              {/* Notes Section */}
              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  value={reportForm.notes}
                  onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                  className="notes-textarea"
                  rows="4"
                  placeholder="Add any additional notes, follow-up instructions, or recommendations..."
                />
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? 'Creating Report...' : 'Create Medical Report'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/doctor/patients')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}