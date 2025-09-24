// src/components/layout/Footer.jsx
import './Footer.css';

export default function Footer() {
  return (
    <footer className="hospital-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-heading">St. Mercy General Hospital</h3>
          <p className="footer-text">
            Compassionate care. Advanced medicine. Always here for you.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-subheading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/patient" className="footer-link">Patient Portal</a></li>
            <li><a href="/doctor" className="footer-link">Doctor Login</a></li>
            <li><a href="/admin" className="footer-link">Admin Login</a></li>
            <li><a href="/health" className="footer-link">Health Awareness</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subheading">Contact Us</h4>
          <address className="footer-address">
            <p>📞 +1 (555) 123-4567</p>
            <p>✉️ info@stmercyhospital.org</p>
            <p>🏥 123 Healing Avenue, MedCity</p>
          </address>
        </div>

        <div className="footer-section">
          <h4 className="footer-subheading">Follow Us</h4>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">📘</a>
            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="social-link" aria-label="Instagram">📸</a>
            <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} St. Mercy General Hospital. All rights reserved.
        </p>
      </div>
    </footer>
  );
}