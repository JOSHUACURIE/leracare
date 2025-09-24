// src/pages/patient/Reports.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import API from '../../services/api';
import './Reports.css';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    doctor: 'all',
    search: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/patient');
      setReports(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setMessage({ type: 'error', text: 'Failed to load reports. Please refresh.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Get unique doctors for filter
  const doctors = [...new Set(reports.map(r => r.doctorId?.name))].filter(Boolean);

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filters.doctor !== 'all' && report.doctorId?.name !== filters.doctor) return false;
    if (filters.search && !report.diagnosis.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.dateRange !== 'all') {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      
      if (filters.dateRange === 'last7days') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        if (reportDate < sevenDaysAgo) return false;
      } else if (filters.dateRange === 'last30days') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        if (reportDate < thirtyDaysAgo) return false;
      } else if (filters.dateRange === 'thisyear') {
        const thisYear = now.getFullYear();
        if (reportDate.getFullYear() !== thisYear) return false;
      }
    }
    
    return true;
  });

  // Handle download PDF
  const handleDownloadPDF = async (reportId) => {
    try {
      const response = await API.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob' // important for PDFs
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage({ type: 'success', text: 'PDF downloaded successfully!' });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error downloading report:', err);
      setMessage({ type: 'error', text: 'Failed to download PDF. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <Navbar />
        <div className="reports-content">
          <Sidebar />
          <main className="reports-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading your medical reports...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <Navbar />
      <div className="reports-content">
        <Sidebar />
        <main className="reports-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📄 My Medical Reports</h1>
            <p className="hospital-subtitle">
              View and download your medical records and prescriptions
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
            <Card variant="highlight" header="Total Reports">
              <div className="stat-value">{reports.length}</div>
              <div className="stat-label">Medical records available</div>
            </Card>

            <Card variant="default" header="Recent Reports">
              <div className="stat-value">
                {reports.filter(r => {
                  const reportDate = new Date(r.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return reportDate >= thirtyDaysAgo;
                }).length}
              </div>
              <div className="stat-label">Last 30 days</div>
            </Card>

            <Card variant="secondary" header="Different Doctors">
              <div className="stat-value">{doctors.length}</div>
              <div className="stat-label">Healthcare providers</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="filters-card">
            <div className="hospital-filters">
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
              <select
                value={filters.doctor}
                onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="all">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search by diagnosis..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="hospital-search-input"
              />
            </div>
          </Card>

          {/* Reports Table */}
          <Card header="My Medical Reports">
            <Table
              columns={[
                { 
                  key: 'diagnosis', 
                  label: 'Diagnosis',
                  render: (diagnosis) => (
                    <div className="diagnosis-text">{diagnosis}</div>
                  )
                },
                { 
                  key: 'doctorId', 
                  label: 'Doctor',
                  render: (doctor) => doctor?.name || 'N/A'
                },
                { 
                  key: 'createdAt', 
                  label: 'Date',
                  render: (date) => new Date(date).toLocaleDateString()
                },
                { 
                  key: 'prescriptions', 
                  label: 'Prescriptions',
                  render: (prescriptions) => (
                    <div className="prescriptions-count">
                      {prescriptions?.length || 0} medication{prescriptions?.length !== 1 ? 's' : ''}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  actions: [
                    {
                      label: 'View Details',
                      variant: 'primary',
                      onClick: (report) => setSelectedReport(report)
                    },
                    {
                      label: 'Download PDF',
                      variant: 'outline',
                      onClick: (report) => handleDownloadPDF(report._id)
                    }
                  ]
                }
              ]}
              data={filteredReports}
              itemsPerPage={10}
              emptyMessage="No medical reports found. Try adjusting your filters."
            />
          </Card>

          {/* Report Details Modal */}
          {selectedReport && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal">
                <div className="hospital-modal-header">
                  <h3>Medical Report Details</h3>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="report-details">
                    <div className="detail-section">
                      <h4 className="section-title">Patient Information</h4>
                      <div className="detail-row">
                        <strong>Report Date:</strong>
                        <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Doctor:</strong>
                        <span>{selectedReport.doctorId?.name}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Department:</strong>
                        <span>{selectedReport.doctorId?.department || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4 className="section-title">Diagnosis</h4>
                      <p className="diagnosis-text">{selectedReport.diagnosis}</p>
                    </div>

                    <div className="detail-section">
                      <h4 className="section-title">Prescriptions ({selectedReport.prescriptions?.length || 0})</h4>
                      {selectedReport.prescriptions && selectedReport.prescriptions.length > 0 ? (
                        <div className="prescriptions-list">
                          {selectedReport.prescriptions.map((prescription, index) => (
                            <div key={index} className="prescription-item">
                              <div className="prescription-header">
                                <h5 className="medicine-name">{prescription.medicine}</h5>
                              </div>
                              <div className="prescription-details">
                                <div className="detail-row">
                                  <strong>Dosage:</strong>
                                  <span>{prescription.dosage}</span>
                                </div>
                                <div className="detail-row">
                                  <strong>Frequency:</strong>
                                  <span>{prescription.frequency}</span>
                                </div>
                                <div className="detail-row">
                                  <strong>Duration:</strong>
                                  <span>{prescription.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-prescriptions">No prescriptions were prescribed for this visit.</p>
                      )}
                    </div>

                    {selectedReport.notes && (
                      <div className="detail-section">
                        <h4 className="section-title">Doctor's Notes</h4>
                        <p className="doctor-notes">{selectedReport.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="modal-actions">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(selectedReport._id)}
                    >
                      📥 Download PDF
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setSelectedReport(null)}
                    >
                      Close
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