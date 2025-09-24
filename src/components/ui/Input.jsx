// src/components/ui/Input.jsx
import './Input.css';

/**
 * Input Component
 * @param {string} label - Input label
 * @param {string} placeholder - Placeholder text
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {boolean} required - Required field
 * @param {string} state - 'default' | 'success' | 'error' | 'warning'
 * @param {string} helpText - Helper text below input
 * @param {boolean} loading - Show loading spinner
 * @param {React.ReactNode} leftIcon - Icon on left
 * @param {React.ReactNode} rightIcon - Icon on right
 * @param {string} className - Additional classes
 * @param {object} props - Other props (name, id, etc.)
 */
export default function Input({
  label,
  placeholder = '',
  type = 'text',
  value,
  onChange,
  required = false,
  state = 'default',
  helpText = '',
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const baseClass = 'hospital-input-wrapper';
  const stateClass = `hospital-input-wrapper--${state}`;
  const hasLabel = !!label;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon || loading;

  return (
    <div className={`${baseClass} ${stateClass} ${className}`}>
      {hasLabel && (
        <label className="hospital-input-label">
          {label}
          {required && <span className="hospital-input-required">*</span>}
        </label>
      )}

      <div className="hospital-input-container">
        {hasLeftIcon && (
          <div className="hospital-input-left-icon">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`hospital-input ${
            hasLeftIcon ? 'has-left-icon' : ''
          } ${
            hasRightIcon ? 'has-right-icon' : ''
          }`}
          aria-invalid={state === 'error'}
          aria-describedby={helpText ? `${props.id}-help` : undefined}
          {...props}
        />

        {loading && (
          <div className="hospital-input-right-icon">
            <span className="hospital-input-spinner" aria-hidden="true"></span>
          </div>
        )}

        {!loading && hasRightIcon && !loading && (
          <div className="hospital-input-right-icon">
            {rightIcon}
          </div>
        )}
      </div>

      {helpText && (
        <p
          id={`${props.id}-help`}
          className={`hospital-input-help hospital-input-help--${state}`}
        >
          {helpText}
        </p>
      )}
    </div>
  );
}