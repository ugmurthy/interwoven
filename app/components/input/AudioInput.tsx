import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Upload, X } from 'lucide-react';

interface AudioInputProps {
  onAudioCaptured: (audioBlob: Blob, audioUrl: string) => void;
  onAudioFileSelected?: (file: File) => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  className?: string;
}

export function AudioInput({
  onAudioCaptured,
  onAudioFileSelected,
  maxDuration = 60, // 1 minute default
  disabled = false,
  className = '',
}: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Reset any existing recording
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioCaptured(audioBlob, url);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= maxDuration) {
            stopRecording();
            return prevTime;
          }
          return prevTime + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        // Resume timer
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prevTime) => {
            if (prevTime >= maxDuration) {
              stopRecording();
              return prevTime;
            }
            return prevTime + 1;
          });
        }, 1000);
      } else {
        // Pause recording
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        // Pause timer
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file.');
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Audio file size must be less than 10MB.');
        return;
      }
      
      setAudioFile(file);
      
      // Create URL for playback
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      if (onAudioFileSelected) {
        onAudioFileSelected(file);
      }
    }
  };

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioFile(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="border rounded-md p-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={disabled}
              className={`p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Start recording"
            >
              <Mic size={24} />
            </button>
          ) : (
            <>
              <button
                onClick={pauseRecording}
                disabled={disabled}
                className={`p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
              </button>
              <button
                onClick={stopRecording}
                disabled={disabled}
                className={`p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Stop recording"
              >
                <Square size={24} />
              </button>
            </>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="text-center mb-4">
            <div className="flex items-center justify-center">
              <div className={`h-3 w-3 rounded-full bg-red-600 mr-2 ${isPaused ? '' : 'animate-pulse'}`}></div>
              <span className="text-gray-700 dark:text-gray-300">
                {isPaused ? 'Recording paused' : 'Recording'} - {formatTime(recordingTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
              <div
                className="bg-red-600 h-2.5 rounded-full"
                style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* File Upload */}
        {onAudioFileSelected && !isRecording && (
          <div className="mt-4">
            <div className="flex items-center justify-center">
              <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Audio
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={disabled}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {audioUrl && (
          <div className="mt-4">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-md p-3">
              <div className="flex-1">
                <audio controls src={audioUrl} className="w-full" />
              </div>
              <button
                onClick={removeAudio}
                className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                title="Remove audio"
              >
                <X size={16} />
              </button>
            </div>
            {audioFile && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {audioFile.name} - {(audioFile.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}