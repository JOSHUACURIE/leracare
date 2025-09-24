import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      // ✅ AuthContext login
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setMessage({
          type: "error",
          text: "Invalid credentials. Please try again.",
        });
        setErrors({ password: "Invalid email or password" });
        setLoading(false);
        return;
      }

      // ✅ success → redirect based on role
      const { role } = result.user;

      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      setTimeout(() => {
        if (role === "admin") navigate("/admin");
        else if (role === "doctor") navigate("/doctor");
        else if (role === "patient") navigate("/patient");
        else navigate("/"); // fallback
      }, 1200);
    } catch (err) {
      console.error("Login error:", err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.msg || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">🏥 St. Mercy Hospital</h1>
          <p className="login-subtitle">Your Health, Our Priority</p>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`login-message login-message--${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            state={errors.email ? "error" : "default"}
            helpText={errors.email || ""}
            required
            disabled={loading}
          
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"} // Toggle between text and password
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            state={errors.password ? "error" : "default"}
            helpText={errors.password || ""}
            required
            disabled={loading}
           
            rightIcon={
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <span title="Hide password">👁️</span>
                ) : (
                  <span title="Show password">👁️‍🗨️</span>
                )}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Need help? Contact IT Support at{" "}
            <strong>support@stmercyhospital.org</strong>
          </p>
        </div>
      </div>
    </div>
  );
}