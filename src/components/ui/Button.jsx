// src/components/ui/Button.jsx
import './Button.css';

/**
 * Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'outline'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} fullWidth - Make button full width
 * @param {React.ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} type - 'button' | 'submit' | 'reset'
 */
export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClass = 'hospital-btn';
  const variantClass = `hospital-btn--${variant}`;
  const sizeClass = `hospital-btn--${size}`;
  const fullWidthClass = fullWidth ? 'hospital-btn--fullwidth' : '';

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="hospital-btn-spinner" aria-hidden="true"></span>
      ) : (
        children
      )}
    </button>
  );
}