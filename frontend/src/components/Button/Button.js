import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  const buttonClass = `
    btn 
    btn-${variant} 
    btn-${size} 
    ${loading ? 'btn-loading' : ''} 
    ${disabled ? 'btn-disabled' : ''} 
    ${className}
  `.trim();

  return (
    <button 
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="btn-spinner" />}
      <span className={`btn-text ${loading ? 'btn-text-hidden' : ''}`}>
        {children}
      </span>
    </button>
  );
};

export default Button;