"use client";

import React from "react";
import styles from "./SyncIndicator.module.css";
import type { SyncStatus, SyncProgress } from "@/hooks/useImageSync";

interface SyncIndicatorProps {
  status: SyncStatus;
  progress: SyncProgress;
  error: string | null;
  onSync: () => void;
  onDismiss: () => void;
  labels: {
    title: string;
    description: string;
    syncButton: string;
    syncing: string;
    done: string;
    error: string;
    dismiss: string;
    downloading: string;
  };
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status,
  progress,
  error,
  onSync,
  onDismiss,
  labels,
}) => {
  if (status === "idle") {
    return null;
  }

  const percentage =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {status === "syncing" || status === "checking" ? (
            <svg
              className={styles.spinner}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : status === "done" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : status === "error" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.title}>
            {status === "done"
              ? labels.done
              : status === "error"
                ? labels.error
                : status === "syncing"
                  ? labels.syncing
                  : labels.title}
          </div>

          {status === "syncing" && progress.total > 0 && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {labels.downloading} {progress.current}/{progress.total}
              </span>
            </div>
          )}

          {status === "error" && error && (
            <div className={styles.errorText}>{error}</div>
          )}

          {status === "checking" && (
            <div className={styles.description}>{labels.description}</div>
          )}
        </div>

        <div className={styles.actions}>
          {(status === "checking" || status === "error") && (
            <button className={styles.syncButton} onClick={onSync}>
              {labels.syncButton}
            </button>
          )}
          {(status === "done" || status === "error") && (
            <button className={styles.dismissButton} onClick={onDismiss}>
              {labels.dismiss}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 同步提示弹窗
 */
interface SyncPromptProps {
  onSync: () => void;
  onSkip: () => void;
  labels: {
    title: string;
    description: string;
    syncButton: string;
    skipButton: string;
  };
}

export const SyncPrompt: React.FC<SyncPromptProps> = ({
  onSync,
  onSkip,
  labels,
}) => {
  return (
    <div className={styles.promptOverlay}>
      <div className={styles.promptCard}>
        <div className={styles.promptIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <h3 className={styles.promptTitle}>{labels.title}</h3>
        <p className={styles.promptDescription}>{labels.description}</p>
        <div className={styles.promptActions}>
          <button className={styles.promptSyncButton} onClick={onSync}>
            {labels.syncButton}
          </button>
          <button className={styles.promptSkipButton} onClick={onSkip}>
            {labels.skipButton}
          </button>
        </div>
      </div>
    </div>
  );
};
