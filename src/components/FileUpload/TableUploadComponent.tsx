import React, { useEffect, useRef, useState } from 'react';
import { FileUploadComponentProps, UploadError } from '../../types';
import './TableUploadComponent.css';

type UploadRowStatus = 'uploading' | 'completed' | 'error';

interface UploadRow {
  id: string;
  file: File;
  progress: number;
  status: UploadRowStatus;
  error?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const unitSize = 1024;
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(unitSize));
  const value = bytes / Math.pow(unitSize, unitIndex);
  return `${Math.round(value * 100) / 100} ${units[unitIndex]}`;
};

const getFileTypeLabel = (file: File): string => {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) return 'Image';
  if (type.startsWith('video/')) return 'Video';
  if (type.startsWith('audio/')) return 'Audio';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('excel') || type.includes('sheet')) return 'Excel';
  if (type.includes('json')) return 'JSON';
  if (type.includes('zip')) return 'Archive';
  if (type.includes('text') || type.includes('csv')) return 'Text';
  return 'File';
};

const getFileIcon = (file: File): string => {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('excel') || type.includes('sheet')) return '📊';
  if (type.includes('json')) return '🧾';
  if (type.includes('zip')) return '🗜️';
  return '📁';
};

const createUploadError = (message: string, details?: string[]): UploadError => ({
  code: 'FILE_VALIDATION_ERROR',
  message,
  details
});

export const TableUploadComponent: React.FC<FileUploadComponentProps> = ({
  acceptedFormats,
  maxFileSize,
  onFileSelected,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRows(prevRows => prevRows.map(row => {
        if (row.status !== 'uploading') {
          return row;
        }

        const nextProgress = Math.min(row.progress + 20, 100);
        return {
          ...row,
          progress: nextProgress,
          status: nextProgress >= 100 ? 'completed' : 'uploading'
        };
      }));
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const validateFile = (file: File): string[] => {
    const validationErrors: string[] = [];
    if (file.size > maxFileSize) {
      validationErrors.push(`File size exceeds maximum allowed size of ${formatBytes(maxFileSize)}`);
    }

    const allowsAllFormats = acceptedFormats.some(format => format === '*');
    if (!allowsAllFormats) {
      const lowerFileName = file.name.toLowerCase();
      const isSupported = acceptedFormats.some(format => {
        const normalized = format.toLowerCase();
        return normalized.startsWith('.')
          ? lowerFileName.endsWith(normalized)
          : file.type.toLowerCase().includes(normalized);
      });

      if (!isSupported) {
        validationErrors.push(`Unsupported file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      }
    }

    return validationErrors;
  };

  const addFile = (file: File) => {
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      onError(createUploadError(validationErrors.join('; '), validationErrors));
      return;
    }

    setErrors([]);

    const row: UploadRow = {
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      progress: 0,
      status: 'uploading'
    };

    setRows(prevRows => [row, ...prevRows].slice(0, 10));
    onFileSelected(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFile(files[0]);
    }
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      addFile(files[0]);
    }
  };

  const removeRow = (rowId: string) => {
    setRows(prevRows => prevRows.filter(row => row.id !== rowId));
  };

  const retryRow = (rowId: string) => {
    setRows(prevRows => prevRows.map(row => row.id === rowId
      ? { ...row, progress: 0, status: 'uploading', error: undefined }
      : row));
  };

  return (
    <div className="table-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={onInputChange}
        className="table-upload__input"
      />

      <div
        className={`table-upload__dropzone ${isDragging ? 'table-upload__dropzone--dragging' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="table-upload__drop-content">
          <div className="table-upload__drop-icon" aria-hidden="true">⬆️</div>
          <p className="table-upload__drop-title">
            Drop a file here or{' '}
            <button type="button" className="table-upload__link" onClick={openFileDialog}>
              browse
            </button>
          </p>
          <p className="table-upload__drop-hint">
            Max size: {formatBytes(maxFileSize)} • Accepted: {acceptedFormats.join(', ')}
          </p>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="table-upload__table-wrapper">
          <div className="table-upload__table-header">
            <h3 className="table-upload__title">Files ({rows.length})</h3>
          </div>
          <table className="table-upload__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td>
                    <span className="table-upload__file-name">
                      <span aria-hidden="true">{getFileIcon(row.file)}</span>
                      {row.file.name}
                    </span>
                    {row.status === 'uploading' && (
                      <div className="table-upload__progress">
                        <div className="table-upload__progress-bar" style={{ width: `${row.progress}%` }} />
                      </div>
                    )}
                  </td>
                  <td>{getFileTypeLabel(row.file)}</td>
                  <td>{formatBytes(row.file.size)}</td>
                  <td>
                    {row.status === 'uploading' && `${Math.floor(row.progress)}%`}
                    {row.status === 'completed' && 'Completed'}
                    {row.status === 'error' && 'Error'}
                  </td>
                  <td>
                    {row.status === 'error' ? (
                      <button type="button" className="table-upload__action" onClick={() => retryRow(row.id)}>
                        Retry
                      </button>
                    ) : (
                      <button type="button" className="table-upload__action" onClick={() => removeRow(row.id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errors.length > 0 && (
        <div className="table-upload__errors" role="alert">
          {errors.map((error, index) => (
            <p key={`${error}-${index}`}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};
