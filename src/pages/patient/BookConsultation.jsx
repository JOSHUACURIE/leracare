// src/pages/patient/BookConsultation.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import API from '../../services/api';
import './BookConsultation.css';

// Custom Select component with unique keys
const CustomSelect = ({ options, value, onChange, placeholder }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="custom-select"
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={`${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default function BookConsultation() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Select doctor, 2: Select time, 3: Confirm
  const [formData, setFormData] = useState({
    doctorId: '',
    specialty: '',
    date: '',
    timeSlot: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch doctors and specialties
  const fetchDoctors = async () => {
    try {
      const res = await API.get('/auth/doctors');
      setDoctors(res.data);

      const uniqueSpecialties = [...new Set(res.data.map(d => d.specialty))];
      setSpecialties(uniqueSpecialties.map(s => ({ value: s, label: s })));

      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setMessage({ type: 'error', text: 'Failed to load doctors. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors by specialty
  const filteredDoctors = formData.specialty
    ? doctors.filter(d => d.specialty === formData.specialty)
    : doctors;

  // Fetch available slots whenever doctor or date changes
  useEffect(() => {
    const getAvailableSlots = async () => {
      if (!formData.doctorId || !formData.date) return;

      try {
        const today = new Date();
        const selectedDate = new Date(formData.date);

        if (selectedDate < today.setHours(0, 0, 0, 0)) {
          setMessage({ type: 'error', text: 'Cannot book appointment for past dates.' });
          setAvailableSlots([]);
          return;
        }

        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
          slots.push(`${hour}:00`);
          slots.push(`${hour}:30`);
        }

        const randomBusySlots = ['10:00', '11:30', '14:00']; // simulate busy
        const available = slots.filter(slot => !randomBusySlots.includes(slot));

        setAvailableSlots(available.map(slot => ({ value: slot, label: slot })));
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setMessage({ type: 'error', text: 'Failed to load available slots. Please try again.' });
      }
    };

    getAvailableSlots();
  }, [formData.doctorId, formData.date]);

  // Handle doctor selection
  const handleDoctorSelect = (doctorId) => {
    setFormData({ ...formData, doctorId });
    setStep(2);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setFormData({ ...formData, date });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    if (!formData.reason) newErrors.reason = 'Please provide a reason for your visit';
    return newErrors;
  };

  // Handle booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const appointmentData = {
        doctorId: formData.doctorId,
        date: `${formData.date}T${formData.timeSlot}:00`,
        reason: formData.reason
      };

      await API.post('/appointments', appointmentData);

      setBookingSuccess(true);
      setMessage({
        type: 'success',
        text: 'Appointment booked successfully! Confirmation sent to your email.'
      });

      setTimeout(() => navigate('/patient/appointments'), 3000);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to book appointment. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="book-consultation-container">
        <Navbar />
        <div className="book-consultation-content">
          <Sidebar />
          <main className="book-consultation-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading doctors and availability...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="book-consultation-container">
      <Navbar />
      <div className="book-consultation-content">
        <Sidebar />
        <main className="book-consultation-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📅 Book a Consultation</h1>
            <p className="hospital-subtitle">
              Schedule an appointment with one of our medical professionals
            </p>
          </div>

          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          <Card header="Book Your Appointment">
            {!bookingSuccess ? (
              <div className="booking-steps">
                {/* Step 1: Select Doctor */}
                {step === 1 && (
                  <div className="step-container">
                    <h3 className="step-title">Step 1: Select a Doctor</h3>
                    <div className="form-group">
                      <label className="form-label">Specialty (Optional)</label>
                      <CustomSelect
                        options={specialties}
                        value={formData.specialty}
                        onChange={(value) => setFormData({ ...formData, specialty: value })}
                        placeholder="Filter by specialty..."
                      />
                    </div>
                    <div className="doctors-grid">
                      {filteredDoctors.map(doctor => (
                        <div key={doctor._id} className="doctor-card">
                          <div className="doctor-info">
                            <h4 className="doctor-name">{doctor.name}</h4>
                            <p className="doctor-specialty">{doctor.specialty}</p>
                            <p className="doctor-department">{doctor.department}</p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDoctorSelect(doctor._id)}
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                    {filteredDoctors.length === 0 && (
                      <div className="no-doctors">
                        <p>No doctors found. Try changing your specialty filter.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Select Date & Time */}
                {step === 2 && (
                  <div className="step-container">
                    <h3 className="step-title">Step 2: Select Date & Time</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Select Date</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleDateSelect(e.target.value)}
                          className="date-input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.date && <p className="error-text">{errors.date}</p>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Select Time</label>
                        <CustomSelect
                          options={availableSlots}
                          value={formData.timeSlot}
                          onChange={(value) => setFormData({ ...formData, timeSlot: value })}
                          placeholder="Select a time slot..."
                        />
                        {errors.timeSlot && <p className="error-text">{errors.timeSlot}</p>}
                      </div>
                    </div>
                    {availableSlots.length > 0 && (
                      <div className="slots-info">
                        <p>Available slots for your selected date. Choose a convenient time.</p>
                      </div>
                    )}
                    <div className="step-actions">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        ← Back to Doctor Selection
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setStep(3)}
                        disabled={!formData.date || availableSlots.length === 0}
                      >
                        Next: Confirm Appointment →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm Appointment */}
                {step === 3 && (
                  <div className="step-container">
                    <h3 className="step-title">Step 3: Confirm Your Appointment</h3>
                    <div className="appointment-preview">
                      <div className="preview-item">
                        <strong>Doctor:</strong>
                        <span>{doctors.find(d => d._id === formData.doctorId)?.name}</span>
                      </div>
                      <div className="preview-item">
                        <strong>Specialty:</strong>
                        <span>{doctors.find(d => d._id === formData.doctorId)?.specialty}</span>
                      </div>
                      <div className="preview-item">
                        <strong>Date & Time:</strong>
                        <span>{formData.date} at {formData.timeSlot}</span>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Reason for Visit (Required)</label>
                        <textarea
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className="reason-textarea"
                          rows="4"
                          placeholder="Briefly describe why you're scheduling this appointment..."
                        />
                        {errors.reason && <p className="error-text">{errors.reason}</p>}
                      </div>
                    </div>
                    <div className="step-actions">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        ← Back to Date Selection
                      </Button>
                      <Button variant="primary" onClick={handleBookingSubmit}>
                        ✅ Confirm & Book Appointment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="booking-success">
                <div className="success-icon">✅</div>
                <h3>Appointment Booked Successfully!</h3>
                <p>Your appointment has been confirmed. A confirmation has been sent to your email.</p>
                <p>Thank you for choosing St. Mercy Hospital.</p>
                <Button variant="primary" onClick={() => navigate('/patient/appointments')}>
                  View My Appointments
                </Button>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}