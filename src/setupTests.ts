// Jest setup file for React Testing Library
import '@testing-library/jest-dom';

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock FileReader for file upload tests
// In test environment, we'll directly access the content passed to File constructor
(globalThis as any).FileReader = class FileReader {
  result: string | ArrayBuffer | null = null;
  error: Error | null = null;
  readyState: number = 0;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  private _blob: Blob | null = null;

  readAsText(blob: Blob): void {
    this._blob = blob;
    this.readyState = 1; // LOADING
    
    // Use setTimeout to make it async
    setTimeout(async () => {
      this.readyState = 2; // DONE
      
      const contentFromBlob = typeof (blob as any).text === 'function'
        ? await (blob as any).text()
        : undefined;
      const contentFromMap = (globalThis as any).__fileContents?.get(blob);
      this.result = contentFromBlob ?? contentFromMap ?? '';
      
      if (this.onload) {
        const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
        this.onload(event);
      }
      if (this.onloadend) {
        const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
        this.onloadend(event);
      }
    }, 0);
  }

  readAsDataURL(blob: Blob): void {
    this._blob = blob;
    this.readyState = 1; // LOADING
    
    setTimeout(async () => {
      this.readyState = 2; // DONE
      
      const contentFromBlob = typeof (blob as any).text === 'function'
        ? await (blob as any).text()
        : undefined;
      const contentFromMap = (globalThis as any).__fileContents?.get(blob);
      const content = contentFromBlob ?? contentFromMap ?? '';
      const base64 = btoa(content);
      this.result = `data:${blob.type || 'text/plain'};base64,${base64}`;
      
      if (this.onload) {
        const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
        this.onload(event);
      }
      if (this.onloadend) {
        const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
        this.onloadend(event);
      }
    }, 0);
  }

  readAsArrayBuffer(blob: Blob): void {
    this._blob = blob;
    this.readyState = 1; // LOADING
    
    setTimeout(async () => {
      this.readyState = 2; // DONE
      
      if (typeof (blob as any).arrayBuffer === 'function') {
        this.result = await (blob as any).arrayBuffer();
      } else {
        const content = (globalThis as any).__fileContents?.get(blob) || '';
        const encoder = new TextEncoder();
        this.result = encoder.encode(content).buffer as ArrayBuffer;
      }
      
      if (this.onload) {
        const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
        this.onload(event);
      }
      if (this.onloadend) {
        const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
        this.onloadend(event);
      }
    }, 0);
  }

  abort(): void {
    this.readyState = 2;
    if (this.onabort) {
      const event = { target: this, currentTarget: this } as unknown as ProgressEvent<FileReader>;
      this.onabort(event);
    }
  }

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }

  EMPTY = 0;
  LOADING = 1;
  DONE = 2;
} as any;

// Store file contents in a WeakMap for testing
(globalThis as any).__fileContents = new WeakMap();

// Override File constructor to store content
const OriginalFile = (globalThis as any).File;
(globalThis as any).File = class File extends OriginalFile {
  constructor(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) {
    super(fileBits, fileName, options);
    
    // Store the content for later retrieval by FileReader
    let content = '';
    for (const bit of fileBits) {
      if (typeof bit === 'string') {
        content += bit;
      } else if (bit instanceof ArrayBuffer) {
        content += new TextDecoder().decode(bit);
      } else if (bit instanceof Uint8Array) {
        content += new TextDecoder().decode(bit);
      } else if (bit instanceof Blob) {
        // For nested blobs, we'd need to handle recursively
        // For now, just skip
      }
    }
    
    (globalThis as any).__fileContents.set(this, content);
  }
};
