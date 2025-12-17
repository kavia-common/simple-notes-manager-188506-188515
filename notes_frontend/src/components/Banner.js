import React from 'react';
import './banner.css';

/**
PUBLIC_INTERFACE
A non-blocking banner for warnings/info. Shown at top of editor area.
*/
export default function Banner({ kind = 'info', message, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`banner ${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <span className="banner-text">{message}</span>
      {onClose && (
        <button className="banner-close" onClick={onClose} aria-label="Close banner">
          ✕
        </button>
      )}
    </div>
  );
}
