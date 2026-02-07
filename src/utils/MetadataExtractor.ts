import { ParsedTableData } from '../types';
import { FieldMatcher, normalizeFieldName } from './FieldMatcher';

export interface MetadataExtractionResult {
  placeName: string;
  location: string;
  placeConfidence: number;
  locationConfidence: number;
}

const PLACE_ALIASES = [
  'place',
  'place_name',
  'name',
  'landmark',
  'monument',
  'attraction',
  'site',
  'title'
];

const LOCATION_ALIASES = [
  'location',
  'city',
  'state',
  'country',
  'region',
  'address',
  'loc',
  'area'
];

const LINE_PREFIX_PATTERNS = {
  place: /^(?:place\s*name|place|landmark|monument|site|name)\s*[:\-]\s*(.+)$/i,
  location: /^(?:location|city|state|country|region|address)\s*[:\-]\s*(.+)$/i
};

const PLACE_LOCATION_INLINE_PATTERN = /^(?:\d+\.\s*)?(.+?)\s*(?:->|→)\s*(.+)$/i;
const PLACE_PRIORITY = ['place_name', 'place', 'landmark', 'monument', 'site', 'name', 'title', 'attraction'];
const LOCATION_PRIORITY = ['city', 'location', 'loc', 'region', 'state', 'address', 'country', 'area'];

export function extractMetadataFromContent(content: unknown): MetadataExtractionResult {
  if (isParsedTableData(content)) {
    const tableResult = extractFromTableData(content);
    if (tableResult.placeName || tableResult.location) {
      return tableResult;
    }

    if (content.ocrText) {
      return extractFromText(content.ocrText);
    }

    const flattenedText = content.rows
      .flat()
      .map(value => String(value ?? '').trim())
      .filter(Boolean)
      .join('\n');

    return extractFromText(flattenedText);
  }

  if (typeof content === 'string') {
    return extractFromText(content);
  }

  if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object') {
    return extractFromObject(content[0] as Record<string, unknown>);
  }

  if (content && typeof content === 'object') {
    return extractFromObject(content as Record<string, unknown>);
  }

  return emptyResult();
}

function extractFromTableData(data: ParsedTableData): MetadataExtractionResult {
  if (data.headers.length === 0 || data.rows.length === 0) {
    return emptyResult();
  }

  const row = getBestDataRow(data.rows);
  const headers = data.headers.map(header => String(header));

  const placeMatch = findHeaderMatch(headers, PLACE_ALIASES, 'placeName');
  const locationMatch = findHeaderMatch(headers, LOCATION_ALIASES, 'location');

  const placeName = readValueFromRow(row, placeMatch.index);
  const location = readValueFromRow(row, locationMatch.index);

  return {
    placeName,
    location,
    placeConfidence: placeName ? placeMatch.confidence : 0,
    locationConfidence: location ? locationMatch.confidence : 0
  };
}

function findHeaderMatch(
  headers: string[],
  aliases: string[],
  targetField: 'placeName' | 'location'
): { index: number; confidence: number } {
  const normalizedHeaders = headers.map(header => normalizeFieldName(header));
  const priorityPatterns = targetField === 'location' ? LOCATION_PRIORITY : PLACE_PRIORITY;
  const preferredMatch = findPriorityMatch(normalizedHeaders, priorityPatterns);

  if (preferredMatch.index !== -1) {
    return preferredMatch;
  }

  for (let index = 0; index < normalizedHeaders.length; index += 1) {
    const normalizedHeader = normalizedHeaders[index];
    if (aliases.some(alias => normalizedHeader === alias)) {
      return { index, confidence: 0.95 };
    }
  }

  for (let index = 0; index < normalizedHeaders.length; index += 1) {
    const normalizedHeader = normalizedHeaders[index];
    if (aliases.some(alias => normalizedHeader.includes(alias))) {
      return { index, confidence: 0.82 };
    }
  }

  const matcher = new FieldMatcher([
    { name: 'placeName', label: 'Place Name' },
    { name: 'location', label: 'Location' }
  ]);
  const matches = matcher.matchFields(headers);
  const bestTargetMatch = matches.find(match => match.targetField === targetField);

  if (!bestTargetMatch || bestTargetMatch.confidence < 0.55) {
    return { index: -1, confidence: 0 };
  }

  const index = headers.findIndex(header => header === bestTargetMatch.sourceField);
  return { index, confidence: bestTargetMatch.confidence };
}

