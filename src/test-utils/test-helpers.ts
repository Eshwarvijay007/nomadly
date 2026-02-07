/**
 * Test Helper Functions
 * 
 * Utility functions for testing React components and file operations.
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps React Testing Library's render
 * with common providers and setup
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> {
  return render(ui, { ...options });
}

/**
 * Creates a mock File object for testing
 */
export function createMockFile(
  name: string = 'test.txt',
  content: string = 'test content',
  type: string = 'text/plain'
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

/**
 * Creates a mock DragEvent for testing drag-and-drop
 */
export function createMockDragEvent(
  type: 'dragover' | 'dragleave' | 'drop',
  files: File[] = []
): DragEvent {
  const dataTransfer = {
    files: files as any,
    items: files.map(f => ({
      kind: 'file' as const,
      type: f.type,
      getAsFile: () => f
    })),
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
    type,
    bubbles: true,
    cancelable: true,
    currentTarget: null,
    target: null,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now()
  } as unknown as DragEvent;
}

/**
 * Creates a mock ChangeEvent for file input testing
 */
export function createMockChangeEvent(files: File[]): React.ChangeEvent<HTMLInputElement> {
  return {
    target: {
      files: files as any,
      value: files.length > 0 ? files[0].name : ''
    },
    currentTarget: {
      files: files as any,
      value: files.length > 0 ? files[0].name : ''
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

/**
 * Waits for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 1000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Simulates a viewport resize for responsive testing
 */
export function setViewportSize(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });
  
  window.dispatchEvent(new Event('resize'));
}

/**
 * Common viewport sizes for testing
 */
export const VIEWPORT_SIZES = {
  MOBILE_SMALL: { width: 320, height: 568 },
  MOBILE_LARGE: { width: 414, height: 896 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1024, height: 768 },
  DESKTOP_LARGE: { width: 1440, height: 900 }
};

/**
 * Checks if an element meets minimum touch target size (44x44px)
 */
export function meetsMinimumTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}

/**
 * Gets computed style value for an element
 */
export function getComputedStyleValue(
  element: HTMLElement,
  property: string
): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}
