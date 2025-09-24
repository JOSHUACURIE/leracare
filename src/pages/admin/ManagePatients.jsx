// src/pages/admin/ManagePatients.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './ManagePatients.css';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, withUnpaidBills: 0, recentAppointments: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch patients, payments, and appointments
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const [patientsRes, paymentsStatsRes, appointmentsRes] = await Promise.all([
        API.get('/auth/admin/patients'),
        API.get('/payments/admin/stats'),
        API.get('/appointments/admin?status=scheduled')
      ]);

      const patientsData = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.patients || [];
      setPatients(patientsData);

      setStats({
        total: patientsData.length,
        active: patientsData.filter(p => !p.isDeleted).length,
        withUnpaidBills: paymentsStatsRes.data.byStatus?.find(s => s._id === 'pending')?.count || 0,
        recentAppointments: appointmentsRes.data?.length || 0
      });
    } catch (err) {
      console.error('Error fetching patients:', err);
      setMessage({ type: 'error', text: 'Failed to load patients. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    if (search && !patient.name.toLowerCase().includes(search.toLowerCase()) &&
        !patient.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Validate add form
  const validateAddForm = () => {
    const newErrors = {};
    if (!addForm.name) newErrors.name = 'Name is required';
    if (!addForm.email) newErrors.email = 'Email is required';
    return newErrors;
  };

  // Handle adding patient
  const handleAddPatient = async (e) => {
    e.preventDefault();
    const formErrors = validateAddForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register-patient', { name: addForm.name, email: addForm.email });
      const newPatient = res.data?.patient;
      if (newPatient) {
        setMessage({
          type: 'success',
          text: `Patient ${newPatient.name} created successfully! Temporary password: ${res.data.tempPassword || ''}`
        });
        setAddForm({ name: '', email: '' });
        setErrors({});
        setShowAddModal(false);
        await fetchPatients();
      } else {
        setMessage({ type: 'error', text: 'Failed to add patient: invalid response' });
      }
    } catch (err) {
      console.error('Error adding patient:', err);
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to add patient. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 8000);
    }
  };

  // Toggle patient status
  const handleToggleStatus = async (patientId, currentStatus) => {
    try {
      await API.put(`/auth/admin/users/${patientId}/toggle`);
      await fetchPatients();
      setMessage({ type: 'success', text: `Patient ${currentStatus ? 'deactivated' : 'activated'} successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error toggling patient status:', err);
      setMessage({ type: 'error', text: 'Failed to update patient status. Please try again.' });
    }
  };

  // Table columns
  const patientColumns = [
    { key: 'name', label: 'Patient Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: 'isDeleted',
      label: 'Status',
      render: (isDeleted) => (
        <span className={`patient-status patient-status--${isDeleted ? 'inactive' : 'active'}`}>
          {isDeleted ? 'Inactive' : 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: (patient) => [
        {
          label: 'View Profile',
          variant: 'primary',
          onClick: () => window.location.href = `/admin/patients/${patient._id}`
        },
        {
          label: patient.isDeleted ? 'Activate' : 'Deactivate',
          variant: patient.isDeleted ? 'primary' : 'danger',
          onClick: () => handleToggleStatus(patient._id, patient.isDeleted)
        },
        {
          label: 'Book Appointment',
          variant: 'outline',
          onClick: () => window.location.href = `/admin/appointments/book?patientId=${patient._id}`
        },
        {
          label: 'View Bills',
          variant: 'secondary',
          onClick: () => window.location.href = `/admin/payments?patientId=${patient._id}`
        }
      ]
    }
  ];

  if (loading) return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="hospital-loading">
            <div className="hospital-spinner"></div>
            <p>Loading patients...</p>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="hospital-header">
            <h1 className="hospital-title">❤️ Manage Patients</h1>
            <p className="hospital-subtitle">Add, edit, and manage your patients</p>
          </div>

          {message.text && <div className={`hospital-message hospital-message--${message.type}`}>{message.text}</div>}

          {/* Stats Cards */}
          <div className="hospital-stats-grid">
            <Card variant="highlight" header="Total Patients">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">In your system</div>
            </Card>
            <Card variant="default" header="Active Patients">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Currently receiving care</div>
            </Card>
            <Card variant="alert" header="Unpaid Bills">
              <div className="stat-value">{stats.withUnpaidBills}</div>
              <div className="stat-label">Require payment follow-up</div>
            </Card>
            <Card variant="secondary" header="Recent Appointments">
              <div className="stat-value">{stats.recentAppointments}</div>
              <div className="stat-label">Scheduled this week</div>
            </Card>
          </div>

          {/* Search & Add */}
          <div className="hospital-actions">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<span>🔍</span>}
              className="search-input"
            />
            <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>➕ Add New Patient</Button>
          </div>

          {/* Patients Table */}
          <Card header="All Patients" className="patients-table-card">
            <Table
              columns={patientColumns}
              data={filteredPatients}
              itemsPerPage={10}
              emptyMessage="No patients found. Add your first patient!"
            />
          </Card>

          {/* Add Patient Modal */}
          {showAddModal && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Add New Patient</h3>
                  <button onClick={() => setShowAddModal(false)} className="hospital-modal-close">✕</button>
                </div>
                <div className="hospital-modal-body">
                  <form onSubmit={handleAddPatient} className="add-patient-form">
                    <div className="form-row">
                      <div className="form-group">
                        <Input
                          label="Full Name"
                          placeholder="e.g., John Doe"
                          value={addForm.name}
                          onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                          state={errors.name ? 'error' : 'default'}
                          helpText={errors.name || ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Email"
                          type="email"
                          placeholder="e.g., john.doe@example.com"
                          value={addForm.email}
                          onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                          state={errors.email ? 'error' : 'default'}
                          helpText={errors.email || ''}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <Button type="submit" variant="primary">Add Patient</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}