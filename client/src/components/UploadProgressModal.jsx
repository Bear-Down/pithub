
import React from 'react';

/**
 * UploadProgressModal
 *
 * Displays upload progress, the file name, and a cancel button.
 *
 * Props:
 *  - isOpen    {boolean} Whether the modal is visible
 *  - progress  {number} Upload progress from 0–100
 *  - fileName  {string} Name of the file being uploaded
 *  - onCancel  {function} Cancels the current upload
 */
const UploadProgressModal = ({
    isOpen,
    progress = 0,
    fileName = '',
    onCancel
}) => {
    if (!isOpen) return null;

    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div
            className="upload-progress-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Uploading file"
        >
            <div className="upload-progress-card">
                <h2 className="upload-progress-title">
                    Uploading File…
                </h2>

                {fileName && (
                    <p
                        className="upload-progress-filename"
                        title={fileName}
                    >
                        {fileName.length > 45
                            ? `${fileName.slice(0, 42)}…`
                            : fileName}
                    </p>
                )}

                {/* Progress bar */}
                <div
                    className="upload-progress-track"
                    role="progressbar"
                    aria-valuenow={clampedProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="upload-progress-fill"
                        style={{ width: `${clampedProgress}%` }}
                    />
                </div>

                <p className="upload-progress-percent">
                    {clampedProgress}%
                </p>

                {/* Warning banner */}
                <div className="upload-progress-warning">
                    <span
                        className="upload-warning-icon"
                        aria-hidden="true"
                    >
                        WARNING!
                    </span>

                    <span>
                        <strong>
                            Do not close or navigate away
                        </strong>{' '}
                        from this page. Leaving now will cancel
                        the upload.
                    </span>
                </div>

                {/* Cancel button */}
                <button
                    type="button"
                    className="upload-progress-cancel"
                    onClick={onCancel}
                    disabled={!onCancel}
                >
                    Cancel Upload
                </button>
            </div>
        </div>
    );
};

export default UploadProgressModal;
