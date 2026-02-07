/**
 * FileParser
 * 
 * Processes uploaded files, validates format, and extracts content.
 * Implements validation logic for file format and size.
 */

import { FileFormat, ParseResult, ValidationResult, FileContent, FileMetadata } from '../types';

export interface FileParserConfig {
  supportedFormats: FileFormat[];
  maxFileSize?: number; // in bytes
}

export class FileParser {
  private supportedFormats: FileFormat[];
  private maxFileSize: number;

  constructor(config: FileParserConfig) {
    this.supportedFormats = config.supportedFormats;
    // Default max file size: 10MB
    this.maxFileSize = config.maxFileSize ?? 10 * 1024 * 1024;
  }

  /**
   * Validates a file against supported formats and size constraints.
   * Checks both file extension and MIME type.
   * 
   * Requirements: 3.2, 4.1, 4.2
   * 
   * @param file - The file to validate
   * @returns ValidationResult with isValid flag and error messages
   */
  validate(file: File): ValidationResult {
    const errors: string[] = [];

    // Validate file size (Requirement 4.2)
    if (file.size > this.maxFileSize) {
      const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      errors.push(
        `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
      );
    }

    // Validate file size is not zero
    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Extract file extension
    const fileName = file.name;
    const extensionMatch = fileName.match(/\.([^.]+)$/);
    const fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

    // Validate file format (Requirements 3.2, 4.1)
    // Check both extension and MIME type
    const formatMatch = this.supportedFormats.find(format => {
      const extensionMatches = format.extension.toLowerCase() === fileExtension;
      const mimeTypeMatches = format.mimeType === file.type;
      
      // Both extension and MIME type should match for strict validation
      // OR use custom validator if provided
      return (extensionMatches && mimeTypeMatches) || 
             (format.validator && format.validator(file));
    });

    if (!formatMatch) {
      const supportedExtensions = this.supportedFormats
        .map(f => f.extension)
        .join(', ');
      errors.push(
        `File format not supported. Supported formats: ${supportedExtensions}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parses a file by validating format and extracting content.
   * Implements the complete parsing workflow: validate -> read -> extract.
   * 
   * Requirements: 3.1, 3.2, 3.4
   * 
   * @param file - The file to parse
   * @returns ParseResult with success flag, content, or error
   */
  async parse(file: File): Promise<ParseResult> {
    try {
      // Step 1: Validate format first (Requirement 3.2)
      const validationResult = this.validate(file);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.errors.join('; '),
            details: validationResult.errors
          }
        };
      }

      // Step 2: Extract content (Requirements 3.1, 3.4)
      const content = await this.extractContent(file);

      return {
        success: true,
        content
      };
    } catch (error) {
      // Graceful error handling (Requirement 3.5)
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          details: error
        }
      };
    }
  }

  /**
   * Extracts file content and metadata using FileReader API.
   * Reads file content asynchronously and returns structured data.
   * 
   * Requirements: 3.1, 3.4
   * 
   * @param file - The file to extract content from
   * @returns FileContent with raw content and metadata
   */
  async extractContent(file: File): Promise<FileContent> {
    // Extract metadata (Requirement 3.4)
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };

    // Read file content asynchronously (Requirement 3.1)
    const raw = await this.readFileContent(file);

    return {
      raw,
      metadata
    };
  }

  /**
   * Reads file content using FileReader API.
   * Determines the appropriate reading method based on file type.
   * 
   * Requirements: 3.1
   * 
   * @param file - The file to read
   * @returns Promise resolving to file content as string or ArrayBuffer
   */
  private readFileContent(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result === null) {
          reject(new Error('FileReader returned null result'));
          return;
        }
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
      };

      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };

      // Determine reading method based on file type
      // For text-based formats, read as text
      // For binary formats, read as ArrayBuffer
      if (this.isTextFormat(file)) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  /**
   * Determines if a file should be read as text based on its MIME type.
   * 
   * @param file - The file to check
   * @returns true if file should be read as text, false for binary
   */
  private isTextFormat(file: File): boolean {
    const textMimeTypes = [
      'text/',
      'application/json',
      'application/xml',
      'application/javascript',
      'application/csv'
    ];

    return textMimeTypes.some(type => file.type.startsWith(type));
  }

  /**
   * Gets the list of supported file formats
   */
  getSupportedFormats(): FileFormat[] {
    return [...this.supportedFormats];
  }

  /**
   * Gets the maximum allowed file size in bytes
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }
}
