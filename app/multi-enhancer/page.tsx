"use client"

import { useState, ChangeEvent, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface ImageFile extends globalThis.File {
  preview: string;
}

export default function ImageEnhancer() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedMaxWidth, setSelectedMaxWidth] = useState<number>(2);

  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch("https://api.crackvault.work/set-session", {
          method: "POST",
          credentials: "include", // This sends & receives cookies
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Session created:", data.session_id);
        }
      } catch (err) {
        console.error("Session failed:", err);
      }
    }

    createSession();
  }, []); // ← Empty array = run only once

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      files.forEach(file => URL.revokeObjectURL(file.preview));

      const newFiles: ImageFile[] = [];
      let hasError = false;

      for (const selectedFile of Array.from(selectedFiles)) {
        if (!selectedFile.type.startsWith('image/')) {
          setError(`File "${selectedFile.name}" is not a valid image file.`);
          hasError = true;
          break;
        }
        const fileWithPreview = Object.assign(selectedFile, {
          preview: URL.createObjectURL(selectedFile),
        });
        newFiles.push(fileWithPreview);
      }

      if (hasError) {
        setFiles([]);
        return;
      }

      setFiles(newFiles);
      setError(null);
      setSuccess(false);
      setJobId(null);
    }
  };

  const handleEnhance = async (): Promise<void> => {
    if (files.length === 0) {
      setError('Please select one or more images first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('model_type', String(selectedMaxWidth));

    try {
      const response = await fetch('https://api.crackvault.work/enhance-zip-async', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Enhancement failed. Server message: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (data.job_id) {
        setJobId(data.job_id);
        setSuccess(true);
      } else {
        throw new Error('Unexpected response format: missing job_id');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance images');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setError(null);
    setSuccess(false);
    setJobId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2 text-center">
            AI Image Enhancer
          </h1>
          <p className="text-gray-500 text-center mb-10 text-lg">
            Upload images and get a job ID to track enhancement progress.
          </p>

          <div className="space-y-8">
            <div className="border-4 border-dashed border-red-200 bg-red-50 rounded-xl p-10 text-center transition duration-200 hover:border-red-400">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-16 h-16 text-red-400 mb-4" />
                <span className="text-lg text-red-700 font-semibold">
                  {files.length > 0 ? `${files.length} image(s) selected` : 'Click or Drag Images Here'}
                </span>
                <span className="text-sm text-gray-400 mt-2">
                  PNG, JPG, GIF | Upload to enhance
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-4 shadow-inner bg-gray-50">
                <p className="text-base font-bold text-gray-700 mb-3">Selected Images ({files.length}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-start max-h-64 overflow-y-auto p-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex flex-col items-center w-full bg-white p-2 rounded-lg shadow-md">
                      <img
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md border-2 border-indigo-100"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=File'; }}
                      />
                      <p className="text-xs truncate w-full text-center mt-2 font-medium text-gray-600" title={file.name}>
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Enhancement size</span>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {[2, 4].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedMaxWidth(size)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition text-center ${
                      selectedMaxWidth === size
                        ? 'bg-red-700 text-white border-red-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                    aria-pressed={selectedMaxWidth === size}
                  >
                    {size}x
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 rounded-xl p-4 flex items-center gap-3 shadow-md">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {success && jobId && (
              <div className="bg-green-100 border border-green-400 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="text-green-800 font-medium text-center sm:text-left">
                  Enhancement started successfully! Job ID:
                  <span className="break-all sm:break-normal text-green-600 sm:text-green-800 font-mono sm:bg-white sm:px-2 py-1 sm:rounded sm:border sm:border-green-300 ml-2">{jobId}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleEnhance}
                disabled={files.length === 0 || loading || success}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition duration-300"
              >
                {loading && !success ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upscale Images'
                )}
              </button>

              {success && jobId && (
                <a
                  href="/multi-enhancer/jobs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition duration-300"
                >
                  <ExternalLink className="w-6 h-6" />
                  Go to Queue
                </a>
              )}
            </div>

            {(files.length > 0 || error || success) && (
              <button
                onClick={handleReset}
                className="w-full text-gray-500 hover:text-indigo-600 py-2 px-4 rounded-lg font-medium transition duration-200"
              >
                Clear All and Start Over
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Your images are processed securely. Job tracking happens via job ID.
        </p>
      </div>
    </div>
  );
}