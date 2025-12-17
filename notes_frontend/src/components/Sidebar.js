import React from 'react';
import './sidebar.css';

/**
 * PUBLIC_INTERFACE
 * Sidebar displays a list of notes and actions to add or delete.
 */
export default function Sidebar({
  notes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  loadingIds = [],
}) {
  return (
    <aside className="sb-root" aria-label="Notes list">
      <div className="sb-header">
        <h2 className="sb-title">Notes</h2>
        <button className="btn-primary" onClick={onAdd} aria-label="Create new note">
          + New
        </button>
      </div>
      <ul className="sb-list">
        {notes.length === 0 ? (
          <li className="sb-empty">No notes yet</li>
        ) : (
          notes.map((n) => {
            const active = n.id === selectedId;
            const isLoading = loadingIds.includes(n.id);
            return (
              <li
                key={n.id}
                className={`sb-item ${active ? 'active' : ''}`}
                onClick={() => onSelect(n.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(n.id)}
                aria-current={active ? 'true' : 'false'}
              >
                <div className="sb-item-title">{n.title || 'Untitled'}</div>
                <div className="sb-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-ghost danger"
                    onClick={() => onDelete(n.id)}
                    disabled={isLoading}
                    aria-label={`Delete ${n.title || 'note'}`}
                    title="Delete note"
                  >
                    {isLoading ? '...' : '🗑'}
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
