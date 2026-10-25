"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional description shown under the title. */
  description?: string;
}

/**
 * Native <dialog> opened with showModal(): the browser traps focus, makes the
 * page inert, and closes on Escape. Focus returns to whatever opened it.
 */
export function Modal({ open, title, onClose, children, description }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocus.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (event.target === ref.current) onClose();
      }}
    >
      {open ? (
        <div className="dialog__body">
          <h2 id={titleId} className="dialog__title">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="dialog__desc">
              {description}
            </p>
          ) : null}
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, danger = true }: ConfirmProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} description={message}>
      <div className="dialog__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} autoFocus>
          Cancel
        </button>
        <button type="button" className={`btn ${danger ? "btn--danger" : ""}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
