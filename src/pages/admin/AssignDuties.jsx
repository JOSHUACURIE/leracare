// src/pages/admin/AssignDuties.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './AssignDuties.css';

export default function AssignDuties() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    doctorId: '',
    doctorName: '',
    department: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  // Fetch doctors and duties on load
  useEffect(() => {
    Promise.all([
      API.get('/auth/admin/users?role=doctor'),
      API.get('/duties/admin')
    ])
    .then(([doctorsRes, dutiesRes]) => {
      setDoctors(doctorsRes.data);
      setFilteredDoctors(doctorsRes.data);
      setDuties(dutiesRes.data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      setMessage({ type: 'error', text: 'Failed to load data. Please refresh.' });
      setLoading(false);
    });
  }, []);

  // Handle doctor search
  const handleDoctorSearch = (value) => {
    setForm({ ...form, doctorName: value, doctorId: '' });
    if (value) {
      const filtered = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
      setShowDoctorDropdown(true);
    } else {
      setFilteredDoctors(doctors);
      setShowDoctorDropdown(false);
    }
  };

  // Select doctor from dropdown
  const selectDoctor = (doctor) => {
    setForm({ 
      ...form, 
      doctorId: doctor._id, 
      doctorName: doctor.name 
    });
    setShowDoctorDropdown(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!form.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    
    if (form.startDate && form.endDate) {
      if (new Date(form.startDate) >= new Date(form.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

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
      const dutyData = {
        doctorId: form.doctorId,
        department: form.department,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes
      };

      const res = await API.post('/duties', dutyData);
      
      // Add new duty to list
      setDuties([res.data.duty, ...duties]);
      
      // Reset form
      setForm({
        doctorId: '',
        doctorName: '',
        department: '',
        startDate: '',
        endDate: '',
        notes: ''
      });
      
      // Show success message
      setMessage({ 
        type: 'success', 
        text: `Duty assigned to Dr. ${res.data.duty.doctorId.name} successfully!` 
      });
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error assigning duty:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.msg || 'Failed to assign duty. Please try again.' 
      });
    }
  };

  // Handle duty cancellation
  const handleCancelDuty = async (dutyId) => {
    if (!window.confirm('Are you sure you want to cancel this duty?')) {
      return;
    }

    try {
      await API.delete(`/duties/${dutyId}`);
      setDuties(duties.filter(duty => duty._id !== dutyId));
      setMessage({ 
        type: 'success', 
        text: 'Duty cancelled successfully!' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error cancelling duty:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to cancel duty. Please try again.' 
      });
    }
  };

  // Table columns for duties
  const dutyColumns = [
    { 
      key: 'doctorId', 
      label: 'Doctor', 
      render: (doctor) => doctor?.name || 'N/A' 
    },
    { key: 'department', label: 'Department' },
    { 
      key: 'startDate', 
      label: 'Start Date', 
      render: (date) => new Date(date).toLocaleString() 
    },
    { 
      key: 'endDate', 
      label: 'End Date', 
      render: (date) => new Date(date).toLocaleString() 
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'Cancel',
          variant: 'danger',
          onClick: (duty) => handleCancelDuty(duty._id)
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="admin-layout">
        <Navbar />
        <div className="admin-content">
          <Sidebar />
          <main className="admin-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading doctors and duties...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📅 Assign Doctor Duties</h1>
            <p className="hospital-subtitle">
              Schedule doctors to departments and shifts
            </p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Assign Duty Form */}
          <Card header="Assign New Duty" className="mb-8">
            <form onSubmit={handleSubmit} className="hospital-form">
              <div className="hospital-form-row">
                <div className="hospital-form-group">
                  <div className="hospital-doctor-search">
                    <Input
                      label="Doctor"
                      placeholder="Search by name..."
                      value={form.doctorName}
                      onChange={(e) => handleDoctorSearch(e.target.value)}
                      state={errors.doctorId ? 'error' : 'default'}
                      helpText={errors.doctorId || ''}
                      required
                    />
                    {showDoctorDropdown && filteredDoctors.length > 0 && (
                      <div className="hospital-doctor-dropdown">
                        {filteredDoctors.map((doctor) => (
                          <div
                            key={doctor._id}
                            className="hospital-doctor-item"
                            onClick={() => selectDoctor(doctor)}
                          >
                            {doctor.name} - {doctor.email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hospital-form-group">
                  <Input
                    label="Department"
                    placeholder="e.g., Pediatrics, ER, General Ward"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    state={errors.department ? 'error' : 'default'}
                    helpText={errors.department || ''}
                    required
                  />
                </div>
              </div>

              <div className="hospital-form-row">
                <div className="hospital-form-group">
                  <Input
                    label="Start Date & Time"
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    state={errors.startDate ? 'error' : 'default'}
                    helpText={errors.startDate || ''}
                    required
                  />
                </div>

                <div className="hospital-form-group">
                  <Input
                    label="End Date & Time"
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    state={errors.endDate ? 'error' : 'default'}
                    helpText={errors.endDate || ''}
                    required
                  />
                </div>
              </div>

              <div className="hospital-form-group">
                <Input
                  label="Notes (Optional)"
                  placeholder="e.g., Covering for Dr. Smith"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  type="textarea"
                  rows="3"
                />
              </div>

              <div className="hospital-form-actions">
                <Button type="submit" variant="primary" size="lg">
                  Assign Duty
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setForm({
                    doctorId: '',
                    doctorName: '',
                    department: '',
                    startDate: '',
                    endDate: '',
                    notes: ''
                  })}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Card>

          {/* Current Duties Table */}
          <Card header="Current Duties">
            <Table
              columns={dutyColumns}
              data={duties.filter(duty => duty.status === 'active')}
              itemsPerPage={10}
              emptyMessage="No active duties found. Assign a duty to get started!"
            />
          </Card>
        </main>
      </div>
    </div>
  );
}