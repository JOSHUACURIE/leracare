// src/pages/patient/PatientDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    unpaidBills: 0,
    availableReports: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel (no messages)
      const [appointmentsRes, reportsRes, paymentsRes] = await Promise.all([
        API.get('/appointments/patient'),
        API.get('/reports/patient'),
        API.get('/payments')
      ]);

      // Calculate stats
      const now = new Date();
      const upcomingAppointments = appointmentsRes.data.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate >= now && a.status === 'scheduled';
      }).length;

      const unpaidBills = paymentsRes.data.filter(p => p.status === 'pending').length;
      const availableReports = reportsRes.data.length;

      setStats({
        upcomingAppointments,
        unpaidBills,
        availableReports
      });

      // Set recent data
      setRecentAppointments(appointmentsRes.data.slice(0, 3));
      setRecentReports(reportsRes.data.slice(0, 3));
      setRecentPayments(paymentsRes.data.slice(0, 3));

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard ', err);
      setError('Failed to load dashboard data. Please refresh.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="patient-dashboard-container">
        <Navbar />
        <div className="patient-dashboard-content">
          <Sidebar />
          <main className="patient-dashboard-main">
            <div className="hospital-dashboard-loading">
              <div className="hospital-dashboard-spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-dashboard-container">
        <Navbar />
        <div className="patient-dashboard-content">
          <Sidebar />
          <main className="patient-dashboard-main">
            <div className="hospital-dashboard-error">
              <div className="hospital-dashboard-error-icon">⚠️</div>
              <p>{error}</p>
              <Button onClick={fetchDashboardData} variant="primary">
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Recent Appointments Table Columns
  const appointmentColumns = [
    {
      key: 'doctorId',
      label: 'Doctor',
      render: (doctor) => doctor?.name || 'N/A'
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`status-badge status-badge--${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    }
  ];

  // Recent Reports Table Columns
  const reportColumns = [
    {
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (diagnosis) => (
        <div className="diagnosis-text">{diagnosis}</div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'View',
          variant: 'primary',
          onClick: (report) =>
            (window.location.href = `/patient/reports/${report._id}`)
        },
        {
          label: 'Download',
          variant: 'outline',
          onClick: (report) =>
            (window.location.href = `/api/reports/${report._id}/pdf`)
        }
      ]
    }
  ];

  // Recent Payments Table Columns
  const paymentColumns = [
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
        <span className={`status-badge status-badge--${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div className="patient-dashboard-container">
      <Navbar />
      <div className="patient-dashboard-content">
        <Sidebar />
        <main className="patient-dashboard-main">
          {/* Welcome Header */}
          <div className="hospital-dashboard-header">
            <h1 className="hospital-dashboard-title">
              🏥 Welcome to Your Patient Dashboard
            </h1>
            <p className="hospital-dashboard-subtitle">
              Manage your appointments, view medical reports, and handle payments
            </p>
          </div>

          {/* Stats Grid */}
          <div className="hospital-dashboard-stats-grid">
            <Card variant="highlight" header="Upcoming Appointments">
              <div className="stat-value">{stats.upcomingAppointments}</div>
              <div className="stat-trend">Scheduled visits</div>
              <Link to="/patient/appointments">
                <Button variant="outline" size="sm" className="stat-button">
                  View All
                </Button>
              </Link>
            </Card>

            <Card variant="alert" header="Unpaid Bills">
              <div className="stat-value">{stats.unpaidBills}</div>
              <div className="stat-trend">Requires payment</div>
              <Link to="/patient/payments">
                <Button variant="danger" size="sm" className="stat-button">
                  Pay Now
                </Button>
              </Link>
            </Card>

            <Card variant="default" header="Available Reports">
              <div className="stat-value">{stats.availableReports}</div>
              <div className="stat-trend">Medical documentation</div>
              <Link to="/patient/reports">
                <Button variant="secondary" size="sm" className="stat-button">
                  View All
                </Button>
              </Link>
            </Card>

            <Card variant="secondary" header="Health Resources">
              <div className="stat-value">50+</div>
              <div className="stat-trend">Educational articles</div>
              <Link to="/patient/health">
                <Button variant="outline" size="sm" className="stat-button">
                  Read Articles
                </Button>
              </Link>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="hospital-dashboard-section">
            <h2 className="hospital-dashboard-section-title">Quick Actions</h2>
            <div className="hospital-dashboard-actions">
              <Link to="/patient/book">
                <Button variant="primary" size="lg" className="action-btn">
                  📅 Book Appointment
                </Button>
              </Link>
              <Link to="/patient/payments">
                <Button variant="danger" size="lg" className="action-btn">
                  💰 Pay Bills
                </Button>
              </Link>
              <Link to="/patient/reports">
                <Button variant="secondary" size="lg" className="action-btn">
                  📄 View Reports
                </Button>
              </Link>
              <Link to="/patient/health">
                <Button variant="outline" size="lg" className="action-btn">
                  📚 Health Awareness
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="hospital-dashboard-section">
            <h2 className="hospital-dashboard-section-title">Recent Activity</h2>
            <div className="hospital-dashboard-cards-grid">
              <Card header="Recent Appointments">
                <Table
                  columns={appointmentColumns}
                  data={recentAppointments}
                  itemsPerPage={3}
                  emptyMessage="No recent appointments"
                />
                <div className="view-all-link">
                  <Link to="/patient/appointments">
                    View all appointments →
                  </Link>
                </div>
              </Card>

              <Card header="Recent Reports">
                <Table
                  columns={reportColumns}
                  data={recentReports}
                  itemsPerPage={3}
                  emptyMessage="No recent reports"
                />
                <div className="view-all-link">
                  <Link to="/patient/reports">View all reports →</Link>
                </div>
              </Card>

              <Card header="Recent Payments">
                <Table
                  columns={paymentColumns}
                  data={recentPayments}
                  itemsPerPage={3}
                  emptyMessage="No recent payments"
                />
                <div className="view-all-link">
                  <Link to="/patient/payments">View all payments →</Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Health Tips */}
          <div className="hospital-dashboard-section">
            <Card header="Health Tips of the Week" className="health-tips-card">
              <div className="health-tip">
                <div className="tip-icon">💡</div>
                <div className="tip-content">
                  <h3>Stay Hydrated</h3>
                  <p>
                    Drink at least 8 glasses of water daily to maintain proper
                    bodily functions and prevent dehydration.
                  </p>
                </div>
              </div>
              <div className="health-tip">
                <div className="tip-icon">🏃‍♂️</div>
                <div className="tip-content">
                  <h3>Exercise Regularly</h3>
                  <p>
                    Aim for 30 minutes of moderate exercise 5 days a week to
                    improve cardiovascular health and reduce stress.
                  </p>
                </div>
              </div>
              <div className="health-tip">
                <div className="tip-icon">🥗</div>
                <div className="tip-content">
                  <h3>Eat Balanced Meals</h3>
                  <p>
                    Include fruits, vegetables, whole grains, and lean proteins
                    in your diet for optimal nutrition.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}