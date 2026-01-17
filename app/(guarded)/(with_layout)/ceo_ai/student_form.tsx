import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface StudentFormProps {
  onClose: () => void;
  onSubmit: (formData: any) => void;
  onBack?: () => void;
}

export default function StudentForm({ onClose, onSubmit, onBack }: StudentFormProps) {
  const [formData, setFormData] = useState({
    niche: '',
    experience: '',
    skills: '',
    location: '',
    portfolio: ''
  });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create and inject custom styles for the modal
    const styleSheet = document.createElement('style');
    styleSheet.id = 'student-form-modal-styles';
    styleSheet.textContent = `
      body.modal-open {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .student-modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.98) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 999999 !important;
        animation: fadeIn 0.3s ease !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      }

      .student-modal-container {
        position: relative !important;
        width: 100% !important;
        max-width: 500px !important;
        max-height: 90vh !important;
        background: #2A2D32 !important;
        border-radius: 0px !important;
        border: 3.5px solid !important;
        border-image-source: conic-gradient(from 180deg at 50% 50%, #000000 0deg, #0E526F 91.73deg, #1DA4DE 223.27deg, #000000 360deg) !important;
        border-image-slice: 1 !important;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), 0 0 8px rgba(29, 164, 222, 0.15) !important;
        animation: slideIn 0.3s ease !important;
        display: flex !important;
        flex-direction: column !important;
        z-index: 1000000 !important;
        overflow: hidden !important;
      }

      .student-modal-container::before {
        content: '' !important;
        position: absolute !important;
        bottom: -2px !important;
        left: 35% !important;
        right: 35% !important;
        height: 2px !important;
        background: #2A2D32 !important;
        z-index: 1 !important;
        border-radius: 20 20 20px 40px !important;
      }

      .student-modal-close-btn {
        position: absolute !important;
        top: 15px !important;
        right: 20px !important;
        background: none !important;
        border: none !important;
        color: #FFFFFF !important;
        font-size: 24px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 1000001 !important;
        padding: 5px !important;
        line-height: 1 !important;
        transition: all 0.2s ease !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .student-modal-close-btn:hover {
        color: #1DA4DE !important;
        transform: scale(1.1) !important;
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 50% !important;
      }

      .student-modal-back-btn {
        position: absolute !important;
        top: 15px !important;
        left: 20px !important;
        background: none !important;
        border: none !important;
        color: #FFFFFF !important;
        font-size: 24px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 1000001 !important;
        padding: 5px !important;
        line-height: 1 !important;
        transition: all 0.2s ease !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .student-modal-back-btn:hover {
        color: #1DA4DE !important;
        transform: scale(1.1) !important;
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 50% !important;
      }

      .student-modal-header {
        position: relative !important;
        padding: 30px 30px 20px !important;
        flex-shrink: 0 !important;
      }

      .student-modal-title {
        color: #FFFFFF !important;
        font-size: 20px !important;
        font-weight: bold !important;
        text-align: center !important;
        margin: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }

      .student-modal-content {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 0 30px !important;
        max-height: calc(90vh - 160px) !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      .student-modal-content::-webkit-scrollbar {
        display: none !important;
      }

      .student-modal-footer {
        padding: 20px 30px 30px !important;
        flex-shrink: 0 !important;
      }

      .student-modal-input-group {
        margin-bottom: 25px !important;
      }

      .student-modal-label {
        color: #FFFFFF !important;
        font-size: 16px !important;
        margin-bottom: 10px !important;
        display: block !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-weight: 500 !important;
      }

      .student-modal-input {
        width: 100% !important;
        background: #3A3D42 !important;
        color: #FFFFFF !important;
        border: 1px solid #4A4D52 !important;
        border-radius: 8px !important;
        padding: 15px !important;
        font-size: 16px !important;
        outline: none !important;
        transition: border-color 0.3s ease !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        box-sizing: border-box !important;
      }

      .student-modal-input:focus {
        border-color: #1DA4DE !important;
        box-shadow: 0 0 0 2px rgba(29, 164, 222, 0.2) !important;
      }

      .student-modal-input::placeholder {
        color: #999 !important;
      }

      .student-modal-submit-btn {
        width: 100% !important;
        background: linear-gradient(135deg, #0E526F, #1DA4DE) !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 15px !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }

      .student-modal-submit-btn:hover {
        background: linear-gradient(135deg, #1DA4DE, #0E526F) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 5px 15px rgba(29, 164, 222, 0.4) !important;
      }

      .student-modal-submit-btn:active {
        transform: translateY(0) !important;
      }

      @keyframes fadeIn {
        from { opacity: 0 !important; }
        to { opacity: 1 !important; }
      }

      @keyframes slideIn {
        from { 
          opacity: 0 !important;
          transform: scale(0.9) translateY(-20px) !important;
        }
        to { 
          opacity: 1 !important;
          transform: scale(1) translateY(0) !important;
        }
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .student-modal-overlay {
          padding: 10px !important;
        }

        .student-modal-container {
          max-height: 95vh !important;
          border-radius: 16px !important;
        }

        .student-modal-container::before {
          border-radius: 0 0 16px 16px !important;
        }

        .student-modal-header {
          padding: 25px 20px 15px !important;
        }

        .student-modal-content {
          padding: 0 20px !important;
          max-height: calc(95vh - 140px) !important;
        }

        .student-modal-footer {
          padding: 15px 20px 25px !important;
        }

        .student-modal-title {
          font-size: 18px !important;
        }

        .student-modal-close-btn,
        .student-modal-back-btn {
          font-size: 20px !important;
          width: 28px !important;
          height: 28px !important;
        }

        .student-modal-input {
          font-size: 16px !important;
          padding: 12px !important;
        }

        .student-modal-label {
          font-size: 14px !important;
        }

        .student-modal-input-group {
          margin-bottom: 20px !important;
        }
      }

      /* Extra Small Mobile (320px-374px) */
      @media (max-width: 374px) {
        .student-modal-overlay {
          padding: 3px !important;
        }

        .student-modal-container {
          max-height: 99vh !important;
          border-radius: 10px !important;
        }

        .student-modal-container::before {
          border-radius: 0 0 10px 10px !important;
        }

        .student-modal-header {
          padding: 18px 12px 8px !important;
        }

        .student-modal-content {
          padding: 0 12px !important;
          max-height: calc(99vh - 110px) !important;
        }

        .student-modal-footer {
          padding: 8px 12px 18px !important;
        }

        .student-modal-title {
          font-size: 15px !important;
        }

        .student-modal-close-btn,
        .student-modal-back-btn {
          top: 8px !important;
          font-size: 16px !important;
          width: 22px !important;
          height: 22px !important;
        }

        .student-modal-close-btn {
          right: 12px !important;
        }

        .student-modal-back-btn {
          left: 12px !important;
        }

        .student-modal-input {
          padding: 10px !important;
          font-size: 15px !important;
        }

        .student-modal-label {
          font-size: 13px !important;
        }

        .student-modal-input-group {
          margin-bottom: 18px !important;
        }

        .student-modal-submit-btn {
          padding: 12px !important;
          font-size: 15px !important;
        }
      }

      /* Medium Mobile (375px-479px) */
      @media (min-width: 375px) and (max-width: 479px) {
        .student-modal-overlay {
          padding: 5px !important;
        }

        .student-modal-container {
          max-height: 98vh !important;
          border-radius: 12px !important;
        }

        .student-modal-container::before {
          border-radius: 0 0 12px 12px !important;
        }

        .student-modal-header {
          padding: 20px 15px 10px !important;
        }

        .student-modal-content {
          padding: 0 15px !important;
          max-height: calc(98vh - 120px) !important;
        }

        .student-modal-footer {
          padding: 10px 15px 20px !important;
        }
      }

      /* Large Mobile/Small Tablet (480px-767px) */
      @media (min-width: 480px) and (max-width: 767px) {
        .student-modal-overlay {
          padding: 8px !important;
        }

        .student-modal-container {
          max-height: 96vh !important;
          border-radius: 14px !important;
        }

        .student-modal-container::before {
          border-radius: 0 0 14px 14px !important;
        }

        .student-modal-header {
          padding: 22px 18px 12px !important;
        }

        .student-modal-content {
          padding: 0 18px !important;
          max-height: calc(96vh - 130px) !important;
        }

        .student-modal-footer {
          padding: 12px 18px 22px !important;
        }

        .student-modal-title {
          font-size: 17px !important;
        }

        .student-modal-input {
          padding: 13px !important;
          font-size: 16px !important;
        }

        .student-modal-label {
          font-size: 15px !important;
        }
      }

      /* Tablet (768px-1023px) */
      @media (min-width: 768px) and (max-width: 1023px) {
        .student-modal-overlay {
          padding: 15px !important;
        }

        .student-modal-container {
          max-height: 92vh !important;
          border-radius: 18px !important;
          max-width: 550px !important;
        }

        .student-modal-container::before {
          border-radius: 0 0 18px 18px !important;
        }

        .student-modal-header {
          padding: 28px 25px 18px !important;
        }

        .student-modal-content {
          padding: 0 25px !important;
          max-height: calc(92vh - 150px) !important;
        }

        .student-modal-footer {
          padding: 18px 25px 28px !important;
        }

        .student-modal-title {
          font-size: 19px !important;
        }

        .student-modal-input {
          padding: 14px !important;
          font-size: 16px !important;
        }

        .student-modal-label {
          font-size: 16px !important;
        }
      }

      /* Small Desktop (1024px-1199px) */
      @media (min-width: 1024px) and (max-width: 1199px) {
        .student-modal-overlay {
          padding: 20px !important;
        }

        .student-modal-container {
          max-height: 88vh !important;
          border-radius: 20px !important;
          max-width: 580px !important;
        }

        .student-modal-container::before {
          border-radius: 0 0 20px 20px !important;
        }

        .student-modal-header {
          padding: 30px 30px 20px !important;
        }

        .student-modal-content {
          padding: 0 30px !important;
          max-height: calc(88vh - 160px) !important;
        }

        .student-modal-footer {
          padding: 20px 30px 30px !important;
        }

        .student-modal-title {
          font-size: 20px !important;
        }

        .student-modal-input {
          padding: 15px !important;
          font-size: 16px !important;
        }

        .student-modal-label {
          font-size: 16px !important;
        }
      }

      /* Large Desktop */
      @media (min-width: 1200px) {
        .student-modal-container {
          max-width: 600px !important;
        }

        .student-modal-title {
          font-size: 22px !important;
        }

        .student-modal-input {
          font-size: 17px !important;
          padding: 16px !important;
        }

        .student-modal-label {
          font-size: 17px !important;
        }
      }
    `;
    
    document.head.appendChild(styleSheet);
    
    // Prevent body scroll when modal is open
    document.body.classList.add('modal-open');

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      // Clean up
      const existingStyle = document.getElementById('student-form-modal-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      ref={overlayRef}
      className="student-modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className="student-modal-container">
        {/* Fixed Header */}
        <div className="student-modal-header">
          <button className="student-modal-close-btn" onClick={onClose}>
            ×
          </button>

          {onBack && (
            <button className="student-modal-back-btn" onClick={onBack}>
              ←
            </button>
          )}

          <h2 className="student-modal-title">Enter Your Information</h2>
        </div>

        {/* Scrollable Content */}
        <div className="student-modal-content">
          <div className="student-modal-input-group">
            <label className="student-modal-label">Your Niche:</label>
            <input
              type="text"
              className="student-modal-input"
              value={formData.niche}
              onChange={(e) => setFormData({...formData, niche: e.target.value})}
              placeholder="Enter your niche"
            />
          </div>

          <div className="student-modal-input-group">
            <label className="student-modal-label">Your Experience:</label>
            <input
              type="text"
              className="student-modal-input"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              placeholder="Years of experience"
            />
          </div>

          

       

          <div className="student-modal-input-group">
            <label className="student-modal-label">Portfolio URL:</label>
            <input
              type="url"
              className="student-modal-input"
              value={formData.portfolio}
              onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="student-modal-footer">
          <button className="student-modal-submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render at document.body level
  return createPortal(modalContent, document.body);
}