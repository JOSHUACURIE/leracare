// src/pages/patient/Payments.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './Payment.css';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/payments');
      setPayments(res.data);
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
    if (filters.search && !payment.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.dateRange !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      
      if (filters.dateRange === 'last7days') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        if (paymentDate < sevenDaysAgo) return false;
      } else if (filters.dateRange === 'last30days') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        if (paymentDate < thirtyDaysAgo) return false;
      } else if (filters.dateRange === 'thisyear') {
        const thisYear = now.getFullYear();
        if (paymentDate.getFullYear() !== thisYear) return false;
      }
    }
    
    return true;
  });

  // Handle pay bill
  const handlePayBill = async (paymentId) => {
    const selectedPayment = payments.find(p => p._id === paymentId);
    setSelectedPayment(selectedPayment);
    setShowPaymentModal(true);
  };

  // Handle STK Push (Simulated)
  const handleSTKPush = async () => {
    if (!phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter your phone number' });
      return;
    }

    try {
      setMessage({ 
        type: 'info', 
        text: 'Initiating... Please check your phone for M-Pesa prompt.' 
      });

      // Simulate STK Push API call (replace with Daraja API in production)
      setTimeout(async () => {
        try {
          // In production, you'd call your backend endpoint that integrates with Daraja API
          // Example: await API.post('/payments/mpesa', { paymentId: selectedPayment._id, phoneNumber })
          
          // Simulate successful payment
          await API.put(`/payments/${selectedPayment._id}/pay`);
          fetchPayments(); // Refresh data
          setShowPaymentModal(false);
          setMessage({ 
            type: 'success', 
            text: 'Payment successful! Receipt sent to your email.' 
          });
        } catch (err) {
          setMessage({ 
            type: 'error', 
            text: 'Payment failed. Please try again or contact support.' 
          });
        }
      }, 3000);
    } catch (err) {
      console.error('Error processing payment:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to process payment. Please try again.' 
      });
    }
  };

  // Handle Stripe Payment (Simulated)
  const handleStripePayment = async () => {
    try {
      setMessage({ 
        type: 'info', 
        text: 'Redirecting to secure payment page...' 
      });

      // Simulate Stripe redirect (in production, use Stripe.js)
      setTimeout(async () => {
        try {
          await API.put(`/payments/${selectedPayment._id}/pay`);
          fetchPayments(); // Refresh data
          setShowPaymentModal(false);
          setMessage({ 
            type: 'success', 
            text: 'Payment successful! Receipt sent to your email.' 
          });
        } catch (err) {
          setMessage({ 
            type: 'error', 
            text: 'Payment failed. Please try again or contact support.' 
          });
        }
      }, 2000);
    } catch (err) {
      console.error('Error processing payment:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to process payment. Please try again.' 
      });
    }
  };

  // Handle Cash Payment (Simulated)
  const handleCashPayment = async () => {
    try {
      setMessage({ 
        type: 'info', 
        text: 'Processing cash payment...' 
      });

      // Simulate cash payment
      setTimeout(async () => {
        try {
          await API.put(`/payments/${selectedPayment._id}`, {
            status: 'paid',
            paymentMethod: 'cash'
          });
          fetchPayments(); // Refresh data
          setShowPaymentModal(false);
          setMessage({ 
            type: 'success', 
            text: 'Cash payment recorded! Receipt sent to your email.' 
          });
        } catch (err) {
          setMessage({ 
            type: 'error', 
            text: 'Failed to record payment. Please try again.' 
          });
        }
      }, 1500);
    } catch (err) {
      console.error('Error processing payment:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to process payment. Please try again.' 
      });
    }
  };

  if (loading) {
    return (
      <div className="payments-container">
        <Navbar />
        <div className="payments-content">
          <Sidebar />
          <main className="payments-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading your payments...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <Navbar />
      <div className="payments-content">
        <Sidebar />
        <main className="payments-main">
          <div className="hospital-header">
            <h1 className="hospital-title">💰 My Payments</h1>
            <p className="hospital-subtitle">
              View and pay your medical bills securely
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
            <Card variant="highlight" header="Total Bills">
              <div className="stat-value">{payments.length}</div>
              <div className="stat-label">Across all time</div>
            </Card>

            <Card variant="alert" header="Unpaid Bills">
              <div className="stat-value">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <div className="stat-label">Require payment</div>
            </Card>

            <Card variant="default" header="Paid Bills">
              <div className="stat-value">
                {payments.filter(p => p.status === 'paid').length}
              </div>
              <div className="stat-label">Successfully paid</div>
            </Card>

            <Card variant="secondary" header="Total Spent">
              <div className="stat-value">
                ${payments
                  .filter(p => p.status === 'paid')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}
              </div>
              <div className="stat-label">All time</div>
            </Card>
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
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="all">All Dates</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisyear">This Year</option>
              </select>
              <input
                type="text"
                placeholder="Search by invoice #..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="hospital-search-input"
              />
            </div>
          </Card>

          {/* Payments Table */}
          <Card header="My Payments">
            <Table
              columns={[
                { 
                  key: 'invoiceNumber', 
                  label: 'Invoice #'
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
                    <span className="payment-method">
                      {method === 'stripe' ? '💳 Card' : 
                       method === 'mpesa' ? '📱 M-Pesa' : 
                       method === 'cash' ? '💵 Cash' : 'N/A'}
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
                      onClick: (payment) => setSelectedPayment(payment)
                    },
                    {
                      label: 'Pay Now',
                      variant: 'danger',
                      onClick: handlePayBill,
                      disabled: (payment) => payment.status !== 'pending'
                    },
                    {
                      label: 'Download Receipt',
                      variant: 'outline',
                      onClick: (payment) => window.location.href = `/api/payments/${payment._id}/receipt`,
                      disabled: (payment) => payment.status !== 'paid'
                    }
                  ]
                }
              ]}
              data={filteredPayments}
              itemsPerPage={10}
              emptyMessage="No payments found. Try adjusting your filters."
            />
          </Card>

          {/* Payment Modal */}
          {showPaymentModal && selectedPayment && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Pay Bill #{selectedPayment.invoiceNumber}</h3>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="payment-details">
                    <div className="detail-row">
                      <strong>Amount:</strong>
                      <span className="amount">${selectedPayment.amount.toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <strong>For:</strong>
                      <span>Medical services on {new Date(selectedPayment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="payment-methods">
                    <h4 className="section-title">Select Payment Method</h4>
                    
                    <div className="method-option">
                      <input
                        type="radio"
                        id="mpesa"
                        name="paymentMethod"
                        checked={paymentMethod === 'mpesa'}
                        onChange={() => setPaymentMethod('mpesa')}
                      />
                      <label htmlFor="mpesa" className="method-label">
                        <span className="method-icon">📱</span>
                        <span className="method-text">
                          <strong>M-Pesa</strong>
                          <br />
                          <small>Pay via Safaricom M-Pesa</small>
                        </span>
                      </label>
                    </div>

                    {paymentMethod === 'mpesa' && (
                      <div className="phone-input">
                        <label htmlFor="phoneNumber">Enter M-Pesa Phone Number</label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          placeholder="e.g., 2547XXXXXXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="phone-field"
                        />
                      </div>
                    )}

                    <div className="method-option">
                      <input
                        type="radio"
                        id="stripe"
                        name="paymentMethod"
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                      />
                      <label htmlFor="stripe" className="method-label">
                        <span className="method-icon">💳</span>
                        <span className="method-text">
                          <strong>Credit/Debit Card</strong>
                          <br />
                          <small>Pay via secure card payment</small>
                        </span>
                      </label>
                    </div>

                    <div className="method-option">
                      <input
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <label htmlFor="cash" className="method-label">
                        <span className="method-icon">💵</span>
                        <span className="method-text">
                          <strong>Cash Payment</strong>
                          <br />
                          <small>Pay at hospital front desk</small>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="modal-actions">
                    {paymentMethod === 'mpesa' && (
                      <Button
                        variant="primary"
                        onClick={handleSTKPush}
                        disabled={!phoneNumber}
                      >
                        📱 Initiate Mpesa
                      </Button>
                    )}
                    {paymentMethod === 'stripe' && (
                      <Button
                        variant="primary"
                        onClick={handleStripePayment}
                      >
                        💳 Pay with Card
                      </Button>
                    )}
                    {paymentMethod === 'cash' && (
                      <Button
                        variant="primary"
                        onClick={handleCashPayment}
                      >
                        💵 Record Cash Payment
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentModal(false)}
                    >
                      Cancel
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