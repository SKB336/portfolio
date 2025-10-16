"use client"

import { useState, ChangeEvent } from 'react';
import { Upload, Loader2, CheckCircle, XCircle, Download } from 'lucide-react';

// Define a type for a file with its preview URL
interface ImageFile extends globalThis.File {
  preview: string;
}

// Function to dynamically load the JSZip script
const loadJSZip = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if JSZip is already loaded (it creates a global window.JSZip object)
    if (typeof (window as any).JSZip !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load JSZip library.'));
    document.head.appendChild(script);
  });
};


export default function ImageCompressor() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  // Store the actual ZIP file blob after compression
  const [compressedZipBlob, setCompressedZipBlob] = useState<Blob | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      // Cleanup previous previews and blob
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
      setCompressedZipBlob(null);
    }
  };

  const handleCompress = async (): Promise<void> => {
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

    try {
      const response = await fetch('https://api.crackvault.work/compress-zip', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Compression failed. Server message: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/zip')) {
        const blob = await response.blob();
        setCompressedZipBlob(blob);
        setSuccess(true);
      } else {
        // Server returned JSON (no images needed compression)
        const data = await response.json();
        setError(data.detail || 'No images were large enough to compress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress images');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUnzipped = async (): Promise<void> => {
    if (!compressedZipBlob) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Load the JSZip library
      await loadJSZip();
      
      // Access the global JSZip constructor
      const JSZip = (window as any).JSZip; 

      // 2. Load the ZIP file
      const zip = await JSZip.loadAsync(compressedZipBlob);

      // 3. Iterate and download each file
      const filePromises: Promise<void>[] = [];
      
      zip.forEach((relativePath: string, zipEntry: { name: string, dir: boolean, async: (type: 'blob') => Promise<Blob> }) => {
        // Skip directories and the root folder if present
        if (!zipEntry.dir) {
          filePromises.push(
            zipEntry.async('blob').then(contentBlob => {
              // Create a temporary link for download
              const url = URL.createObjectURL(contentBlob);
              const a = document.createElement('a');
              a.href = url;
              // Use the filename from the ZIP entry
              a.download = zipEntry.name; 
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url); // Clean up the URL
            })
          );
        }
      });

      // Wait for all downloads to be initiated
      await Promise.all(filePromises);

    } catch (err) {
      setError(err instanceof Error ? `Download/Unzip failed: ${err.message}` : 'Failed to unzip and download images');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    // Revoke object URLs to free up memory
    files.forEach(file => URL.revokeObjectURL(file.preview));
    
    setFiles([]);
    setError(null);
    setSuccess(false);
    setCompressedZipBlob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 text-center">
            Batch Image Compressor
          </h1>
          <p className="text-gray-500 text-center mb-10 text-lg">
            Upload images, receive a compressed ZIP, and download all compressed images individually.
          </p>

          <div className="space-y-8">
            <div className="border-4 border-dashed border-purple-200 bg-purple-50 rounded-xl p-10 text-center transition duration-200 hover:border-purple-400">
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
                <Upload className="w-16 h-16 text-purple-400 mb-4" />
                <span className="text-lg text-purple-700 font-semibold">
                  {files.length > 0 ? `${files.length} image(s) selected` : 'Click or Drag Images Here'}
                </span>
                <span className="text-sm text-gray-400 mt-2">
                  PNG, JPG, GIF | Upload to compress
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-4 shadow-inner bg-gray-50">
                <p className="text-base font-bold text-gray-700 mb-3">Selected Images ({files.length}):</p>
                <div className="flex flex-wrap gap-4 justify-start max-h-64 overflow-y-auto p-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex flex-col items-center w-28 bg-white p-2 rounded-lg shadow-md">
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

            {error && (
              <div className="bg-red-100 border border-red-400 rounded-xl p-4 flex items-center gap-3 shadow-md">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 rounded-xl p-4 flex items-center gap-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">Compression successful! Ready to download {files.length} compressed files.</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCompress}
                disabled={files.length === 0 || loading || success}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition duration-300"
              >
                {loading && !success ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Compress and Zip Images'
                )}
              </button>

              {success && (
                <button
                  onClick={handleDownloadUnzipped}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Unzipping...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Download {files.length} Files
                    </>
                  )}
                </button>
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
          Your images are processed securely. Unzipping happens entirely in your browser.
        </p>
      </div>
    </div>
  );
}
