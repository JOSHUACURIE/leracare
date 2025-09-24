// src/pages/doctor/AssignedPatients.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './AssignedPatients.css';

export default function AssignedPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'today',
    status: 'all',
    search: ''
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch assigned patients
  const fetchAssignedPatients = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/appointments/doctor?range=${filters.range}`);
      setPatients(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setMessage({ type: 'error', text: 'Failed to load patients. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPatients();
  }, [filters.range]);

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    if (filters.status !== 'all' && patient.status !== filters.status) return false;
    if (filters.search && !patient.patientId?.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Handle complete appointment
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await API.put(`/appointments/${appointmentId}`, { status: 'completed' });
      fetchAssignedPatients(); // Refresh data
      setMessage({ 
        type: 'success', 
        text: 'Appointment marked as completed!' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error completing appointment:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to complete appointment. Please try again.' 
      });
    }
  };

  // Handle write report
  const handleWriteReport = (appointment) => {
    setSelectedPatient(appointment);
    setShowReportModal(true);
  };

  // Table columns
  const patientColumns = [
    { 
      key: 'patientId', 
      label: 'Patient',
      render: (patient) => patient?.name || 'N/A'
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
          label: 'Complete',
          variant: 'primary',
          onClick: (appointment) => handleCompleteAppointment(appointment._id)
        },
        {
          label: 'Write Report',
          variant: 'secondary',
          onClick: handleWriteReport
        },
        {
          label: 'View History',
          variant: 'outline',
          onClick: (appointment) => window.location.href = `/doctor/patients/${appointment.patientId?._id}/history`
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="assigned-patients-container">
        <Navbar />
        <div className="assigned-patients-content">
          <Sidebar />
          <main className="assigned-patients-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading assigned patients...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="assigned-patients-container">
      <Navbar />
      <div className="assigned-patients-content">
        <Sidebar />
        <main className="assigned-patients-main">
          <div className="hospital-header">
            <h1 className="hospital-title">👥 Assigned Patients</h1>
            <p className="hospital-subtitle">
              Manage your scheduled appointments for {filters.range}
            </p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Filters */}
          <Card className="filters-card">
            <div className="hospital-filters">
              <select
                value={filters.range}
                onChange={(e) => setFilters({ ...filters, range: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="upcoming">Upcoming</option>
              </select>
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
              <input
                type="text"
                placeholder="Search by patient name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="hospital-search-input"
              />
            </div>
          </Card>

          {/* Patients Table */}
          <Card header={`Assigned Patients (${filteredPatients.length})`}>
            <Table
              columns={patientColumns}
              data={filteredPatients}
              itemsPerPage={10}
              emptyMessage="No patients found for your selected filters."
            />
          </Card>

          {/* Write Report Modal */}
          {showReportModal && selectedPatient && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Write Report for {selectedPatient.patientId?.name}</h3>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="patient-info">
                    <p><strong>Reason for Visit:</strong> {selectedPatient.reason}</p>
                    <p><strong>Appointment Time:</strong> {new Date(selectedPatient.date).toLocaleString()}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setShowReportModal(false);
                      window.location.href = `/doctor/reports/new?appointmentId=${selectedPatient._id}`;
                    }}
                  >
                    📝 Start Writing Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}