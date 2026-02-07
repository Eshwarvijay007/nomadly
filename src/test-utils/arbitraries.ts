/**
 * Fast-check Arbitraries for Property-Based Testing
 * 
 * Custom generators for creating test data for property-based tests.
 */

import * as fc from 'fast-check';

/**
 * Generates arbitrary File objects for testing
 */
export const arbitraryFile = (options?: {
  minSize?: number;
  maxSize?: number;
  types?: string[];
}): fc.Arbitrary<File> => {
  const minSize = options?.minSize ?? 0;
  const maxSize = options?.maxSize ?? 1024 * 1024; // 1MB default
  const types = options?.types ?? ['text/plain', 'text/csv', 'application/json'];

  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.txt`),
    size: fc.integer({ min: minSize, max: maxSize }),
    type: fc.constantFrom(...types),
    content: fc.string()
  }).map(({ name, size, type, content }) => {
    const blob = new Blob([content], { type });
    return new File([blob], name, { type });
  });
};

/**
 * Generates arbitrary valid file names
 */
export const arbitraryFileName = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => !s.includes('/') && !s.includes('\\'))
    .map(s => `${s}.txt`);
};

/**
 * Generates arbitrary file sizes
 */
export const arbitraryFileSize = (options?: {
  min?: number;
  max?: number;
}): fc.Arbitrary<number> => {
  return fc.integer({
    min: options?.min ?? 0,
    max: options?.max ?? 10 * 1024 * 1024 // 10MB default
  });
};

/**
 * Generates arbitrary MIME types
 */
export const arbitraryMimeType = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    'text/plain',
    'text/csv',
    'application/json',
    'application/pdf',
    'image/png',
    'image/jpeg'
  );
};

/**
 * Generates arbitrary form data
 */
export const arbitraryFormData = (): fc.Arbitrary<{ placeName: string; location: string }> => {
  return fc.record({
    placeName: fc.string({ minLength: 1, maxLength: 100 }),
    location: fc.string({ minLength: 1, maxLength: 100 })
  });
};

/**
 * Generates arbitrary non-empty strings (for validation testing)
 */
export const arbitraryNonEmptyString = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);
};

/**
 * Generates arbitrary empty or whitespace-only strings (for validation testing)
 */
export const arbitraryEmptyOrWhitespace = (): fc.Arbitrary<string> => {
  return fc.oneof(
    fc.constant(''),
    fc.constant(' '),
    fc.constant('  '),
    fc.constant('\t'),
    fc.constant('\n'),
    fc.constant('   \t  \n  ')
  );
};

/**
 * Generates arbitrary DragEvent objects for testing
 */
export const arbitraryDragEvent = (file?: File): fc.Arbitrary<DragEvent> => {
  const fileArb = file ? fc.constant(file) : arbitraryFile();
  
  return fileArb.map(f => {
    const dataTransfer = {
      files: [f] as any,
      items: [{
        kind: 'file' as const,
        type: f.type,
        getAsFile: () => f
      }],
      types: ['Files'],
      dropEffect: 'copy' as const,
      effectAllowed: 'all' as const,
      clearData: jest.fn(),
      getData: jest.fn(),
      setData: jest.fn(),
      setDragImage: jest.fn()
    };

    return {
      dataTransfer,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      type: 'drop',
      bubbles: true,
      cancelable: true,
      currentTarget: null,
      target: null,
      eventPhase: 0,
      isTrusted: true,
      timeStamp: Date.now()
    } as unknown as DragEvent;
  });
};

/**
 * Generates arbitrary error messages
 */
export const arbitraryErrorMessage = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    'File too large',
    'Invalid file format',
    'Network error',
    'Parse error',
    'Validation failed',
    'Upload failed'
  );
};

/**
 * Generates arbitrary error codes
 */
export const arbitraryErrorCode = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    'FILE_TOO_LARGE',
    'INVALID_FORMAT',
    'NETWORK_ERROR',
    'PARSE_ERROR',
    'VALIDATION_ERROR',
    'UPLOAD_ERROR'
  );
};
