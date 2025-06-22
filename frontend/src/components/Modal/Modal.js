import React from 'react';
import './Modal.css';
import Button from '../Button/Button';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">
          {children}
        </div>
        {actions && (
          <div className="modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const ErrorModal = ({ isOpen, onClose, onRetry, message }) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose}
    title="Permission Required"
    actions={
      <>
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </>
    }
  >
    <p>{message || 'Screen capture permission is required for monitoring to work.'}</p>
  </Modal>
);

export default Modal;