import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './RecommendDoctors.css';

export default function RecommendDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    byBadge: [],
    mostRecommended: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendForm, setRecommendForm] = useState({
    doctorId: '',
    reason: '',
    badge: '⭐ Top Performer',
    validFrom: new Date().toISOString().slice(0, 16),
    validTo: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch doctors, recommendations, and stats
  const fetchRecommendationsData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, recommendationsRes, statsRes] = await Promise.all([
        API.get('/auth/admin/users?role=doctor'),
        API.get('/recommendations/admin'),
        API.get('/recommendations/admin/stats')
      ]);

      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setRecommendations(Array.isArray(recommendationsRes.data) ? recommendationsRes.data : []);
      setStats({
        totalActive: statsRes.data?.totalActive || 0,
        byBadge: Array.isArray(statsRes.data?.byBadge) ? statsRes.data.byBadge : [],
        mostRecommended: Array.isArray(statsRes.data?.mostRecommended) ? statsRes.data.mostRecommended : []
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations data:', err);
      setMessage({ type: 'error', text: 'Failed to load data. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendationsData();
  }, []);

  // Handle recommend doctor
  const handleRecommendDoctor = async (e) => {
    e.preventDefault();
    if (!recommendForm.doctorId) {
      setMessage({ type: 'error', text: 'Please select a doctor' });
      return;
    }

    try {
      const recommendationData = {
        doctorId: recommendForm.doctorId,
        reason: recommendForm.reason,
        badge: recommendForm.badge,
        validFrom: recommendForm.validFrom,
        validTo: recommendForm.validTo || undefined
      };

      const res = await API.post('/recommendations', recommendationData);

      setRecommendations([res.data.recommendation, ...recommendations]);

      setRecommendForm({
        doctorId: '',
        reason: '',
        badge: '⭐ Top Performer',
        validFrom: new Date().toISOString().slice(0, 16),
        validTo: ''
      });
      setShowRecommendModal(false);
      setMessage({
        type: 'success',
        text: `Dr. ${res.data.recommendation.doctorId?.name || ''} has been awarded the "${res.data.recommendation.badge}" badge!`
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);

      fetchRecommendationsData();
    } catch (err) {
      console.error('Error recommending doctor:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to recommend doctor. Please try again.'
      });
    }
  };

  // Handle update recommendation
  const handleUpdateRecommendation = async (recId, updates) => {
    try {
      const res = await API.put(`/recommendations/${recId}`, updates);
      setRecommendations(recommendations.map(rec =>
        rec._id === recId ? res.data.recommendation : rec
      ));
      setMessage({ type: 'success', text: 'Recommendation updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error updating recommendation:', err);
      setMessage({ type: 'error', text: 'Failed to update recommendation. Please try again.' });
    }
  };

  // Table columns for recommendations
  const recommendationColumns = [
    { key: 'doctorId', label: 'Doctor', render: (doctor) => doctor?.name || 'N/A' },
    { key: 'badge', label: 'Badge', render: (badge) => <span className="badge-item">{badge}</span> },
    { key: 'reason', label: 'Reason', render: (reason) => <div className="reason-text">{reason}</div> },
    { key: 'validFrom', label: 'Valid From', render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A' },
    { key: 'validTo', label: 'Valid To', render: (date) => date ? new Date(date).toLocaleDateString() : 'No Expiry' },
    {
      key: 'isExpired', label: 'Status', render: (isExpired) => (
        <span className={`status-badge ${isExpired ? 'status-expired' : 'status-active'}`}>
          {isExpired ? 'Expired' : 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: [
        {
          label: 'Extend',
          variant: 'secondary',
          onClick: (rec) => handleUpdateRecommendation(rec._id, {
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        },
        {
          label: 'Expire',
          variant: 'danger',
          onClick: (rec) => handleUpdateRecommendation(rec._id, { isExpired: true })
        }
      ]
    }
  ];

  // Table columns for top doctors
  const topDoctorColumns = [
    { key: 'doctorName', label: 'Doctor Name' },
    { key: 'count', label: 'Recommendations', render: (count) => <div className="count-badge">{count} 🏆</div> }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="content-container">
          <Sidebar />
          <main className="main-content">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading recommendations data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-container">
        <Sidebar />
        <main className="main-content">
          <div className="hospital-header">
            <h1 className="hospital-title">🏆 Recommend Doctors</h1>
            <p className="hospital-subtitle">Recognize and reward your top-performing medical staff</p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Stats Cards */}
          <div className="hospital-stats-grid">
            <Card variant="highlight" header="Active Recommendations">
              <div className="stat-value">{stats.totalActive || 0}</div>
              <div className="stat-label">Currently displayed</div>
            </Card>

            <Card variant="default" header="Top Performers">
              <div className="stat-value">{Array.isArray(stats.mostRecommended) ? stats.mostRecommended.length : 0}</div>
              <div className="stat-label">Doctors with multiple awards</div>
            </Card>

            <Card variant="secondary" header="Patient Favorites">
              <div className="stat-value">
                {stats.byBadge?.find(b => b._id === '🌟 Patient Favorite')?.count || 0}
              </div>
              <div className="stat-label">Awarded for patient satisfaction</div>
            </Card>
          </div>

          {/* Recommend Doctor Button */}
          <div className="hospital-actions">
            <Button variant="primary" size="lg" onClick={() => setShowRecommendModal(true)}>
              ➕ Award Doctor
            </Button>
          </div>

          {/* Current Recommendations */}
          <Card header="Current Recommendations" className="card-margin-top">
            <Table
              columns={recommendationColumns}
              data={Array.isArray(recommendations) ? recommendations.filter(rec => !rec.isExpired) : []}
              itemsPerPage={10}
              emptyMessage="No active recommendations. Award your first doctor!"
            />
          </Card>

          {/* Top Recommended Doctors */}
          {Array.isArray(stats.mostRecommended) && stats.mostRecommended.length > 0 && (
            <Card header="Most Recommended Doctors" className="card-margin-top">
              <Table
                columns={topDoctorColumns}
                data={stats.mostRecommended || []}
                itemsPerPage={5}
              />
            </Card>
          )}

          {/* Award Doctor Modal */}
          {showRecommendModal && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Award Doctor</h3>
                  <button onClick={() => setShowRecommendModal(false)} className="hospital-modal-close">✕</button>
                </div>
                <div className="hospital-modal-body">
                  <form onSubmit={handleRecommendDoctor} className="recommend-form">
                    <div className="form-group">
                      <label>Doctor</label>
                      <select
                        value={recommendForm.doctorId}
                        onChange={(e) => setRecommendForm({ ...recommendForm, doctorId: e.target.value })}
                        className="doctor-select"
                        required
                      >
                        <option value="">Select a doctor...</option>
                        {Array.isArray(doctors) && doctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name} - {doctor.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Badge</label>
                      <select
                        value={recommendForm.badge}
                        onChange={(e) => setRecommendForm({ ...recommendForm, badge: e.target.value })}
                        className="badge-select"
                      >
                        <option value="⭐ Top Performer">⭐ Top Performer</option>
                        <option value="🌟 Patient Favorite">🌟 Patient Favorite</option>
                        <option value="🏆 Most Improved">🏆 Most Improved</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <Input
                        label="Reason for Award"
                        placeholder="e.g., Highest patient satisfaction score this quarter"
                        value={recommendForm.reason}
                        onChange={(e) => setRecommendForm({ ...recommendForm, reason: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <Input
                          label="Valid From"
                          type="datetime-local"
                          value={recommendForm.validFrom}
                          onChange={(e) => setRecommendForm({ ...recommendForm, validFrom: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <Input
                          label="Valid To (Optional)"
                          type="datetime-local"
                          value={recommendForm.validTo}
                          onChange={(e) => setRecommendForm({ ...recommendForm, validTo: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <Button type="submit" variant="primary">Award Badge</Button>
                      <Button type="button" variant="outline" onClick={() => setShowRecommendModal(false)}>Cancel</Button>
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
