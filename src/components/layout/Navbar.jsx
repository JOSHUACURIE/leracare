// src/components/layout/Navbar.jsx
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Hard redirect to login
  };

  if (!user) return null; // Don't render if no user (e.g., on login page)

  return (
    <nav className="hospital-navbar">
      <div className="navbar-container">
        {/* Logo + Role */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            St. Mercy Hospital
          </Link>
          <span className="navbar-role">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
          </span>
        </div>

        {/* User Info + Logout */}
        <div className="navbar-right">
          <span className="navbar-user">
            👋 Hello, <strong>{user.name}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="navbar-logout-btn"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}