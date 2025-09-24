// src/pages/patient/Appointments.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './Appointments.css';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/appointments/patient');
      setAppointments(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setMessage({ type: 'error', text: 'Failed to load appointments. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (filters.status !== 'all' && appointment.status !== filters.status) return false;
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const appointmentDate = new Date(appointment.date);
      if (filters.dateRange === 'upcoming' && appointmentDate < now) return false;
      if (filters.dateRange === 'past' && appointmentDate >= now) return false;
    }
    if (filters.search && !appointment.doctorId?.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    try {
      await API.delete(`/appointments/${selectedAppointment._id}`);
      fetchAppointments(); // Refresh data
      setShowCancelModal(false);
      setMessage({ 
        type: 'success', 
        text: 'Appointment cancelled successfully!' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to cancel appointment. Please try again.' 
      });
    }
  };

  // Table columns
  const appointmentColumns = [
    { 
      key: 'doctorId', 
      label: 'Doctor',
      render: (doctor) => doctor?.name || 'N/A'
    },
    { 
      key: 'reason', 
      label: 'Reason for Visit',
      render: (reason) => (
        <div className="reason-text">{reason}</div>
      )
    },
    { 
      key: 'date', 
      label: 'Appointment Time',
      render: (date) => new Date(date).toLocaleString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => (
        <span className={`appointment-status appointment-status--${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'View Details',
          variant: 'primary',
          onClick: (appointment) => setSelectedAppointment(appointment)
        },
        {
          label: 'Cancel',
          variant: 'danger',
          onClick: (appointment) => {
            if (appointment.status === 'completed') {
              setMessage({ 
                type: 'error', 
                text: 'Cannot cancel completed appointment.' 
              });
              return;
            }
            setSelectedAppointment(appointment);
            setShowCancelModal(true);
          }
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="appointments-container">
        <Navbar />
        <div className="appointments-content">
          <Sidebar />
          <main className="appointments-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading your appointments...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <Navbar />
      <div className="appointments-content">
        <Sidebar />
        <main className="appointments-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📅 My Appointments</h1>
            <p className="hospital-subtitle">
              View and manage your scheduled medical appointments
            </p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Stats Cards */}
          <div className="hospital-stats-grid">
            <Card variant="highlight" header="Total Appointments">
              <div className="stat-value">{appointments.length}</div>
              <div className="stat-label">Across all time</div>
            </Card>

            <Card variant="default" header="Upcoming">
              <div className="stat-value">
                {appointments.filter(a => {
                  const now = new Date();
                  const appointmentDate = new Date(a.date);
                  return appointmentDate >= now && a.status === 'scheduled';
                }).length}
              </div>
              <div className="stat-label">Scheduled appointments</div>
            </Card>

            <Card variant="secondary" header="Completed">
              <div className="stat-value">
                {appointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="stat-label">Past consultations</div>
            </Card>
          </div>

          {/* Action Button */}
          <div className="hospital-actions">
            <Link to="/patient/book">
              <Button variant="primary" size="lg">
                ➕ Book New Consultation
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="filters-card">
            <div className="hospital-filters">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="hospital-search-input"
              />
            </div>
          </Card>

          {/* Appointments Table */}
          <Card header="My Appointments">
            <Table
              columns={appointmentColumns}
              data={filteredAppointments}
              itemsPerPage={10}
              emptyMessage="No appointments found. Book your first consultation!"
            />
          </Card>

          {/* Appointment Details Modal */}
          {selectedAppointment && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Appointment Details</h3>
                  <button 
                    onClick={() => setSelectedAppointment(null)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="appointment-details">
                    <div className="detail-row">
                      <strong>Doctor:</strong>
                      <span>{selectedAppointment.doctorId?.name}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Specialty:</strong>
                      <span>{selectedAppointment.doctorId?.specialty || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Reason for Visit:</strong>
                      <span>{selectedAppointment.reason}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Appointment Time:</strong>
                      <span>{new Date(selectedAppointment.date).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Status:</strong>
                      <span className={`appointment-status appointment-status--${selectedAppointment.status}`}>
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                      </span>
                    </div>
                    {selectedAppointment.notes && (
                      <div className="detail-row">
                        <strong>Doctor Notes:</strong>
                        <span className="doctor-notes">{selectedAppointment.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="modal-actions">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedAppointment(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Appointment Modal */}
          {showCancelModal && selectedAppointment && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Cancel Appointment</h3>
                  <button 
                    onClick={() => setShowCancelModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="cancel-warning">
                    <div className="warning-icon">⚠️</div>
                    <h4>Are you sure you want to cancel this appointment?</h4>
                    <p>
                      You are about to cancel your appointment with{' '}
                      <strong>{selectedAppointment.doctorId?.name}</strong> on{' '}
                      <strong>{new Date(selectedAppointment.date).toLocaleString()}</strong>.
                    </p>
                    <p className="warning-text">
                      This action cannot be undone. You will need to book a new appointment if you wish to reschedule.
                    </p>
                  </div>
                  <div className="modal-actions">
                    <Button 
                      variant="danger"
                      onClick={handleCancelAppointment}
                    >
                      Yes, Cancel Appointment
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCancelModal(false)}
                    >
                      No, Keep Appointment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}