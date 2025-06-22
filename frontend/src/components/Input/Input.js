import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  error,
  ...props 
}) => {
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`.trim();

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export const TextArea = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  rows = 4,
  className = '',
  error,
  ...props 
}) => {
  const textareaClass = `textarea ${error ? 'input-error' : ''} ${className}`.trim();

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={textareaClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;