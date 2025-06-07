import React, { useState } from 'react';
import { Output } from '../../types';
import { Download, Copy, FileText, Code, Image, Share } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toPng, toJpeg, toSvg } from 'html-to-image';

interface ExportOptionsProps {
  output: Output;
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export function ExportOptions({ output, containerRef, className = '' }: ExportOptionsProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output.content);
    setIsExportMenuOpen(false);
  };

  const downloadAsText = () => {
    const blob = new Blob([output.content], { type: 'text/plain' });
    saveAs(blob, `output-${new Date().toISOString().slice(0, 10)}.txt`);
    setIsExportMenuOpen(false);
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([output.content], { type: 'text/markdown' });
    saveAs(blob, `output-${new Date().toISOString().slice(0, 10)}.md`);
    setIsExportMenuOpen(false);
  };

  const downloadAsJSON = () => {
    const data = {
      content: output.content,
      toolResponses: output.toolResponses,
      usageStatistics: output.usageStatistics,
      metadata: output.metadata,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `output-${new Date().toISOString().slice(0, 10)}.json`);
    setIsExportMenuOpen(false);
  };

  const downloadAsImage = (format: 'png' | 'jpeg' | 'svg') => {
    if (!containerRef?.current) return;
    
    const element = containerRef.current;
    const fileName = `output-${new Date().toISOString().slice(0, 10)}.${format}`;
    
    const exportFn = format === 'png' 
      ? toPng 
      : format === 'jpeg' 
        ? toJpeg 
        : toSvg;
    
    exportFn(element, { quality: 0.95 })
      .then(dataUrl => {
        saveAs(dataUrl, fileName);
      })
      .catch(error => {
        console.error('Error exporting as image:', error);
      });
    
    setIsExportMenuOpen(false);
  };

  const shareOutput = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Model Card Output',
          text: output.content,
        });
      } catch (error) {
        console.error('Error sharing output:', error);
      }
    } else {
      copyToClipboard();
    }
    
    setIsExportMenuOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
      >
        <Download size={14} className="mr-1.5" />
        Export
      </button>
      
      {isExportMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <ul className="py-1">
            <li>
              <button
                onClick={copyToClipboard}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy size={14} className="mr-2" />
                Copy to Clipboard
              </button>
            </li>
            <li>
              <button
                onClick={downloadAsText}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileText size={14} className="mr-2" />
                Download as Text
              </button>
            </li>
            <li>
              <button
                onClick={downloadAsMarkdown}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Code size={14} className="mr-2" />
                Download as Markdown
              </button>
            </li>
            <li>
              <button
                onClick={downloadAsJSON}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Code size={14} className="mr-2" />
                Download as JSON
              </button>
            </li>
            {containerRef && (
              <>
                <li>
                  <button
                    onClick={() => downloadAsImage('png')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image size={14} className="mr-2" />
                    Download as PNG
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => downloadAsImage('jpeg')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image size={14} className="mr-2" />
                    Download as JPEG
                  </button>
                </li>
              </>
            )}
            <li>
              <button
                onClick={shareOutput}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share size={14} className="mr-2" />
                Share
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}