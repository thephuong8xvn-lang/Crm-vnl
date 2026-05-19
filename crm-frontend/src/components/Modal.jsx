import { useEffect } from 'react';

/**
 * Modal dùng chung — overlay + card + animation slide-up
 * Props: isOpen, onClose, title, children, size ('sm'|'md'|'lg'|'xl')
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }[size] ?? 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Card */}
      <div
        className={`relative w-full ${sizeClass} bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#E3D7C8] animate-modal flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3D7C8] shrink-0">
            <h2 className="text-lg font-semibold text-[#3F3A33]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#8B8375] hover:text-[#3F3A33] transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
        .animate-modal { animation: modal-in 0.2s ease-out both; }
      `}</style>
    </div>
  );
}
