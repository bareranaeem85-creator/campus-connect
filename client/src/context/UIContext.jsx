import { createContext, useCallback, useContext, useRef, useState } from 'react';

// Global UI helpers: toast notifications + promise-based confirm dialog.
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  /** `await confirm({ title, message })` → true / false */
  const confirm = useCallback(
    (opts) => new Promise((resolve) => setConfirmState({ ...opts, resolve })),
    []
  );

  const close = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="dot" />
            {t.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="overlay" onClick={() => close(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{confirmState.title || 'Are you sure?'}</h3>
            <p className="muted">{confirmState.message || 'This action cannot be undone.'}</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => close(false)}>Cancel</button>
              <button className="btn btn-danger" autoFocus onClick={() => close(true)}>
                {confirmState.confirmText || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
