// src/components/ui/Card.jsx
import './Card.css';

/**
 * Card Component
 * @param {string} variant - 'default' | 'highlight' | 'alert'
 * @param {string} className - Additional classes
 * @param {React.ReactNode} children - Card content
 * @param {React.ReactNode} header - Optional header
 * @param {React.ReactNode} footer - Optional footer (for actions)
 */
export default function Card({
  variant = 'default',
  className = '',
  children,
  header,
  footer,
  ...props
}) {
  const baseClass = 'hospital-card';
  const variantClass = `hospital-card--${variant}`;

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {header && <div className="hospital-card-header">{header}</div>}
      <div className="hospital-card-body">{children}</div>
      {footer && <div className="hospital-card-footer">{footer}</div>}
    </div>
  );
}