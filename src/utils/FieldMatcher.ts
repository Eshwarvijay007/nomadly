/**
 * Field Matcher using Fuse.js
 * 
 * Provides fuzzy matching to automatically suggest which file columns
 * match which application fields.
 * 
 * Example: "Phone_Number" matches "Telephone" with 85% confidence
 */

import Fuse from 'fuse.js';

export interface FieldMatch {
  sourceField: string;
  targetField: string;
  confidence: number; // 0-1 (1 = perfect match)
  score: number; // Lower is better (Fuse.js score)
}

export interface TargetField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}

export class FieldMatcher {
  private fuse: Fuse<TargetField>;
  private targetFields: TargetField[];

  constructor(targetFields: TargetField[]) {
    this.targetFields = targetFields;
    
    // Configure Fuse.js for fuzzy matching
    this.fuse = new Fuse(targetFields, {
      keys: ['name', 'label'],
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: false
    });
  }

  /**
   * Find best matches for source fields
   * Returns suggested mappings sorted by confidence
   */
  matchFields(sourceFields: string[]): FieldMatch[] {
    const matches: FieldMatch[] = [];

    for (const sourceField of sourceFields) {
      const results = this.fuse.search(sourceField);
      
      if (results.length > 0) {
        const bestMatch = results[0];
        const confidence = 1 - (bestMatch.score || 0); // Convert score to confidence
        
        matches.push({
          sourceField,
          targetField: bestMatch.item.name,
          confidence,
          score: bestMatch.score || 0
        });
      }
    }

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find single best match for a source field
   */
  findBestMatch(sourceField: string): FieldMatch | null {
    const results = this.fuse.search(sourceField);
    
    if (results.length === 0) {
      return null;
    }

    const bestMatch = results[0];
    const confidence = 1 - (bestMatch.score || 0);

    return {
      sourceField,
      targetField: bestMatch.item.name,
      confidence,
      score: bestMatch.score || 0
    };
  }

  /**
   * Get all possible matches for a source field
   * Returns top N matches
   */
  findAllMatches(sourceField: string, limit: number = 5): FieldMatch[] {
    const results = this.fuse.search(sourceField).slice(0, limit);
    
    return results.map(result => ({
      sourceField,
      targetField: result.item.name,
      confidence: 1 - (result.score || 0),
      score: result.score || 0
    }));
  }

  /**
   * Auto-map all source fields to target fields
   * Only includes matches above confidence threshold
   */
  autoMap(sourceFields: string[], minConfidence: number = 0.6): Map<string, string> {
    const mapping = new Map<string, string>();
    const matches = this.matchFields(sourceFields);

    for (const match of matches) {
      if (match.confidence >= minConfidence) {
        mapping.set(match.sourceField, match.targetField);
      }
    }

    return mapping;
  }

  /**
   * Validate a manual mapping
   * Returns confidence score for the mapping
   */
  validateMapping(sourceField: string, targetField: string): number {
    const match = this.findBestMatch(sourceField);
    
    if (!match) {
      return 0;
    }

    return match.targetField === targetField ? match.confidence : 0;
  }

  /**
   * Get unmapped source fields
   */
  getUnmappedFields(sourceFields: string[], mapping: Map<string, string>): string[] {
    return sourceFields.filter(field => !mapping.has(field));
  }

  /**
   * Get target fields that haven't been mapped to
   */
  getUnusedTargetFields(mapping: Map<string, string>): TargetField[] {
    const usedTargets = new Set(mapping.values());
    return this.targetFields.filter(field => !usedTargets.has(field.name));
  }
}

/**
 * Common field name variations for better matching
 */
export const COMMON_FIELD_ALIASES: Record<string, string[]> = {
  email: ['email', 'e-mail', 'email_address', 'mail', 'contact_email'],
  phone: ['phone', 'telephone', 'phone_number', 'tel', 'mobile', 'cell'],
  name: ['name', 'full_name', 'fullname', 'customer_name', 'user_name'],
  firstName: ['first_name', 'firstname', 'fname', 'given_name'],
  lastName: ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
  address: ['address', 'street', 'street_address', 'location'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'zipcode', 'postal_code', 'postcode'],
  country: ['country', 'nation'],
  company: ['company', 'organization', 'org', 'business'],
  date: ['date', 'created_at', 'timestamp', 'created_date'],
};

/**
 * Normalize field name for better matching
 */
export function normalizeFieldName(fieldName: string): string {
  return fieldName
    .toLowerCase()
    .replace(/[_\s-]+/g, '_') // Normalize separators
    .replace(/[^a-z0-9_]/g, '') // Remove special chars
    .trim();
}
