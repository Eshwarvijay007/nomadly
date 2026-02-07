import React, { useState } from 'react';
import { TableUploadComponent } from '../components/FileUpload/TableUploadComponent';
import { MetadataForm } from '../components/MetadataForm/MetadataForm';
import { EnhancedFileParser, EnhancedFileParserConfig } from '../parser/EnhancedFileParser';
import { UploadError, FileFormat, FormData, ValidationError, ParsedTableData } from '../types';
import { extractMetadataFromContent } from '../utils/MetadataExtractor';
import './App.css';

const acceptedFormats = ['.txt', '.csv', '.xlsx', '.xls', '.json', '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif'];

const hasExtension = (file: File, extensions: string[]): boolean => {
  const fileName = file.name.toLowerCase();
  return extensions.some(extension => fileName.endsWith(extension));
};

const supportedFormats: FileFormat[] = [
  { extension: 'txt', mimeType: 'text/plain', validator: (file: File) => hasExtension(file, ['.txt']) },
  { extension: 'csv', mimeType: 'text/csv', validator: (file: File) => hasExtension(file, ['.csv']) },
  { extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', validator: (file: File) => hasExtension(file, ['.xlsx']) },
  { extension: 'xls', mimeType: 'application/vnd.ms-excel', validator: (file: File) => hasExtension(file, ['.xls']) },
  { extension: 'json', mimeType: 'application/json', validator: (file: File) => hasExtension(file, ['.json']) },
  { extension: 'pdf', mimeType: 'application/pdf', validator: (file: File) => hasExtension(file, ['.pdf']) },
  { extension: 'png', mimeType: 'image/png', validator: (file: File) => hasExtension(file, ['.png']) },
  { extension: 'jpg', mimeType: 'image/jpeg', validator: (file: File) => hasExtension(file, ['.jpg', '.jpeg']) },
  { extension: 'jpeg', mimeType: 'image/jpeg', validator: (file: File) => hasExtension(file, ['.jpeg', '.jpg']) },
  { extension: 'webp', mimeType: 'image/webp', validator: (file: File) => hasExtension(file, ['.webp']) },
  { extension: 'gif', mimeType: 'image/gif', validator: (file: File) => hasExtension(file, ['.gif']) }
];

const parserConfig: EnhancedFileParserConfig = {
  supportedFormats,
  maxFileSize: 10 * 1024 * 1024
};

const parser = new EnhancedFileParser(parserConfig);

export const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTableData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [initialMetadata, setInitialMetadata] = useState<{ placeName: string; location: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setParsedData(null);
    setParseError(null);
    setInitialMetadata(null);
    setIsSubmitted(false);
    setIsParsing(true);

    try {
      const result = await parser.parse(file);
      if (!result.success || !result.content) {
        setParseError(result.error?.message || 'Unable to parse file');
        return;
      }

      const data = result.content.raw as ParsedTableData;
      const metadata = extractMetadataFromContent(data);
      setParsedData(data);
      setInitialMetadata({
        placeName: metadata.placeName,
        location: metadata.location
      });
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Unknown parse error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUploadError = (error: UploadError) => {
    setParseError(error.message);
    setIsSubmitted(false);
  };

  const handleMetadataSubmit = async (metadata: FormData) => {
    if (!selectedFile || !parsedData) {
      return;
    }

    console.log('Metadata submission payload:', {
      file: selectedFile.name,
      metadata,
      rowCount: parsedData.rowCount,
      columnCount: parsedData.columnCount
    });
    setIsSubmitted(true);
  };

  const handleValidationError = (errors: ValidationError[]) => {
    console.log('Metadata validation errors:', errors);
  };

  return (
    <div className="app">
      <main className="app-main">
        <h1 className="app-title">Upload File</h1>

        <div className="upload-section">
          <TableUploadComponent
            acceptedFormats={acceptedFormats}
            maxFileSize={10 * 1024 * 1024}
            onFileSelected={handleFileSelected}
            onError={handleUploadError}
          />
        </div>

        {isParsing && <p className="status-message">Parsing file and extracting metadata...</p>}
        {parseError && <p className="error-message">{parseError}</p>}

        {initialMetadata && (
          <div className="form-section">
            <MetadataForm
              disabled={false}
              onSubmit={handleMetadataSubmit}
              onValidationError={handleValidationError}
              initialValues={initialMetadata}
            />
          </div>
        )}

        {isSubmitted && <p className="success-message">Metadata submitted successfully.</p>}
      </main>
    </div>
  );
};
