import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { File as FileIcon, Upload, X } from 'lucide-react';

interface FileWithContent {
  file: File;
  content?: string;
  error?: string;
}

interface FileInputProps {
  onFilesSelected: (filesWithContent: FileWithContent[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
  extractContent?: boolean; // Whether to extract content from text files
}

export function FileInput({
  onFilesSelected,
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/plain', 'text/markdown', 'application/json'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = '',
  extractContent = true, // Default to extracting content
}: FileInputProps) {
  const [files, setFiles] = useState<FileWithContent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if file is PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        return extractPdfText(file)
          .then(resolve)
          .catch(reject);
      }
      
      // Handle text files as before
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  };
  
  // Function to extract text from PDF files
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      // Import PDF.js dynamically to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - use CDN for worker to avoid build issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            resolve(e.target.result);
          } else {
            reject(new Error('Failed to read PDF as ArrayBuffer'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading PDF file'));
        reader.readAsArrayBuffer(file);
      });
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`PDF loaded: ${file.name}, pages: ${pdf.numPages}`);
      
      // Extract text from each page
      let text = '';
      const maxPages = Math.min(pdf.numPages, 50); // Limit to 50 pages for performance
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        
        text += `[Page ${i}]\n${pageText}\n\n`;
        
        // Add a note if we're limiting the pages
        if (i === maxPages && maxPages < pdf.numPages) {
          text += `[Note: Only showing ${maxPages} of ${pdf.numPages} pages due to size limitations]\n`;
        }
      }
      
      return text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`PDF extraction error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Check if file is a text-based file that we should extract content from
  const isTextFile = (file: File): boolean => {
    const textTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/pdf'  // Add PDF MIME type
    ];
    
    // Check by MIME type
    if (textTypes.includes(file.type)) {
      return true;
    }
    
    // Check by file extension (case-insensitive)
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.txt') ||
           fileName.endsWith('.md') ||
           fileName.endsWith('.json') ||
           fileName.endsWith('.pdf');  // Add PDF extension
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => {
          const error = file.errors[0];
          return `${file.file.name}: ${error.message}`;
        });
        setError(errors.join(', '));
        return;
      }

      // Clear previous errors
      setError(null);

      // Check if adding these files would exceed maxFiles
      if (files.length + acceptedFiles.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files.`);
        return;
      }

      // Process files and extract content if needed
      const filesWithContent: FileWithContent[] = await Promise.all(
        acceptedFiles.map(async (file) => {
          const fileWithContent: FileWithContent = { file };
          
          // Extract content for text files if extractContent is true
          if (extractContent && isTextFile(file)) {
            try {
              fileWithContent.content = await readFileContent(file);
            } catch (err) {
              fileWithContent.error = `Failed to read content: ${err instanceof Error ? err.message : String(err)}`;
            }
          }
          
          return fileWithContent;
        })
      );

      // Add new files
      const newFiles = [...files, ...filesWithContent];
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected, extractContent]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    setError(null);
  };

  const acceptConfig = acceptedFileTypes.reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {} as Record<string, string[]>);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig,
    maxSize,
    disabled,
    maxFiles,
  });

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-4">
          <Upload
            size={36}
            className="text-gray-400 dark:text-gray-600 mb-2"
          />
          {isDragActive ? (
            <p className="text-blue-600 dark:text-blue-400">Drop the files here...</p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Accepted file types: Images, PDFs, Text files, Markdown files, JSON files
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max size: {Math.round(maxSize / (1024 * 1024))}MB, Max files: {maxFiles}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected Files ({files.length})
          </h4>
          <ul className="space-y-2">
            {files.map((fileWithContent, index) => (
              <li
                key={`${fileWithContent.file.name}-${index}`}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-md p-2"
              >
                <div className="flex items-center">
                  <FileIcon size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                      {fileWithContent.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(fileWithContent.file.size / 1024).toFixed(1)} KB
                    </p>
                    {fileWithContent.content && (
                      <p className="text-xs text-green-500">Content extracted</p>
                    )}
                    {fileWithContent.error && (
                      <p className="text-xs text-red-500">{fileWithContent.error}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}