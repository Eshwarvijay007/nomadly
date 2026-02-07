import { extractMetadataFromContent } from './MetadataExtractor';
import { ParsedTableData } from '../types';

describe('MetadataExtractor', () => {
  it('extracts place and location from structured table headers', () => {
    const content: ParsedTableData = {
      headers: ['Place Name', 'City'],
      rows: [['Eiffel Tower', 'Paris']],
      rowCount: 1,
      columnCount: 2,
      sourceType: 'csv'
    };

    const result = extractMetadataFromContent(content);

    expect(result.placeName).toBe('Eiffel Tower');
    expect(result.location).toBe('Paris');
    expect(result.placeConfidence).toBeGreaterThan(0.8);
    expect(result.locationConfidence).toBeGreaterThan(0.8);
  });

  it('extracts metadata from OCR text with explicit prefixes', () => {
    const content: ParsedTableData = {
      headers: ['Content'],
      rows: [['Place Name: Taj Mahal'], ['Location: Agra, India']],
      rowCount: 2,
      columnCount: 1,
      sourceType: 'image-ocr',
      ocrText: 'Place Name: Taj Mahal\nLocation: Agra, India'
    };

    const result = extractMetadataFromContent(content);

    expect(result.placeName).toBe('Taj Mahal');
    expect(result.location).toBe('Agra, India');
    expect(result.placeConfidence).toBeGreaterThanOrEqual(0.9);
    expect(result.locationConfidence).toBeGreaterThanOrEqual(0.9);
  });

  it('falls back safely when metadata cannot be inferred', () => {
    const result = extractMetadataFromContent({ unknown: true });

    expect(result.placeName).toBe('');
    expect(result.location).toBe('');
    expect(result.placeConfidence).toBe(0);
    expect(result.locationConfidence).toBe(0);
  });
});
