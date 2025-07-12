
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

const MobileBlocker = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    Modal.setAppElement('#root');
    
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90%',
      width: '400px',
      padding: '2rem',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    overlay: {
      backgroundColor: 'rgba(56, 165, 255, 0.5)',
      zIndex: 1000
    }
  };

  if (!isMobile) {
    return children;
  }

  return (
    <div>
      <Modal
        isOpen={true}
        style={modalStyles}
        contentLabel="Mobile Access Warning"
      >
        <div>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Small Screen Access Not Available
          </h2>
          <div style={{ 
            fontSize: '1rem',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            <p style={{ marginBottom: '1rem' }}>
              This application is currently optimized for larger screen use only. 
              Please expand this tab, or access the app from a computer for best experience.
            </p>
            <p style={{ 
              fontSize: '0.875rem',
              color: 'var(--secondary)'
            }}>
              We're working on making this application mobile-friendly. Thank you for your understanding.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MobileBlocker;