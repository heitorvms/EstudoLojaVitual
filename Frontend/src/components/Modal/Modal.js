// Modal/Modal.js
import React from 'react';
import styles from '../../pages/Login/styled';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button
            onClick={onClose}
            style={styles.modalCloseButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = styles.modalCloseButtonHover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = styles.modalCloseButton.backgroundColor;
            }}
          >
            ×
          </button>
        </div>
        <div style={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;