function findPriorityMatch(
  normalizedHeaders: string[],
  priorities: string[]
): { index: number; confidence: number } {
  for (let priorityIndex = 0; priorityIndex < priorities.length; priorityIndex += 1) {
    const priority = priorities[priorityIndex];

    for (let headerIndex = 0; headerIndex < normalizedHeaders.length; headerIndex += 1) {
      if (normalizedHeaders[headerIndex] === priority) {
        return { index: headerIndex, confidence: 0.96 - Math.min(priorityIndex * 0.01, 0.1) };
      }
    }

    for (let headerIndex = 0; headerIndex < normalizedHeaders.length; headerIndex += 1) {
      if (normalizedHeaders[headerIndex].includes(priority)) {
        return { index: headerIndex, confidence: 0.88 - Math.min(priorityIndex * 0.01, 0.1) };
      }
    }
  }

  return { index: -1, confidence: 0 };
}

function extractFromText(text: string): MetadataExtractionResult {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  let placeName = '';
  let location = '';
  let placeConfidence = 0;
  let locationConfidence = 0;

  for (const line of lines) {
    const inlineMatch = line.match(PLACE_LOCATION_INLINE_PATTERN);
    if (inlineMatch?.[1] && inlineMatch?.[2]) {
      const inlinePlace = cleanValue(inlineMatch[1]);
      const inlineLocation = cleanValue(inlineMatch[2]).replace(/\s*[^\w\s,./()'-]+$/g, '').trim();
      if (inlinePlace && inlineLocation) {
        return {
          placeName: inlinePlace,
          location: inlineLocation,
          placeConfidence: 0.88,
          locationConfidence: 0.88
        };
      }
    }

    if (!placeName) {
      const placeMatch = line.match(LINE_PREFIX_PATTERNS.place);
      if (placeMatch?.[1]) {
        placeName = cleanValue(placeMatch[1]);
        placeConfidence = placeName ? 0.9 : 0;
      }
    }

    if (!location) {
      const locationMatch = line.match(LINE_PREFIX_PATTERNS.location);
      if (locationMatch?.[1]) {
        location = cleanValue(locationMatch[1]);
        locationConfidence = location ? 0.9 : 0;
      }
    }

    if (placeName && location) {
      break;
    }
  }

  if (!placeName) {
    const likelyPlace = lines.find(line => isLikelyPlaceName(line));
    if (likelyPlace) {
      placeName = cleanValue(likelyPlace);
      placeConfidence = 0.55;
    }
  }

  if (!location) {
    const likelyLocation = lines.find(line => isLikelyLocation(line));
    if (likelyLocation) {
      location = cleanValue(likelyLocation);
      locationConfidence = 0.55;
    }
  }

  return {
    placeName,
    location,
    placeConfidence,
    locationConfidence
  };
}

function extractFromObject(record: Record<string, unknown>): MetadataExtractionResult {
  const headers = Object.keys(record);
  const row = headers.map(key => record[key] as string | number | boolean | null);
  const tableData: ParsedTableData = {
    headers,
    rows: [row],
    rowCount: 1,
    columnCount: headers.length,
    sourceType: 'json'
  };

  return extractFromTableData(tableData);
}

function getBestDataRow(rows: Array<Array<string | number | boolean | null>>): Array<string | number | boolean | null> {
  if (rows.length === 1) {
    return rows[0];
  }

  return [...rows]
    .sort((left, right) => nonEmptyValueCount(right) - nonEmptyValueCount(left))[0];
}

function nonEmptyValueCount(row: Array<string | number | boolean | null>): number {
  return row.filter(value => String(value ?? '').trim() !== '').length;
}

function readValueFromRow(
  row: Array<string | number | boolean | null>,
  index: number
): string {
  if (index < 0 || index >= row.length) {
    return '';
  }

  return cleanValue(String(row[index] ?? ''));
}

function cleanValue(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();
}

function isLikelyPlaceName(line: string): boolean {
  if (!line || line.length < 3 || line.length > 120) {
    return false;
  }

  const lower = line.toLowerCase();
  if (lower.includes('location') || lower.includes('address') || lower.includes('city')) {
    return false;
  }

  const digitRatio = (line.match(/\d/g) || []).length / line.length;
  return digitRatio < 0.2;
}

function isLikelyLocation(line: string): boolean {
  const lower = line.toLowerCase();
  return lower.includes(',') ||
    lower.includes('city') ||
    lower.includes('state') ||
    lower.includes('country') ||
    lower.includes('region') ||
    /\b[a-z]{2}\b/i.test(line);
}

function isParsedTableData(content: unknown): content is ParsedTableData {
  if (!content || typeof content !== 'object') {
    return false;
  }

  const candidate = content as ParsedTableData;
  return Array.isArray(candidate.headers) && Array.isArray(candidate.rows);
}

function emptyResult(): MetadataExtractionResult {
  return {
    placeName: '',
    location: '',
    placeConfidence: 0,
    locationConfidence: 0
  };
}
