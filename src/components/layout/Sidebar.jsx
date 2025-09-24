// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaTachometerAlt,
  FaCalendarAlt,
  FaFileMedical,
  FaCreditCard,
  FaUserMd,
  FaBookMedical,
  FaUsers,
  FaFileMedicalAlt,
  FaCalendarCheck,
  FaEnvelope,
  FaMoneyCheckAlt,
  FaCalendarPlus,
  FaInbox,
  FaUserPlus,
  FaUserInjured,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, sidebar starts collapsed and closed
        setIsCollapsed(true);
        if (!isMobileOpen) {
          setIsMobileOpen(false);
        }
      } else {
        // On desktop, sidebar starts expanded
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen]);

  // Define links based on role
  const getLinks = () => {
    if (user?.role === 'patient') {
      return [
        { name: 'Dashboard', path: '/patient', icon: <FaTachometerAlt /> },
        { name: 'My Appointments', path: '/patient/appointments', icon: <FaCalendarAlt /> },
        { name: 'Medical Reports', path: '/patient/reports', icon: <FaFileMedical /> },
        { name: 'Billing & Payments', path: '/patient/payments', icon: <FaCreditCard /> },
        { name: 'Book Consultation', path: '/patient/book', icon: <FaUserMd /> },
        { name: 'Health Awareness', path: '/patient/health', icon: <FaBookMedical /> },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { name: 'Dashboard', path: '/doctor', icon: <FaTachometerAlt /> },
        { name: 'Assigned Patients', path: '/doctor/patients', icon: <FaUsers /> },
        { name: 'Write Reports', path: '/writereport', icon: <FaFileMedicalAlt /> },
        { name: 'Duty Schedule', path: '/doctor/duties', icon: <FaCalendarCheck /> },
        { name: 'Message Admin', path: '/doctor/message', icon: <FaEnvelope /> },
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin', icon: <FaTachometerAlt /> },
        { name: 'Manage Patients', path: '/admin/patients', icon: <FaUserInjured /> },
        { name: 'Manage Doctors', path: '/admin/doctors', icon: <FaUserMd /> },
        { name: 'View Payments', path: '/admin/payments', icon: <FaMoneyCheckAlt /> },
        { name: 'Assign Duties', path: '/assign', icon: <FaCalendarPlus /> },
        { name: 'Complaints Inbox', path: '/admin/complaints', icon: <FaInbox /> },
        { name: 'Recommend Doctors', path: '/admin/recommend', icon: <FaUserPlus /> },
      ];
    }
    return [];
  };

  const links = getLinks();

  // Toggle sidebar for desktop (collapse/expand)
  const toggleDesktopSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Toggle mobile sidebar (open/close)
  const toggleMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  // Close mobile sidebar when clicking on a link
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileOpen) {
        const sidebar = document.querySelector('.hospital-sidebar');
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');
        
        if (sidebar && !sidebar.contains(event.target) && 
            toggleBtn && !toggleBtn.contains(event.target)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  if (!user) return null;

  return (
    <>
      {/* Mobile Toggle Button (Always visible on mobile) */}
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className="mobile-toggle-btn"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`hospital-sidebar 
        ${isCollapsed ? 'collapsed' : ''} 
        ${isMobile ? 'mobile' : ''}
        ${isMobileOpen ? 'mobile-open' : ''}
      `}>
        {/* Desktop Toggle Button (Visible on desktop when collapsed) */}
        {!isMobile && isCollapsed && (
          <button
            onClick={toggleDesktopSidebar}
            className="desktop-toggle-btn"
            aria-label="Expand sidebar"
          >
            <FaBars />
          </button>
        )}

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Desktop Header (Visible when expanded) */}
          {!isMobile && !isCollapsed && (
            <div className="sidebar-header">
              <h3 className="sidebar-title">
                {user?.role === 'patient' ? 'Patient Portal' : 
                 user?.role === 'doctor' ? 'Doctor Portal' : 'Admin Portal'}
              </h3>
              <button
                onClick={toggleDesktopSidebar}
                className="sidebar-close-btn"
                aria-label="Collapse sidebar"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <nav className="sidebar-nav">
            <ul className="sidebar-list">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <span className="sidebar-icon">{link.icon}</span>
                    <span className="sidebar-text">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info Footer (Visible when expanded on desktop) */}
          {!isMobile && !isCollapsed && (
            <div className="sidebar-footer">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="user-role">{user?.role || 'Role'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}