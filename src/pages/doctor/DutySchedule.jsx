// src/pages/doctor/DutySchedule.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './DutySchedule.css';

export default function DutySchedule() {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'upcoming',
    department: 'all',
    search: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch duties
  const fetchDuties = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/duties/doctor?range=${filters.range}`);
      setDuties(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching duties:', err);
      setMessage({ type: 'error', text: 'Failed to load duties. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, [filters.range]);

  // Filter duties
  const filteredDuties = duties.filter(duty => {
    if (filters.department !== 'all' && duty.department !== filters.department) return false;
    if (filters.search && !duty.department.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Handle cancel duty request
  const handleCancelDuty = async (dutyId) => {
    if (!window.confirm('Are you sure you want to request to cancel this duty? This will notify the admin.')) {
      return;
    }

    try {
      // In a real app, you'd send a message to admin
      // For now, we'll just show a message
      setMessage({ 
        type: 'success', 
        text: 'Cancellation request sent to admin. They will contact you soon.' 
      });
      
      // Simulate sending message to admin
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (err) {
      console.error('Error canceling duty:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to send cancellation request. Please try again.' 
      });
    }
  };

  // Table columns
  const dutyColumns = [
    { 
      key: 'department', 
      label: 'Department',
      render: (department) => (
        <span className="department-badge">{department}</span>
      )
    },
    { 
      key: 'startDate', 
      label: 'Start Date & Time',
      render: (date) => new Date(date).toLocaleString()
    },
    { 
      key: 'endDate', 
      label: 'End Date & Time',
      render: (date) => new Date(date).toLocaleString()
    },
    { 
      key: 'notes', 
      label: 'Notes',
      render: (notes) => (
        <div className="notes-text">{notes || 'No special notes'}</div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => (
        <span className={`duty-status duty-status--${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'Request Cancel',
          variant: 'danger',
          onClick: (duty) => handleCancelDuty(duty._id)
        },
        {
          label: 'Contact Admin',
          variant: 'outline',
          onClick: (duty) => window.location.href = '/doctor/message'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="duty-schedule-container">
        <Navbar />
        <div className="duty-schedule-content">
          <Sidebar />
          <main className="duty-schedule-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading duty schedule...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="duty-schedule-container">
      <Navbar />
      <div className="duty-schedule-content">
        <Sidebar />
        <main className="duty-schedule-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📅 Duty Schedule</h1>
            <p className="hospital-subtitle">
              View your assigned shifts and department rotations
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
            <Card variant="highlight" header="Total Duties">
              <div className="stat-value">{duties.length}</div>
              <div className="stat-label">All {filters.range} shifts</div>
            </Card>

            <Card variant="default" header="Active Duties">
              <div className="stat-value">{duties.filter(d => d.status === 'active').length}</div>
              <div className="stat-label">Currently scheduled</div>
            </Card>

            <Card variant="secondary" header="Departments">
              <div className="stat-value">
                {new Set(duties.map(d => d.department)).size}
              </div>
              <div className="stat-label">You're assigned to</div>
            </Card>
          </div>

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
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="all">All Departments</option>
                <option value="ER">ER</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Ward">General Ward</option>
                <option value="ICU">ICU</option>
                <option value="Surgery">Surgery</option>
              </select>
              <input
                type="text"
                placeholder="Search by department..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="hospital-search-input"
              />
            </div>
          </Card>

          {/* Duties Table */}
          <Card header={`Your Duty Schedule (${filteredDuties.length})`}>
            <Table
              columns={dutyColumns}
              data={filteredDuties}
              itemsPerPage={10}
              emptyMessage="No duties found for your selected filters."
            />
          </Card>

          {/* Upcoming Duties Calendar View */}
          {filters.range === 'upcoming' && duties.length > 0 && (
            <Card header="Upcoming Duties Calendar" className="calendar-card">
              <div className="calendar-view">
                {duties.slice(0, 7).map((duty, index) => (
                  <div key={index} className="calendar-item">
                    <div className="calendar-date">
                      <div className="date-day">{new Date(duty.startDate).getDate()}</div>
                      <div className="date-month">{new Date(duty.startDate).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div className="calendar-info">
                      <div className="calendar-department">{duty.department}</div>
                      <div className="calendar-time">
                        {new Date(duty.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(duty.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="calendar-status">
                        <span className={`duty-status duty-status--${duty.status}`}>
                          {duty.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}