'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      const modal = document.getElementById('modal-content');
      if (modal) {
        modal.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'modal-box w-11/12 max-w-md';
      case 'md':
        return 'modal-box w-11/12 max-w-2xl';
      case 'lg':
        return 'modal-box w-11/12 max-w-4xl';
      case 'xl':
        return 'modal-box w-11/12 max-w-6xl';
      default:
        return 'modal-box w-11/12 max-w-2xl';
    }
  };

  return (
    <div className="modal modal-open">
      {/* Background overlay */}
      <div 
        className="modal-backdrop" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div 
        id="modal-content"
        className={`${getSizeClasses()} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-xl font-bold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
