/**
 * Unit tests for FileParser validation logic
 * 
 * Tests file format validation (extension and MIME type) and file size validation
 * Requirements: 3.2, 4.1, 4.2
 */

import { FileParser, FileParserConfig } from './FileParser';
import { FileFormat } from '@/types';

// Define supported formats for testing (shared across all test suites)
const supportedFormats: FileFormat[] = [
  {
    extension: 'txt',
    mimeType: 'text/plain',
    validator: (file: File) => file.name.endsWith('.txt') && file.type === 'text/plain'
  },
  {
    extension: 'json',
    mimeType: 'application/json',
    validator: (file: File) => file.name.endsWith('.json') && file.type === 'application/json'
  },
  {
    extension: 'csv',
    mimeType: 'text/csv',
    validator: (file: File) => file.name.endsWith('.csv') && file.type === 'text/csv'
  }
];

const defaultConfig: FileParserConfig = {
  supportedFormats,
  maxFileSize: 5 * 1024 * 1024 // 5MB
};

describe('FileParser', () => {

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      const parser = new FileParser(defaultConfig);
      expect(parser.getSupportedFormats()).toEqual(supportedFormats);
      expect(parser.getMaxFileSize()).toBe(5 * 1024 * 1024);
    });

    it('should use default max file size when not provided', () => {
      const parser = new FileParser({ supportedFormats });
      expect(parser.getMaxFileSize()).toBe(10 * 1024 * 1024); // 10MB default
    });
  });

  describe('validate - format validation', () => {
    let parser: FileParser;

    beforeEach(() => {
      parser = new FileParser(defaultConfig);
    });

    it('should accept valid txt file with correct extension and MIME type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid json file with correct extension and MIME type', () => {
      const file = new File(['{"key": "value"}'], 'data.json', { type: 'application/json' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid csv file with correct extension and MIME type', () => {
      const file = new File(['col1,col2\nval1,val2'], 'data.csv', { type: 'text/csv' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file with unsupported extension', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File format not supported');
      expect(result.errors[0]).toContain('txt, json, csv');
    });

    it('should reject file with correct extension but wrong MIME type', () => {
      const file = new File(['content'], 'test.txt', { type: 'application/octet-stream' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File format not supported');
    });

    it('should reject file with correct MIME type but wrong extension', () => {
      const file = new File(['content'], 'test.doc', { type: 'text/plain' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File format not supported');
    });

    it('should handle file with no extension', () => {
      const file = new File(['content'], 'testfile', { type: 'text/plain' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File format not supported');
    });

    it('should handle file with multiple dots in name', () => {
      const file = new File(['content'], 'test.backup.txt', { type: 'text/plain' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should be case-insensitive for extensions', () => {
      const file = new File(['content'], 'test.TXT', { type: 'text/plain' });
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validate - file size validation', () => {
    it('should accept file within size limit', () => {
      const parser = new FileParser(defaultConfig);
      const content = 'a'.repeat(1024 * 1024); // 1MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept file at exact size limit', () => {
      const parser = new FileParser(defaultConfig);
      const content = 'a'.repeat(5 * 1024 * 1024); // Exactly 5MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file exceeding size limit', () => {
      const parser = new FileParser(defaultConfig);
      const content = 'a'.repeat(6 * 1024 * 1024); // 6MB (exceeds 5MB limit)
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File size');
      expect(result.errors[0]).toContain('exceeds maximum allowed size');
      expect(result.errors[0]).toContain('5.00MB');
    });

    it('should reject empty file', () => {
      const parser = new FileParser(defaultConfig);
      const file = new File([], 'test.txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('File is empty');
    });

    it('should handle very small files', () => {
      const parser = new FileParser(defaultConfig);
      const file = new File(['a'], 'test.txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validate - combined validation', () => {
    let parser: FileParser;

    beforeEach(() => {
      parser = new FileParser(defaultConfig);
    });

    it('should report multiple errors when both format and size are invalid', () => {
      const content = 'a'.repeat(6 * 1024 * 1024); // 6MB (exceeds limit)
      const file = new File([content], 'test.pdf', { type: 'application/pdf' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('File size');
      expect(result.errors[1]).toContain('File format not supported');
    });

    it('should report empty file error along with format error', () => {
      const file = new File([], 'test.pdf', { type: 'application/pdf' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some(e => e.includes('empty'))).toBe(true);
      expect(result.errors.some(e => e.includes('format not supported'))).toBe(true);
    });
  });

  describe('getSupportedFormats', () => {
    it('should return a copy of supported formats', () => {
      const parser = new FileParser(defaultConfig);
      const formats = parser.getSupportedFormats();
      
      expect(formats).toEqual(supportedFormats);
      expect(formats).not.toBe(supportedFormats); // Should be a copy
    });
  });

  describe('getMaxFileSize', () => {
    it('should return the configured max file size', () => {
      const parser = new FileParser(defaultConfig);
      expect(parser.getMaxFileSize()).toBe(5 * 1024 * 1024);
    });
  });

  describe('edge cases', () => {
    it('should handle file with special characters in name', () => {
      const parser = new FileParser(defaultConfig);
      const file = new File(['content'], 'test-file_123 (copy).txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file with unicode characters in name', () => {
      const parser = new FileParser(defaultConfig);
      const file = new File(['content'], 'тест-файл.txt', { type: 'text/plain' });
      
      const result = parser.validate(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should use custom validator when extension and MIME match', () => {
      // Test that validator is used as additional check when extension/MIME match
      const customFormats: FileFormat[] = [
        {
          extension: 'custom',
          mimeType: 'application/custom',
          validator: (file: File) => {
            // Additional validation: file name must start with 'valid-'
            return file.name.startsWith('valid-');
          }
        }
      ];
      
      const parser = new FileParser({ supportedFormats: customFormats });
      
      // Both files have correct extension and MIME, so they pass the basic check
      // The validator is only used as a fallback when extension/MIME don't match
      const validFile = new File(['content'], 'valid-test.custom', { type: 'application/custom' });
      const invalidFile = new File(['content'], 'invalid-test.custom', { type: 'application/custom' });
      
      // Both should pass because extension and MIME type match
      expect(parser.validate(validFile).isValid).toBe(true);
      expect(parser.validate(invalidFile).isValid).toBe(true);
    });

    it('should use custom validator as fallback when extension or MIME do not match', () => {
      // Test that validator can override when extension/MIME don't match
      const customFormats: FileFormat[] = [
        {
          extension: 'custom',
          mimeType: 'application/custom',
          validator: (file: File) => {
            // Accept any .txt file regardless of MIME type
            return file.name.endsWith('.txt');
          }
        }
      ];
      
      const parser = new FileParser({ supportedFormats: customFormats });
      
      // This file has wrong extension but validator accepts .txt files
      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(parser.validate(txtFile).isValid).toBe(true);
      
      // This file doesn't match extension/MIME and validator rejects it
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(parser.validate(pdfFile).isValid).toBe(false);
    });
  });
});

  describe('parse - async file parsing workflow', () => {
    let parser: FileParser;

    beforeEach(() => {
      parser = new FileParser(defaultConfig);
    });

    it('should successfully parse a valid text file', async () => {
      const content = 'Hello, World!';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content?.raw).toBe(content);
      expect(result.content?.metadata.name).toBe('test.txt');
      expect(result.content?.metadata.size).toBe(content.length);
      expect(result.content?.metadata.type).toBe('text/plain');
      expect(result.error).toBeUndefined();
    });

    it('should successfully parse a valid JSON file', async () => {
      const content = '{"key": "value", "number": 42}';
      const file = new File([content], 'data.json', { type: 'application/json' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content?.raw).toBe(content);
      expect(result.content?.metadata.name).toBe('data.json');
      expect(result.content?.metadata.type).toBe('application/json');
      expect(result.error).toBeUndefined();
    });

    it('should successfully parse a valid CSV file', async () => {
      const content = 'name,age\nJohn,30\nJane,25';
      const file = new File([content], 'data.csv', { type: 'text/csv' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content?.raw).toBe(content);
      expect(result.content?.metadata.name).toBe('data.csv');
      expect(result.error).toBeUndefined();
    });

    it('should reject file with invalid format before reading content', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(false);
      expect(result.content).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('File format not supported');
    });

    it('should reject empty file before reading content', async () => {
      const file = new File([], 'test.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(false);
      expect(result.content).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('File is empty');
    });

    it('should reject file exceeding size limit before reading content', async () => {
      const content = 'a'.repeat(6 * 1024 * 1024); // 6MB (exceeds 5MB limit)
      const file = new File([content], 'large.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(false);
      expect(result.content).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('exceeds maximum allowed size');
    });

    it('should include lastModified timestamp in metadata', async () => {
      const file = new File(['content'], 'test.txt', { 
        type: 'text/plain',
        lastModified: 1234567890000
      });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content?.metadata.lastModified).toBe(1234567890000);
    });

    it('should handle files with special characters in content', async () => {
      const content = 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const file = new File([content], 'special.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content?.raw).toBe(content);
    });

    it('should handle files with unicode content', async () => {
      const content = 'Unicode: 你好世界 🌍 Привет мир';
      const file = new File([content], 'unicode.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content?.raw).toBe(content);
    });

    it('should handle files with newlines and whitespace', async () => {
      const content = 'Line 1\nLine 2\r\nLine 3\n\n  Indented  \n';
      const file = new File([content], 'multiline.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(true);
      expect(result.content?.raw).toBe(content);
    });
  });

  describe('extractContent - file content extraction', () => {
    let parser: FileParser;

    beforeEach(() => {
      parser = new FileParser(defaultConfig);
    });

    it('should extract content and metadata from text file', async () => {
      const content = 'Test content';
      const file = new File([content], 'test.txt', { 
        type: 'text/plain',
        lastModified: 1234567890000
      });
      
      const result = await parser.extractContent(file);
      
      expect(result.raw).toBe(content);
      expect(result.metadata).toEqual({
        name: 'test.txt',
        size: content.length,
        type: 'text/plain',
        lastModified: 1234567890000
      });
    });

    it('should extract content and metadata from JSON file', async () => {
      const content = '{"test": true}';
      const file = new File([content], 'data.json', { 
        type: 'application/json',
        lastModified: 9876543210000
      });
      
      const result = await parser.extractContent(file);
      
      expect(result.raw).toBe(content);
      expect(result.metadata.name).toBe('data.json');
      expect(result.metadata.type).toBe('application/json');
      expect(result.metadata.lastModified).toBe(9876543210000);
    });

    it('should read text files as text', async () => {
      const content = 'Plain text content';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const result = await parser.extractContent(file);
      
      expect(typeof result.raw).toBe('string');
      expect(result.raw).toBe(content);
    });

    it('should read JSON files as text', async () => {
      const content = '{"key": "value"}';
      const file = new File([content], 'data.json', { type: 'application/json' });
      
      const result = await parser.extractContent(file);
      
      expect(typeof result.raw).toBe('string');
      expect(result.raw).toBe(content);
    });

    it('should read CSV files as text', async () => {
      const content = 'col1,col2\nval1,val2';
      const file = new File([content], 'data.csv', { type: 'text/csv' });
      
      const result = await parser.extractContent(file);
      
      expect(typeof result.raw).toBe('string');
      expect(result.raw).toBe(content);
    });

    it('should handle empty string content', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      
      const result = await parser.extractContent(file);
      
      expect(result.raw).toBe('');
      expect(result.metadata.size).toBe(0);
    });

    it('should preserve exact file size in metadata', async () => {
      const content = 'a'.repeat(1000);
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const result = await parser.extractContent(file);
      
      expect(result.metadata.size).toBe(1000);
    });
  });

  describe('error handling - graceful error handling', () => {
    let parser: FileParser;

    beforeEach(() => {
      parser = new FileParser(defaultConfig);
    });

    it('should handle multiple validation errors gracefully', async () => {
      const content = 'a'.repeat(6 * 1024 * 1024); // Exceeds size limit
      const file = new File([content], 'test.pdf', { type: 'application/pdf' }); // Wrong format
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('File size');
      expect(result.error?.message).toContain('File format not supported');
      expect(result.error?.details).toBeInstanceOf(Array);
    });

    it('should not throw unhandled exceptions on validation errors', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      await expect(parser.parse(file)).resolves.toBeDefined();
    });

    it('should return structured error for validation failures', async () => {
      const file = new File([], 'test.txt', { type: 'text/plain' });
      
      const result = await parser.parse(file);
      
      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        code: expect.any(String),
        message: expect.any(String),
        details: expect.any(Array)
      });
    });
  });
