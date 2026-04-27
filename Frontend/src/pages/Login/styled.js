const styles = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  loginCard: {
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  formInputFocus: {
    outline: 'none',
    borderColor: '#6200ea',
    boxShadow: '0 0 5px rgba(98, 0, 234, 0.3)',
  },
  formInputError: {
    borderColor: '#dc3545',
  },
  optionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#666',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
  },
  forgotPasswordLink: {
    color: '#6200ea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#6200ea',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  loginButtonHover: {
    backgroundColor: '#4500a0',
  },
  createAccountText: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.875rem',
    color: '#666',
  },
  createAccountLink: {
    color: '#6200ea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  // Estilos do Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '400px',
    animation: 'slideIn 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#333',
    margin: 0,
  },
  modalCloseButton: {
    backgroundColor: '#f9f9f9',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.3s ease',
  },
  modalCloseButtonHover: {
    backgroundColor: '#e0e0e0',
  },
  modalBody: {
    fontSize: '1rem',
    color: '#666',
  },
};

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`, styleSheet.cssRules.length);
styleSheet.insertRule(`
  @keyframes slideIn {
    from { transform: 'translateY(-20px)'; opacity: 0; }
    to { transform: 'translateY(0)'; opacity: 1; }
  }
`, styleSheet.cssRules.length);

export default styles;