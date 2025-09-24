// src/pages/doctor/DoctorDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import API from '../../services/api';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    todayPatients: 0,
    completed: 0,
    pendingReports: 0,
    upcomingDuties: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        todayPatientsRes,
        completedRes,
        reportsRes,
        dutiesRes
      ] = await Promise.all([
        API.get('/appointments/doctor?range=today'),
        API.get('/appointments/doctor?range=today'),
        API.get('/reports/doctor'),
        API.get('/duties/doctor?range=upcoming')
      ]);

      const todayPatients = todayPatientsRes.data;
      const completed = todayPatients.filter(p => p.status === 'completed').length;

      setStats({
        todayPatients: todayPatients.length,
        completed,
        pendingReports: reportsRes.data.filter(r => 
          !todayPatients.find(p => p._id === r.appointmentId?._id)
        ).length,
        upcomingDuties: dutiesRes.data.length
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard ', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="doctor-dashboard-container">
        <Navbar />
        <div className="doctor-dashboard-content">
          <Sidebar />
          <main className="doctor-dashboard-main">
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
      <div className="doctor-dashboard-container">
        <Navbar />
        <div className="doctor-dashboard-content">
          <Sidebar />
          <main className="doctor-dashboard-main">
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

  return (
    <div className="doctor-dashboard-container">
      <Navbar />
      <div className="doctor-dashboard-content">
        <Sidebar />
        <main className="doctor-dashboard-main">
          {/* Header */}
          <div className="hospital-dashboard-header">
            <h1 className="hospital-dashboard-title">🩺 Doctor Dashboard</h1>
            <p className="hospital-dashboard-subtitle">
              Welcome to your patient management center
            </p>
          </div>

          {/* Stats Grid */}
          <div className="hospital-dashboard-stats-grid">
            <Card variant="highlight" header="Today's Patients">
              <div className="stat-value">{stats.todayPatients}</div>
              <div className="stat-trend">Need your attention</div>
              <Button 
                variant="primary" 
                size="sm" 
                className="stat-button"
                onClick={() => navigate('/doctor/patients')}
              >
                View All
              </Button>
            </Card>

            <Card variant="default" header="Completed">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-trend">Great job today!</div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="stat-button"
                onClick={() => navigate('/writereport')}
              >
                View Reports
              </Button>
            </Card>

            <Card variant="alert" header="Pending Reports">
              <div className="stat-value">{stats.pendingReports}</div>
              <div className="stat-trend">Require documentation</div>
              <Button 
                variant="danger" 
                size="sm" 
                className="stat-button"
                onClick={() => navigate('/writereport')}
              >
                Write Reports
              </Button>
            </Card>

            <Card variant="secondary" header="Upcoming Duties">
              <div className="stat-value">{stats.upcomingDuties}</div>
              <div className="stat-trend">Scheduled this week</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="stat-button"
                onClick={() => navigate('/doctor/duties')}
              >
                View Schedule
              </Button>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="hospital-dashboard-section">
            <h2 className="hospital-dashboard-section-title">Quick Actions</h2>
            <div className="hospital-dashboard-actions">
              <Button 
                variant="primary" 
                size="lg" 
                className="action-btn"
                onClick={() => navigate('/doctor/patients')}
              >
                👥 View Assigned Patients
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="action-btn"
                onClick={() => navigate('/writereport')}
              >
                📝 Write Medical Reports
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="action-btn"
                onClick={() => navigate('/doctor/duties')}
              >
                📅 View Duty Schedule
              </Button>
              <Button 
                variant="danger" 
                size="lg" 
                className="action-btn"
                onClick={() => navigate('/doctor/message')}
              >
                📩 Message Admin
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}