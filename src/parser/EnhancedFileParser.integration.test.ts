import { FileFormat, ParsedTableData } from '../types';
import { extractMetadataFromContent } from '../utils/MetadataExtractor';

declare const require: any;
declare const process: any;

const fs = require('fs');
const path = require('path');
const getDocumentMock = jest.fn();

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: (...args: any[]) => getDocumentMock(...args)
}));

const { EnhancedFileParser } = require('./EnhancedFileParser');

const TEST_FILES_DIR = path.resolve(process.cwd(), 'test-files');

const hasExtension = (file: File, extensions: string[]): boolean => {
  const name = file.name.toLowerCase();
  return extensions.some(extension => name.endsWith(extension));
};

const supportedFormats: FileFormat[] = [
  { extension: 'txt', mimeType: 'text/plain', validator: (file: File) => hasExtension(file, ['.txt']) },
  { extension: 'csv', mimeType: 'text/csv', validator: (file: File) => hasExtension(file, ['.csv']) },
  { extension: 'json', mimeType: 'application/json', validator: (file: File) => hasExtension(file, ['.json']) },
  { extension: 'pdf', mimeType: 'application/pdf', validator: (file: File) => hasExtension(file, ['.pdf']) },
  { extension: 'png', mimeType: 'image/png', validator: (file: File) => hasExtension(file, ['.png']) },
  { extension: 'jpg', mimeType: 'image/jpeg', validator: (file: File) => hasExtension(file, ['.jpg', '.jpeg']) },
  { extension: 'jpeg', mimeType: 'image/jpeg', validator: (file: File) => hasExtension(file, ['.jpeg', '.jpg']) },
  { extension: 'webp', mimeType: 'image/webp', validator: (file: File) => hasExtension(file, ['.webp']) },
  { extension: 'gif', mimeType: 'image/gif', validator: (file: File) => hasExtension(file, ['.gif']) }
];

function createParser(): any {
  return new EnhancedFileParser({
    supportedFormats,
    maxFileSize: 10 * 1024 * 1024
  });
}

function getMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.txt')) return 'text/plain';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

function loadFileAsBrowserFile(fileName: string): File {
  const fullPath = path.join(TEST_FILES_DIR, fileName);
  const content = fs.readFileSync(fullPath, 'utf8');
  return new File([content], fileName, { type: getMimeType(fileName) });
}

describe('EnhancedFileParser Integration', () => {
  beforeEach(() => {
    getDocumentMock.mockReset();
    getDocumentMock.mockImplementation(() => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: jest.fn().mockResolvedValue({
          getTextContent: jest.fn().mockResolvedValue({
            items: [{ str: 'Place Name: Eiffel Tower Location: Paris' }]
          })
        }),
        cleanup: jest.fn(),
        destroy: jest.fn().mockResolvedValue(undefined)
      })
    }));
  });

  describe('OCR invocation policy', () => {
    it('does not invoke OCR worker for CSV parsing', async () => {
      const parser = createParser();
      const ocrSpy = jest.spyOn(parser as any, 'createOcrWorker');
      const file = new File(['Place Name,Location\nEiffel Tower,Paris'], 'input.csv', { type: 'text/csv' });

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(ocrSpy).not.toHaveBeenCalled();
    });

    it('invokes OCR worker for image parsing', async () => {
      const parser = createParser();
      const mockWorker = {
        recognize: jest.fn().mockResolvedValue({
          data: { text: 'Place Name: Eiffel Tower\nLocation: Paris, France' }
        }),
        terminate: jest.fn().mockResolvedValue(undefined)
      };

      const ocrSpy = jest
        .spyOn(parser as any, 'createOcrWorker')
        .mockResolvedValue(mockWorker);

      const imageFile = new File(['fake-image-bytes'], 'scan.png', { type: 'image/png' });
      const result = await parser.parse(imageFile);

      expect(ocrSpy).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(mockWorker.recognize).toHaveBeenCalledTimes(1);
      expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
    });

    it('does not invoke OCR worker for PDF files', async () => {
      const parser = createParser();
      const ocrSpy = jest.spyOn(parser as any, 'createOcrWorker');
      const pdfFile = new File(['not-a-valid-pdf'], 'sample.pdf', { type: 'application/pdf' });

      await parser.parse(pdfFile);

      expect(ocrSpy).not.toHaveBeenCalled();
    });
  });

  describe('Metadata prefill values from test files', () => {
    const cases = [
      { fileName: 'locations-clean.csv', placeIncludes: 'eiffel tower', locationIncludes: 'paris' },
      { fileName: 'locations-with-noise.csv', placeIncludes: 'eiffel tower', locationIncludes: 'paris' },
      { fileName: 'locations-messy.csv', placeIncludes: 'eiffel tower', locationIncludes: 'paris' },
      { fileName: 'locations-different-formats.json', placeIncludes: 'eiffel tower', locationIncludes: 'paris' },
      { fileName: 'locations-special-characters.txt', placeIncludes: 'eiffel tower', locationIncludes: 'paris' },
      { fileName: 'sample.csv', placeIncludes: 'john doe', locationIncludes: 'new york' },
      { fileName: 'sample.json', placeIncludes: 'john doe', locationIncludes: 'new york' }
    ];

    it.each(cases)('extracts metadata for $fileName', async ({ fileName, placeIncludes, locationIncludes }) => {
      const parser = createParser();
      const file = loadFileAsBrowserFile(fileName);
      const parseResult = await parser.parse(file);

      expect(parseResult.success).toBe(true);
      expect(parseResult.content).toBeDefined();

      const parsedData = parseResult.content?.raw as ParsedTableData;
      const metadata = extractMetadataFromContent(parsedData);

      expect(metadata.placeName.toLowerCase()).toContain(placeIncludes);
      expect(metadata.location.toLowerCase()).toContain(locationIncludes);
      expect(metadata.placeConfidence).toBeGreaterThan(0);
      expect(metadata.locationConfidence).toBeGreaterThan(0);
    });

    it('prints metadata form prefills for all provided test files', async () => {
      const parser = createParser();
      const rows: Array<Record<string, string>> = [];

      for (const testCase of cases) {
        const file = loadFileAsBrowserFile(testCase.fileName);
        const startedAt = Date.now();
        const parseResult = await parser.parse(file);
        const parseMs = Date.now() - startedAt;
        const parsedData = parseResult.content?.raw as ParsedTableData;
        const metadata = extractMetadataFromContent(parsedData);

        rows.push({
          file: testCase.fileName,
          sourceType: parsedData?.sourceType || 'unknown',
          parseMs: String(parseMs),
          placeNamePrefill: metadata.placeName || '(empty)',
          locationPrefill: metadata.location || '(empty)',
          placeConfidence: metadata.placeConfidence.toFixed(2),
          locationConfidence: metadata.locationConfidence.toFixed(2)
        });
      }

      console.table(rows);
      const parseTimes = rows.map(row => Number(row.parseMs));
      const averageMs = parseTimes.reduce((sum, value) => sum + value, 0) / parseTimes.length;
      const maxMs = Math.max(...parseTimes);
      console.log(`Parse timing stats -> avg: ${averageMs.toFixed(2)}ms, max: ${maxMs}ms`);
      expect(rows).toHaveLength(cases.length);
      expect(maxMs).toBeLessThan(1000);
    });
  });
});
