import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';

interface TextInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(({
  initialValue = '',
  placeholder = 'Enter text here...',
  onChange,
  onSubmit,
  disabled = false,
  rows = 4,
  className = '',
}, ref) => {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Forward the ref to the textarea element
  useImperativeHandle(ref, () => textareaRef.current!);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-y"
      />
      {onSubmit && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => onSubmit(value)}
            disabled={disabled || !value.trim()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
              (disabled || !value.trim()) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
TextInput.displayName = 'TextInput';