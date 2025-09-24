// src/pages/doctor/MessageAdmin.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './MessageAdmin.css';

export default function MessageAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeForm, setComposeForm] = useState({
    subject: '',
    body: '',
    category: 'clinical',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch sent messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get('/messages/sent');
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessage({ type: 'error', text: 'Failed to load messages. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Validate compose form
  const validateForm = () => {
    const newErrors = {};
    if (!composeForm.subject) newErrors.subject = 'Subject is required';
    if (!composeForm.body) newErrors.body = 'Message body is required';
    return newErrors;
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const res = await API.post('/messages', {
        subject: composeForm.subject,
        body: composeForm.body,
        category: composeForm.category,
        priority: composeForm.priority
      });
      
      // Add new message to list
      setMessages([res.data.message, ...messages]);
      
      // Reset form and close modal
      setComposeForm({
        subject: '',
        body: '',
        category: 'clinical',
        priority: 'medium'
      });
      setErrors({});
      setShowComposeModal(false);
      
      // Show success message
      setMessage({ 
        type: 'success', 
        text: 'Message sent to admin successfully!' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.msg || 'Failed to send message. Please try again.' 
      });
    }
  };

  const messageColumns = [
    { 
      key: 'subject', 
      label: 'Subject',
      render: (subject) => (
        <div className="message-subject">{subject || ''}</div>
      )
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (category) => (
        <span className={`category-badge category-badge--${category || 'other'}`}>
          {(category || 'Other').charAt(0).toUpperCase() + (category || 'Other').slice(1)}
        </span>
      )
    },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (priority) => (
        <span className={`priority-badge priority-badge--${priority || 'medium'}`}>
          {(priority || 'Medium').charAt(0).toUpperCase() + (priority || 'Medium').slice(1)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => (
        <span className={`message-status message-status--${status || 'unread'}`}>
          {(status || 'Unread').charAt(0).toUpperCase() + (status || 'Unread').slice(1)}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Sent',
      render: (date) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'View Details',
          variant: 'primary',
          onClick: (message) => window.location.href = `/doctor/messages/${message._id}`
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="message-admin-container">
        <Navbar />
        <div className="message-admin-content">
          <Sidebar />
          <main className="message-admin-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading messages...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="message-admin-container">
      <Navbar />
      <div className="message-admin-content">
        <Sidebar />
        <main className="message-admin-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📩 Message Admin</h1>
            <p className="hospital-subtitle">
              Send messages to hospital administration for help or support
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
            <Card variant="highlight" header="Total Messages">
              <div className="stat-value">{messages.length}</div>
              <div className="stat-label">You've sent to admin</div>
            </Card>

            <Card variant="alert" header="Unread Messages">
              <div className="stat-value">{messages.filter(m => m.status === 'unread').length}</div>
              <div className="stat-label">Awaiting admin response</div>
            </Card>

            <Card variant="default" header="High Priority">
              <div className="stat-value">{messages.filter(m => m.priority === 'high').length}</div>
              <div className="stat-label">Urgent matters</div>
            </Card>
          </div>

          {/* Compose Button */}
          <div className="hospital-actions">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowComposeModal(true)}
            >
              ✉️ Compose New Message
            </Button>
          </div>

          {/* Sent Messages Table */}
          <Card header="Your Sent Messages" className="messages-table-card">
            <Table
              columns={messageColumns}
              data={messages}
              itemsPerPage={10}
              emptyMessage="No messages sent yet. Compose your first message!"
            />
          </Card>

          {/* Compose Message Modal */}
          {showComposeModal && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Compose Message to Admin</h3>
                  <button 
                    onClick={() => setShowComposeModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <form onSubmit={handleSendMessage} className="compose-form">
                    <div className="form-group">
                      <Input
                        label="Subject"
                        placeholder="e.g., Can't Treat Rare Skin Condition"
                        value={composeForm.subject}
                        onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                        state={errors.subject ? 'error' : 'default'}
                        helpText={errors.subject || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message Body</label>
                      <textarea
                        value={composeForm.body}
                        onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                        className="message-body"
                        rows="6"
                        placeholder="Describe your issue or request in detail..."
                        required
                      />
                      {errors.body && (
                        <p className="error-text">{errors.body}</p>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                          value={composeForm.category}
                          onChange={(e) => setComposeForm({ ...composeForm, category: e.target.value })}
                          className="category-select"
                        >
                          <option value="clinical">Clinical</option>
                          <option value="scheduling">Scheduling</option>
                          <option value="urgent">Urgent</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select
                          value={composeForm.priority}
                          onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value })}
                          className="priority-select"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <Button type="submit" variant="primary">Send Message</Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowComposeModal(false)}
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