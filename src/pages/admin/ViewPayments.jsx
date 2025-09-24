// src/pages/admin/ViewPayments.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './ViewPayments.css';

export default function ViewPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    byStatus: [],
    byMonth: [],
    topPatients: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    patientId: '',
    search: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: 'paid',
    paymentMethod: 'stripe',
    notes: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch payments and stats
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        API.get('/payments/admin'),
        API.get('/payments/admin/stats')
      ]);

      setPayments(paymentsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setMessage({ type: 'error', text: 'Failed to load payments. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filters.status !== 'all' && payment.status !== filters.status) return false;
    if (filters.patientId && payment.patientId._id !== filters.patientId) return false;
    if (filters.dateFrom && new Date(payment.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(payment.createdAt) > new Date(filters.dateTo)) return false;
    if (filters.search && !payment.patientId?.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Handle update payment
  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/payments/${selectedPayment._id}`, updateForm);
      setPayments(payments.map(p => p._id === selectedPayment._id ? res.data.payment : p));
      setShowUpdateModal(false);
      setMessage({
        type: 'success',
        text: 'Payment updated successfully!'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error updating payment:', err);
      setMessage({
        type: 'error',
        text: 'Failed to update payment. Please try again.'
      });
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    try {
      const csvContent = [
        ['Invoice #', 'Patient', 'Doctor', 'Amount', 'Status', 'Date', 'Payment Method'],
        ...filteredPayments.map(payment => [
          payment.invoiceNumber,
          payment.patientId?.name || 'N/A',
          payment.appointmentId?.doctorId?.name || 'N/A',
          payment.amount,
          payment.status,
          new Date(payment.createdAt).toLocaleDateString(),
          payment.paymentMethod
        ])
      ].map(e => e.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setMessage({
        type: 'success',
        text: 'Payments exported successfully!'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setMessage({
        type: 'error',
        text: 'Failed to export payments. Please try again.'
      });
    }
  };

  // Table columns
  const paymentColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #'
    },
    {
      key: 'patientId',
      label: 'Patient',
      render: (patient) => patient?.name || 'N/A'
    },
    {
      key: 'appointmentId',
      label: 'Doctor',
      render: (appointment) => appointment?.doctorId?.name || 'N/A'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`payment-status payment-status--${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (method) => (
        <span className="payment-method">{method}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'View Details',
          variant: 'primary',
          onClick: (payment) => setSelectedPayment(payment)
        },
        {
          label: 'Update',
          variant: 'secondary',
          onClick: (payment) => {
            setSelectedPayment(payment);
            setUpdateForm({
              status: payment.status,
              paymentMethod: payment.paymentMethod,
              notes: payment.adminNotes || ''
            });
            setShowUpdateModal(true);
          }
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
              <p>Loading payments...</p>
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
            <h1 className="hospital-title">💰 View Payments</h1>
            <p className="hospital-subtitle">
              Manage and track all financial transactions
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
            <Card variant="highlight" header="Total Revenue">
              <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-label">All time</div>
            </Card>

            <Card variant="alert" header="Pending Payments">
              <div className="stat-value">
                ${stats.byStatus.find(s => s._id === 'pending')?.total?.toLocaleString() || '0'}
              </div>
              <div className="stat-label">
                {stats.byStatus.find(s => s._id === 'pending')?.count || 0} invoices
              </div>
            </Card>

            <Card variant="default" header="Paid This Month">
              <div className="stat-value">
                ${stats.byMonth.length > 0 ?
                  stats.byMonth[stats.byMonth.length - 1]?.total?.toLocaleString() || '0' : '0'}
              </div>
              <div className="stat-label">Current month</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="filters-card">
            <div className="hospital-filters">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="hospital-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
              <Input
                placeholder="Search by patient name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon={<span>🔍</span>}
              />
              <Button
                variant="primary"
                onClick={handleExportCSV}
              >
                📊 Export CSV
              </Button>
            </div>
          </Card>

          {/* Payments Table */}
          <Card header="All Payments">
            <Table
              columns={paymentColumns}
              data={filteredPayments}
              itemsPerPage={10}
              emptyMessage="No payments found. Try adjusting your filters."
            />
          </Card>

          {/* Payment Details Modal */}
          {selectedPayment && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Payment Details: {selectedPayment.invoiceNumber}</h3>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="payment-details">
                    <div className="detail-row">
                      <strong>Invoice Number:</strong>
                      <span>{selectedPayment.invoiceNumber}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Patient:</strong>
                      <span>{selectedPayment.patientId?.name}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Doctor:</strong>
                      <span>{selectedPayment.appointmentId?.doctorId?.name}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Amount:</strong>
                      <span className="amount">${selectedPayment.amount.toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Status:</strong>
                      <span className={`payment-status payment-status--${selectedPayment.status}`}>
                        {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Date:</strong>
                      <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Payment Method:</strong>
                      <span className="payment-method">{selectedPayment.paymentMethod}</span>
                    </div>
                    {selectedPayment.adminNotes && (
                      <div className="detail-row">
                        <strong>Admin Notes:</strong>
                        <span className="admin-notes">{selectedPayment.adminNotes}</span>
                      </div>
                    )}
                  </div>
                  <div className="modal-actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setUpdateForm({
                          status: selectedPayment.status,
                          paymentMethod: selectedPayment.paymentMethod,
                          notes: selectedPayment.adminNotes || ''
                        });
                        setShowUpdateModal(true);
                      }}
                    >
                      Update Payment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPayment(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Update Payment Modal */}
          {showUpdateModal && selectedPayment && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Update Payment: {selectedPayment.invoiceNumber}</h3>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <form onSubmit={handleUpdatePayment} className="update-payment-form">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={updateForm.status}
                        onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select
                        value={updateForm.paymentMethod}
                        onChange={(e) => setUpdateForm({ ...updateForm, paymentMethod: e.target.value })}
                        className="method-select"
                      >
                        <option value="stripe">Stripe (Online)</option>
                        <option value="paypal">PayPal</option>
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card (Terminal)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Admin Notes (Optional)</label>
                      <textarea
                        value={updateForm.notes}
                        onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                        className="admin-notes"
                        rows="3"
                        placeholder="Add notes about this payment update..."
                      />
                    </div>
                    <div className="form-actions">
                      <Button type="submit" variant="primary">Update Payment</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowUpdateModal(false)}
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