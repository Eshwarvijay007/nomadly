/**
 * File Upload UI - Main Entry Point
 * 
 * File upload feature with parsing and metadata form components.
 */

// Components
export { TableUploadComponent } from './components/FileUpload';
export { MetadataForm } from './components/MetadataForm';

// Parser
export { FileParser } from './parser';
export { EnhancedFileParser } from './parser';

// State Management
export { UploadStateManager } from './state';

// Utilities
export { ErrorHandler } from './utils';
export { extractMetadataFromContent } from './utils';

// Types
export * from './types';
