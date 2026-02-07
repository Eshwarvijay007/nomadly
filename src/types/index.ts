/**
 * Type definitions for the File Upload UI feature
 * 
 * This file contains all TypeScript interfaces and types used across
 * the file upload components, parser, and metadata form.
 */

// ============================================================================
// Upload State Types
// ============================================================================

export enum UploadState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
  SELECTED = 'selected',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum SessionState {
  AWAITING_FILE = 'awaiting_file',
  FILE_SELECTED = 'file_selected',
  PARSING = 'parsing',
  PARSE_ERROR = 'parse_error',
  AWAITING_METADATA = 'awaiting_metadata',
  READY_TO_SUBMIT = 'ready_to_submit',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  SUBMISSION_ERROR = 'submission_error'
}

export enum FileStatus {
  PENDING = 'pending',
  PARSING = 'parsing',
  PARSED = 'parsed',
  ERROR = 'error'
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

// ============================================================================
// Error Types
// ============================================================================

export interface UploadError {
  code: string;
  message: string;
  details?: any;
}

export interface ParseError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FileValidationError {
  type: 'format' | 'size' | 'content';
  message: string;
}

// ============================================================================
// File Types
// ============================================================================

export interface FileFormat {
  extension: string;
  mimeType: string;
  validator: (file: File) => boolean;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileContent {
  raw: ParsedRawContent;
  metadata: FileMetadata;
}

export interface ParsedTableData {
  headers: string[];
  rows: Array<Array<string | number | boolean | null>>;
  rowCount: number;
  columnCount: number;
  sourceType?: 'csv' | 'excel' | 'json' | 'txt' | 'pdf' | 'image-ocr';
  ocrText?: string;
}

export type ParsedRawContent = string | ArrayBuffer | ParsedTableData;

export interface UploadFile {
  id: string;
  file: File;
  status: FileStatus;
  uploadedAt: Date;
  parsedContent?: FileContent;
  error?: UploadError;
}

// ============================================================================
// Parser Types
// ============================================================================

export interface ParseResult {
  success: boolean;
  content?: FileContent;
  error?: ParseError;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileValidation {
  isValid: boolean;
  errors: FileValidationError[];
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormData {
  placeName: string;
  location: string;
}

export interface UploadMetadata extends FormData {
  createdAt: Date;
  fileId: string;
}

export interface FormValidation {
  isValid: boolean;
  fieldErrors: Map<string, string>;
}

// ============================================================================
// Submission Types
// ============================================================================

export interface SubmissionPayload {
  file: File;
  parsedContent: FileContent;
  metadata: FormData;
  timestamp: number;
}

export interface UploadSubmission {
  id: string;
  file: UploadFile;
  metadata: UploadMetadata;
  submittedAt: Date;
  status: SubmissionStatus;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface FileUploadComponentProps {
  acceptedFormats: string[];
  maxFileSize: number;
  onFileSelected: (file: File) => void;
  onError: (error: UploadError) => void;
}

export interface MetadataFormProps {
  disabled: boolean;
  onSubmit: (data: FormData) => void;
  onValidationError: (errors: ValidationError[]) => void;
  initialValues?: Partial<FormData>;
}

// ============================================================================
// Error Handler Types
// ============================================================================

export interface ErrorContext {
  component: string;
  operation: string;
  timestamp: Date;
}

export interface ErrorResponse {
  userMessage: string;
  technicalDetails?: string;
  recoveryActions: RecoveryAction[];
}

export interface RecoveryAction {
  label: string;
  action: () => void;
  isPrimary: boolean;
}
