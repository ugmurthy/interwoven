import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { File, Upload, X } from 'lucide-react';

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

export function FileInput({
  onFilesSelected,
  acceptedFileTypes = ['image/*', 'application/pdf', '.txt', '.md', '.json'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = '',
}: FileInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
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

      // Add new files
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
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
                Accepted file types: {acceptedFileTypes.join(', ')}
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
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-md p-2"
              >
                <div className="flex items-center">
                  <File size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
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