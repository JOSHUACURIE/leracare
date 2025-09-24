// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    unreadComplaints: 0,
    activeDuties: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        patientsRes,
        doctorsRes,
        paymentsStatsRes,
        complaintsStatsRes,
        dutiesStatsRes,
        recentPatientsRes,
        recentComplaintsRes
      ] = await Promise.all([
        API.get('/auth/admin/patients'), // patients
        API.get('/auth/admin/doctors'), // doctors
        API.get('/payments/admin/stats'),
        API.get('/complaints/admin/stats'),
        API.get('/duties/admin/stats'),
        API.get('/auth/admin/patients?limit=5'), // recent patients
        API.get('/complaints/admin?status=unread&limit=5') // recent complaints
      ]);

      setStats({
        totalPatients: patientsRes.data?.length || 0,
        totalDoctors: doctorsRes.data?.length || 0,
        totalRevenue: paymentsStatsRes.data?.totalRevenue || 0,
        pendingPayments: paymentsStatsRes.data?.byStatus?.find(s => s._id === 'pending')?.count || 0,
        unreadComplaints: complaintsStatsRes.data?.unread || 0,
        activeDuties: dutiesStatsRes.data?.totalActive || 0
      });

      setRecentPatients(recentPatientsRes.data || []);
      setRecentComplaints(recentComplaintsRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="admin-dashboard-layout">
          <Sidebar />
          <main className="admin-dashboard-main">
            <div className="hospital-dashboard-loading">
              <div className="hospital-dashboard-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="admin-dashboard-layout">
          <Sidebar />
          <main className="admin-dashboard-main">
            <div className="hospital-dashboard-error">
              <div className="hospital-dashboard-error-icon">⚠️</div>
              <p>{error}</p>
              <Button onClick={fetchDashboardStats} variant="primary">
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Recent Patients Table Columns
  const patientColumns = [
    { key: 'name', label: 'Patient Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'createdAt', label: 'Registered' },
    {
      key: 'actions',
      label: 'Actions',
      actions: (row) => [
        {
          label: 'View',
          variant: 'primary',
          onClick: () => window.location.href = `/admin/patients/${row._id}`
        }
      ]
    }
  ];

  // Recent Complaints Table Columns
  const complaintColumns = [
    { key: 'title', label: 'Title' },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span className={`complaint-type complaint-type--${type}`}>
          {type === 'complaint' ? 'Complaint' : 'Suggestion'}
        </span>
      )
    },
    { key: 'category', label: 'Category' },
    {
      key: 'actions',
      label: 'Actions',
      actions: (row) => [
        {
          label: 'View',
          variant: 'primary',
          onClick: () => window.location.href = `/admin/complaints/${row._id}`
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="admin-dashboard-layout">
        <Sidebar />
        <main className="admin-dashboard-main">
          
          <div className="hospital-dashboard-header">
            <h1 className="hospital-dashboard-title">🏥 Admin Dashboard</h1>
            <p className="hospital-dashboard-subtitle">
              Welcome to your hospital's mission control center
            </p>
          </div>

      
          <div className="hospital-dashboard-stats-grid">
            <Card variant="highlight" header="Total Patients">
              <div className="stat-value">{stats.totalPatients.toLocaleString()}</div>
              <Link to="/admin/patients">
                <Button variant="outline" size="sm" className="mt-4">
                  View All
                </Button>
              </Link>
            </Card>

            <Card variant="highlight" header="Total Doctors">
              <div className="stat-value">{stats.totalDoctors.toLocaleString()}</div>
              <Link to="/admin/doctors">
                <Button variant="outline" size="sm" className="mt-4">
                  View All
                </Button>
              </Link>
            </Card>

            <Card variant="highlight" header="Total Revenue">
              <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
              <Link to="/admin/payments">
                <Button variant="outline" size="sm" className="mt-4">
                  View All
                </Button>
              </Link>
            </Card>

            <Card variant="alert" header="Pending Payments">
              <div className="stat-value">{stats.pendingPayments.toLocaleString()}</div>
              <Link to="/admin/payments?status=pending">
                <Button variant="danger" size="sm" className="mt-4">
                  Collect Now
                </Button>
              </Link>
            </Card>

            <Card variant="alert" header="Unread Complaints">
              <div className="stat-value">{stats.unreadComplaints.toLocaleString()}</div>
              <Link to="/admin/complaints?status=unread">
                <Button variant="danger" size="sm" className="mt-4">
                  Respond Now
                </Button>
              </Link>
            </Card>

            <Card variant="default" header="Active Duties">
              <div className="stat-value">{stats.activeDuties.toLocaleString()}</div>
              <Link to="/admin/duties">
                <Button variant="secondary" size="sm" className="mt-4">
                  Manage
                </Button>
              </Link>
            </Card>
          </div>


          <div className="hospital-dashboard-section">
            <h2 className="hospital-dashboard-section-title">Recent Activity</h2>
            <div className="hospital-dashboard-cards-grid">
              <Card header="Recently Added Patients">
                <Table
                  columns={patientColumns}
                  data={recentPatients}
                  itemsPerPage={5}
                  emptyMessage="No recent patients"
                />
              </Card>

              <Card header="Unresolved Complaints">
                <Table
                  columns={complaintColumns}
                  data={recentComplaints}
                  itemsPerPage={5}
                  emptyMessage="No unresolved complaints"
                />
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hospital-dashboard-section">
            <h2 className="hospital-dashboard-section-title">Quick Actions</h2>
            <div className="hospital-dashboard-actions">
              <Link to="/admin/patients/add">
                <Button variant="primary" size="lg" className="action-btn">
                  ➕ Add New Patient
                </Button>
              </Link>
              <Link to="/admin/doctors/add">
                <Button variant="secondary" size="lg" className="action-btn">
                  👨‍⚕️ Add New Doctor
                </Button>
              </Link>
             <Link to="/assign">
                <Button variant="outline" size="lg" className="action-btn">
                  📅 Assign Duties
                </Button>
              </Link> 
              <Link to="/admin/recommend">
                <Button variant="secondary" size="lg" className="action-btn">
                  🏆 Recommend Doctor
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
