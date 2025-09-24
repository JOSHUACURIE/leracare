// src/pages/admin/ComplaintInbox.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './ComplaintInbox.css';

export default function ComplaintInbox() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, byStatus: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    category: 'all',
    search: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyForm, setReplyForm] = useState({ status: 'reviewing', adminNotes: '' });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch complaints and stats
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const [complaintsRes, statsRes] = await Promise.all([
        API.get('/complaints/admin'),
        API.get('/complaints/admin/stats')
      ]);
      
      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setMessage({ type: 'error', text: 'Failed to load complaints. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    if (filters.status !== 'all' && complaint.status !== filters.status) return false;
    if (filters.type !== 'all' && complaint.type !== filters.type) return false;
    if (filters.category !== 'all' && complaint.category !== filters.category) return false;
    if (filters.search && !complaint.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Open reply modal
  const openReplyModal = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyForm({ 
      status: complaint.status, 
      adminNotes: complaint.adminNotes || '' 
    });
    setShowReplyModal(true);
  };

  // Handle reply submit
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/complaints/${selectedComplaint._id}`, replyForm);
      setShowReplyModal(false);
      fetchComplaints(); // Refresh data
      setMessage({ 
        type: 'success', 
        text: 'Complaint updated successfully!' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error updating complaint:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update complaint. Please try again.' 
      });
    }
  };

  // Archive complaint
  const handleArchive = async (complaintId) => {
    if (!window.confirm('Are you sure you want to archive this complaint?')) {
      return;
    }
    try {
      await API.delete(`/complaints/${complaintId}`);
      fetchComplaints();
      setMessage({ 
        type: 'success', 
        text: 'Complaint archived successfully!' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error archiving complaint:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to archive complaint. Please try again.' 
      });
    }
  };

  // Table columns
  const complaintColumns = [
    { 
      key: 'title', 
      label: 'Title',
      render: (title, complaint) => (
        <div>
          <div className="complaint-title">{title}</div>
          <div className="complaint-user">
            {complaint.userId?.name} ({complaint.userId?.role})
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (type) => (
        <span className={`complaint-badge complaint-badge--${type}`}>
          {type === 'complaint' ? 'Complaint' : 'Suggestion'}
        </span>
      )
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (category) => (
        <span className="complaint-category">{category}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => (
        <span className={`complaint-status complaint-status--${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'Reply',
          variant: 'primary',
          onClick: openReplyModal
        },
        {
          label: 'Archive',
          variant: 'danger',
          onClick: (complaint) => handleArchive(complaint._id)
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
              <p>Loading complaints...</p>
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
            <h1 className="hospital-title">📬 Complaints & Suggestions Inbox</h1>
            <p className="hospital-subtitle">
              Manage feedback from patients and staff
            </p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Stats Cards */}
          <div className="hospital-stats-grid mb-8">
            <Card variant="alert" header="Total Complaints">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Across all statuses</div>
            </Card>

            <Card variant="highlight" header="Unread Messages">
              <div className="stat-value">{stats.unread}</div>
              <div className="stat-label">Require your attention</div>
            </Card>

            <Card variant="default" header="Resolved">
              <div className="stat-value">
                {stats.byStatus.find(s => s._id === 'resolved')?.count || 0}
              </div>
              <div className="stat-label">Successfully addressed</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <div className="hospital-filters">
              
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="hospital-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="received">Received</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="hospital-filter-select"
              >
                <option value="all">All Types</option>
                <option value="complaint">Complaints</option>
                <option value="suggestion">Suggestions</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="hospital-filter-select"
              >
                <option value="all">All Categories</option>
                <option value="billing">Billing</option>
                <option value="service">Service</option>
                <option value="facility">Facility</option>
                <option value="staff">Staff</option>
                <option value="other">Other</option>
              </select>
            </div>
          </Card>

          {/* Complaints Table */}
          <Card header="Complaints & Suggestions">
            <Table
              columns={complaintColumns}
              data={filteredComplaints}
              itemsPerPage={10}
              emptyMessage="No complaints found. Try adjusting your filters."
            />
          </Card>

          {/* Reply Modal */}
          {showReplyModal && selectedComplaint && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Reply to: {selectedComplaint.title}</h3>
                  <button 
                    onClick={() => setShowReplyModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="complaint-details">
                    <p><strong>From:</strong> {selectedComplaint.userId?.name} ({selectedComplaint.userId?.role})</p>
                    <p><strong>Type:</strong> {selectedComplaint.type === 'complaint' ? 'Complaint' : 'Suggestion'}</p>
                    <p><strong>Category:</strong> {selectedComplaint.category}</p>
                    <p><strong>Description:</strong></p>
                    <p className="complaint-description">{selectedComplaint.description}</p>
                  </div>
                  <form onSubmit={handleReplySubmit} className="reply-form">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={replyForm.status}
                        onChange={(e) => setReplyForm({ ...replyForm, status: e.target.value })}
                        className="status-select"
                      >
                        <option value="received">Received</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Admin Notes (Internal)</label>
                      <textarea
                        value={replyForm.adminNotes}
                        onChange={(e) => setReplyForm({ ...replyForm, adminNotes: e.target.value })}
                        className="admin-notes"
                        rows="4"
                        placeholder="Add internal notes about how this was resolved..."
                      />
                    </div>
                    <div className="form-actions">
                      <Button type="submit" variant="primary">Update Complaint</Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowReplyModal(false)}
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