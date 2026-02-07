/**
 * Enhanced FileParser with Browser-Based Libraries
 * 
 * Uses Papa Parse for CSV, SheetJS for Excel, PDF.js for PDFs
 * All processing happens in the browser - no server needed!
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import {
  FileFormat,
  ParseResult,
  ValidationResult,
  FileContent,
  FileMetadata,
  ParsedTableData
} from '../types';

export interface EnhancedFileParserConfig {
  supportedFormats: FileFormat[];
  maxFileSize?: number;
}

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs';
}

export class EnhancedFileParser {
  private static tesseractLoaderPromise: Promise<any> | null = null;
  private supportedFormats: FileFormat[];
  private maxFileSize: number;

  constructor(config: EnhancedFileParserConfig) {
    this.supportedFormats = config.supportedFormats;
    this.maxFileSize = config.maxFileSize ?? 10 * 1024 * 1024; // 10MB default
  }

  /**
   * Validates file format and size
   */
  validate(file: File): ValidationResult {
    const errors: string[] = [];

    // Size validation
    if (file.size > this.maxFileSize) {
      const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      errors.push(`File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`);
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Format validation
    const extension = this.getFileExtension(file.name);
    const formatMatch = this.supportedFormats.find(format => 
      format.extension.toLowerCase() === extension.toLowerCase() &&
      (format.mimeType === file.type || (format.validator && format.validator(file)))
    );

    if (!formatMatch) {
      const supportedExtensions = this.supportedFormats.map(f => f.extension).join(', ');
      errors.push(`File format not supported. Supported formats: ${supportedExtensions}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Main parse method - routes to appropriate parser based on file type
   */
  async parse(file: File): Promise<ParseResult> {
    try {
      // Validate first
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

      // Route to appropriate parser
      const extension = this.getFileExtension(file.name);
      let parsedData: ParsedTableData;

      switch (extension.toLowerCase()) {
        case 'csv':
          parsedData = await this.parseCSV(file);
          break;
        case 'xlsx':
        case 'xls':
          parsedData = await this.parseExcel(file);
          break;
        case 'pdf':
          parsedData = await this.parsePDF(file);
          break;
        case 'json':
          parsedData = await this.parseJSON(file);
          break;
        case 'txt':
          parsedData = await this.parseText(file);
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
        case 'gif':
          parsedData = await this.parseImage(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }

      // Build result
      const content: FileContent = {
        raw: parsedData,
        metadata: this.extractMetadata(file)
      };

      return {
        success: true,
        content
      };

    } catch (error) {
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
   * Parse CSV using Papa Parse
   * Handles complex CSVs with quotes, different delimiters, etc.
   */
  private async parseCSV(file: File): Promise<ParsedTableData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true, // Auto-convert numbers and booleans
        skipEmptyLines: true,
        complete: (results: any) => {
          const headers: string[] = results.meta.fields || [];
          const rows = results.data.map((row: Record<string, unknown>) =>
            headers.map((header: string) => this.toCellValue(row[header]))
          );

          resolve({
            headers,
            rows,
            rowCount: rows.length,
            columnCount: headers.length,
            sourceType: 'csv'
          });
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel using SheetJS
   * Supports .xlsx, .xls, and other spreadsheet formats
   */
  private async parseExcel(file: File): Promise<ParsedTableData> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length === 0) {
      throw new Error('Excel file is empty');
    }

    const headers = jsonData[0].map(h => String(h));
    const rows = jsonData.slice(1).map(row => row.map(value => this.toCellValue(value)));

    return {
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
      sourceType: 'excel'
    };
  }

  /**
   * Parse PDF using native PDF.js text extraction
   * OCR is intentionally not invoked for PDF files
   */
  private async parsePDF(file: File): Promise<ParsedTableData> {
    if (typeof document === 'undefined') {
      throw new Error('PDF parsing requires a browser environment');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    try {
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const nativeText = await this.extractNativePdfText(page);
        if (nativeText) {
          pageTexts.push(nativeText);
        }
      }
    } finally {
      pdfDocument.cleanup();
      await pdfDocument.destroy();
    }

    const text = pageTexts.join('\n').trim();
    if (!text) {
      throw new Error('No readable native text found in PDF');
    }

    return this.createTextData(text, 'pdf');
  }

  /**
   * Parse image files using OCR
   */
  private async parseImage(file: File): Promise<ParsedTableData> {
    const worker = await this.createOcrWorker();

    try {
      const { data } = await worker.recognize(file);
      const text = data?.text?.trim() || '';

      if (!text) {
        throw new Error('No readable text found in image');
      }

      return this.createTextData(text, 'image-ocr');
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Extract text directly from PDF text layer when available
   */
  private async extractNativePdfText(page: any): Promise<string> {
    const textContent = await page.getTextContent();
    const textItems = textContent.items || [];

    return textItems
      .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Load Tesseract.js lazily from CDN and create an OCR worker
   */
  private async createOcrWorker(): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('OCR requires a browser environment');
    }

    const tesseract = await this.loadTesseract();
    return tesseract.createWorker('eng');
  }

  /**
   * Ensure Tesseract.js is available on window
   */
  private async loadTesseract(): Promise<any> {
    const windowWithTesseract = window as Window & { Tesseract?: any };

    if (windowWithTesseract.Tesseract?.createWorker) {
      return windowWithTesseract.Tesseract;
    }

    if (!EnhancedFileParser.tesseractLoaderPromise) {
      EnhancedFileParser.tesseractLoaderPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.async = true;

        script.onload = () => {
          if (windowWithTesseract.Tesseract?.createWorker) {
            resolve(windowWithTesseract.Tesseract);
            return;
          }
          reject(new Error('Tesseract.js loaded but createWorker is unavailable'));
        };

        script.onerror = () => {
          reject(new Error('Failed to load Tesseract.js from CDN'));
        };

        document.head.appendChild(script);
      });
    }

    return EnhancedFileParser.tesseractLoaderPromise;
  }

  /**
   * Convert extracted text into a normalized table-like structure
   */
  private createTextData(text: string, sourceType: ParsedTableData['sourceType']): ParsedTableData {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    const parsedData: ParsedTableData = {
      headers: ['Content'],
      rows: lines.map(line => [line]),
      rowCount: lines.length,
      columnCount: 1,
      sourceType
    };

    if (sourceType === 'image-ocr') {
      parsedData.ocrText = text;
    }

    return parsedData;
  }

  /**
   * Normalize dynamic parser output into supported cell values
   */
  private toCellValue(value: unknown): string | number | boolean | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    return JSON.stringify(value);
  }

  /**
   * Parse JSON files
   */
  private async parseJSON(file: File): Promise<ParsedTableData> {
    const text = await this.readAsText(file);
    const data = JSON.parse(text);

    // Handle array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0]);
      const rows = data.map((obj: Record<string, unknown>) =>
        headers.map(h => this.toCellValue(obj[h]))
      );
      
      return {
        headers,
        rows,
        rowCount: rows.length,
        columnCount: headers.length,
        sourceType: 'json'
      };
    }

    // Handle nested object with top-level array payloads (e.g. { landmarks: [...] })
    const topLevelArrayKey = Object.keys(data).find(key => {
      const value = (data as Record<string, unknown>)[key];
      return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object';
    });

    if (topLevelArrayKey) {
      const nestedRows = (data as Record<string, unknown>)[topLevelArrayKey] as Array<Record<string, unknown>>;
      const headers = Object.keys(nestedRows[0]);
      const rows = nestedRows.map(item => headers.map(header => this.toCellValue(item[header])));

      return {
        headers,
        rows,
        rowCount: rows.length,
        columnCount: headers.length,
        sourceType: 'json'
      };
    }

    // Handle single object
    if (typeof data === 'object' && !Array.isArray(data)) {
      const headers = Object.keys(data);
      const rows = [Object.values(data).map(value => this.toCellValue(value))];
      
      return {
        headers,
        rows,
        rowCount: 1,
        columnCount: headers.length,
        sourceType: 'json'
      };
    }

    throw new Error('JSON format not supported. Expected array of objects or single object.');
  }

  /**
   * Parse plain text files
   */
  private async parseText(file: File): Promise<ParsedTableData> {
    const text = await this.readAsText(file);
    return this.createTextData(text, 'txt');
  }

  /**
   * Helper: Read file as text
   */
  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Extract file metadata
   */
  private extractMetadata(file: File): FileMetadata {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): FileFormat[] {
    return [...this.supportedFormats];
  }

  /**
   * Get max file size
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }
}
