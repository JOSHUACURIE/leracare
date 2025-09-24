// src/pages/admin/ManageDoctors.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './ManageDoctors.css';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byDepartment: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch doctors and stats
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const [doctorsRes, dutiesStatsRes, recommendationsStatsRes] = await Promise.all([
        API.get('/auth/admin/doctors'),
        API.get('/duties/admin/stats'),
        API.get('/recommendations/admin/stats')
      ]);

      setDoctors(doctorsRes.data);
      setStats({
        total: doctorsRes.data.length,
        active: doctorsRes.data.filter(d => !d.isDeleted).length,
        byDepartment: dutiesStatsRes.data.byDepartment || [],
        topPerformers: recommendationsStatsRes.data.mostRecommendedDoctors || []
      });
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

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    if (search && !doctor.name.toLowerCase().includes(search.toLowerCase()) &&
      !doctor.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Validate add form
  const validateAddForm = () => {
    const newErrors = {};
    if (!addForm.name) newErrors.name = 'Name is required';
    if (!addForm.email) newErrors.email = 'Email is required';
    if (!addForm.department) newErrors.department = 'Department is required';
    return newErrors;
  };

  // Handle add doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const formErrors = validateAddForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const res = await API.post('/auth/register-doctor', {
        name: addForm.name,
        email: addForm.email,
        phone: addForm.phone,
        department: addForm.department
      });

      // Add new doctor to list
      setDoctors([res.data, ...doctors]);

      // Reset form and close modal
      setAddForm({
        name: '',
        email: '',
        phone: '',
        department: ''
      });
      setErrors({});
      setShowAddModal(false);

      // Show success message
      setMessage({
        type: 'success',
        text: `Doctor ${res.data.name} created successfully! Temporary password: ${res.data.tempPassword}`
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 8000);

      // Refresh stats
      fetchDoctors();
    } catch (err) {
      console.error('Error adding doctor:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to add doctor. Please try again.'
      });
    }
  };

  // Handle toggle doctor status
  const handleToggleStatus = async (doctorId, currentStatus) => {
    try {
      await API.put(`/auth/admin/users/${doctorId}/toggle`);
      fetchDoctors(); // Refresh data
      setMessage({
        type: 'success',
        text: `Doctor ${currentStatus ? 'deactivated' : 'activated'} successfully!`
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      setMessage({
        type: 'error',
        text: 'Failed to update doctor status. Please try again.'
      });
    }
  };

  // Table columns
  const doctorColumns = [
    { key: 'name', label: 'Doctor Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'department',
      label: 'Department',
      render: (department) => (
        <span className="doctor-department">{department}</span>
      )
    },
    {
      key: 'isDeleted',
      label: 'Status',
      render: (isDeleted) => (
        <span className={`doctor-status doctor-status--${isDeleted ? 'inactive' : 'active'}`}>
          {isDeleted ? 'Inactive' : 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'Edit',
          variant: 'secondary',
          onClick: (doctor) => window.location.href = `/admin/doctors/${doctor._id}/edit`
        },
        {
          label: (doctor) => doctor.isDeleted ? 'Activate' : 'Deactivate',
          variant: (doctor) => doctor.isDeleted ? 'primary' : 'danger',
          onClick: (doctor) => handleToggleStatus(doctor._id, doctor.isDeleted)
        },
        {
          label: 'Assign Duty',
          variant: 'outline',
          onClick: (doctor) => window.location.href = `/admin/duties/assign?doctorId=${doctor._id}`
        },
        {
          label: 'Award Badge',
          variant: 'secondary',
          onClick: (doctor) => window.location.href = `/admin/recommend?doctorId=${doctor._id}`
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
              <p>Loading doctors...</p>
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
            <h1 className="hospital-title">👨‍⚕️ Manage Doctors</h1>
            <p className="hospital-subtitle">
              Add, edit, and manage your medical staff
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
            <Card variant="highlight" header="Total Doctors">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Across all departments</div>
            </Card>

            <Card variant="default" header="Active Doctors">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Currently working</div>
            </Card>

            <Card variant="alert" header="Top Performers">
              <div className="stat-value">{stats.topPerformers.length}</div>
              <div className="stat-label">Awarded recommendations</div>
            </Card>
          </div>

          {/* Search & Add Button */}
          <div className="hospital-actions">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<span>🔍</span>}
              className="search-input"
            />
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add New Doctor
            </Button>
          </div>

          {/* Doctors Table */}
          <Card header="All Doctors" className="table-card">
            <Table
              columns={doctorColumns}
              data={filteredDoctors}
              itemsPerPage={10}
              emptyMessage="No doctors found. Add your first doctor!"
            />
          </Card>

          {/* Department Stats */}
          {stats.byDepartment.length > 0 && (
            <Card header="Doctors by Department" className="department-card">
              <div className="department-stats">
                {stats.byDepartment.map((dept, index) => (
                  <div key={index} className="department-item">
                    <div className="department-name">{dept._id}</div>
                    <div className="department-count">{dept.count} doctors</div>
                    <div className="department-bar">
                      <div
                        className="department-bar-fill"
                        style={{
                          width: `${(dept.count / Math.max(...stats.byDepartment.map(d => d.count))) * 100}%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Add Doctor Modal */}
          {showAddModal && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Add New Doctor</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <form onSubmit={handleAddDoctor} className="add-doctor-form">
                    <div className="form-row">
                      <div className="form-group">
                        <Input
                          label="Full Name"
                          placeholder="e.g., Dr. Amina Patel"
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
                          placeholder="e.g., amina.patel@hospital.org"
                          value={addForm.email}
                          onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                          state={errors.email ? 'error' : 'default'}
                          helpText={errors.email || ''}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <Input
                          label="Phone (Optional)"
                          placeholder="e.g., +1234567890"
                          value={addForm.phone}
                          onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">

                      </div>
                    </div>
                    <div className="form-group">
                      <Input
                        label="Department"
                        placeholder="e.g., ER, Pediatrics, General Ward"
                        value={addForm.department}
                        onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                        state={errors.department ? 'error' : 'default'}
                        helpText={errors.department || ''}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <Button type="submit" variant="primary">Add Doctor</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </Button>
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