import React, { useEffect, useState } from 'react';
import './editor.css';

/**
 * PUBLIC_INTERFACE
 * Editor for a selected note. Controlled by local state and syncs changes via callbacks.
 */
export default function Editor({
  note,
  onChange,
  onSave,
  isSaving,
  banner,
}) {
  const [local, setLocal] = useState(note || { title: '', content: '' });

  useEffect(() => {
    setLocal(note || { title: '', content: '' });
  }, [note?.id]);

  const handleField = (key, value) => {
    const updated = { ...(local || {}), [key]: value };
    setLocal(updated);
    onChange && onChange(updated);
  };

  return (
    <section className="ed-root">
      {banner}
      {note ? (
        <>
          <div className="ed-header">
            <input
              className="ed-title"
              value={local.title || ''}
              onChange={(e) => handleField('title', e.target.value)}
              placeholder="Title"
              aria-label="Note title"
            />
            <button
              className="btn-primary"
              onClick={() => onSave && onSave(local)}
              disabled={isSaving}
              aria-label="Save note"
              title="Save note"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <textarea
            className="ed-content"
            value={local.content || ''}
            onChange={(e) => handleField('content', e.target.value)}
            placeholder="Start typing..."
            aria-label="Note content"
          />
        </>
      ) : (
        <div className="ed-empty">
          <h3>Select a note or create a new one</h3>
          <p>Your notes will show up here.</p>
        </div>
      )}
    </section>
  );
}
