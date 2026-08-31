"use client"

import { useState, ChangeEvent, useEffect } from 'react';
import { Link, Loader2, CheckCircle, XCircle, Download, Plus, X, ExternalLink } from 'lucide-react';
import { getApiUrl } from '@/config/api';

// Function to dynamically load the JSZip script
// const loadJSZip = () => {
//   return new Promise<void>((resolve, reject) => {
//     if (typeof (window as any).JSZip !== 'undefined') {
//       resolve();
//       return;
//     }
//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
//     script.onload = () => resolve();
//     script.onerror = () => reject(new Error('Failed to load JSZip library.'));
//     document.head.appendChild(script);
//   });
// };

export default function ImageCompressor() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
//   const [compressedZipBlob, setCompressedZipBlob] = useState<Blob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedMaxWidth, setSelectedMaxWidth] = useState<number>(1920);

  useEffect(() => {
      async function createSession() {
        try {
          const res = await fetch(getApiUrl("/set-session"), {
          // const res = await fetch("http://localhost:10000/set-session", {
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

  const handleUrlChange = (index: number, value: string): void => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
    setError(null);
    setSuccess(false);
    // setCompressedZipBlob(null);
    setJobId(null);
  };

  const addUrlField = (): void => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number): void => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length === 0 ? [''] : newUrls);
  };

  const getValidUrls = (): string[] => {
    return urls.filter(url => url.trim() !== '');
  };

  const handleCompress = async (): Promise<void> => {
    const validUrls = getValidUrls();

    if (validUrls.length === 0) {
      setError('Please enter at least one image URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      validUrls.forEach(url => formData.append('urls', url));
      formData.append('max_size', selectedMaxWidth.toString());

      const response = await fetch(getApiUrl('/compress-zip-url'), {
        method: 'POST',
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Compression failed. Server message: ${errorText || response.statusText}`);
      }

    //   const contentType = response.headers.get('Content-Type');
    //   if (contentType?.includes('application/zip')) {
    //     const blob = await response.blob();
    //     setCompressedZipBlob(blob);
    //     setSuccess(true);
    //   } else {
    //     const data = await response.json();
    //     setError(data.detail || 'No images were large enough to compress');
    //   }
      const data = await response.json();
      if (data.job_id) {
        setJobId(data.job_id);
        setSuccess(true);
      } else {
        throw new Error('Unexpected response format: missing job_id');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress images');
    } finally {
      setLoading(false);
    }
  };

//   const handleDownloadUnzipped = async (): Promise<void> => {
//     if (!compressedZipBlob) return;

//     setLoading(true);
//     setError(null);

//     try {
//       await loadJSZip();
//       const JSZip = (window as any).JSZip;
//       const zip = await JSZip.loadAsync(compressedZipBlob);

//       const filePromises: Promise<void>[] = [];
      
//       zip.forEach((relativePath: string, zipEntry: { name: string, dir: boolean, async: (type: 'blob') => Promise<Blob> }) => {
//         if (!zipEntry.dir) {
//           filePromises.push(
//             zipEntry.async('blob').then(contentBlob => {
//               const url = URL.createObjectURL(contentBlob);
//               const a = document.createElement('a');
//               a.href = url;
//               a.download = zipEntry.name;
//               document.body.appendChild(a);
//               a.click();
//               document.body.removeChild(a);
//               URL.revokeObjectURL(url);
//             })
//           );
//         }
//       });

//       await Promise.all(filePromises);
//     } catch (err) {
//       setError(err instanceof Error ? `Download/Unzip failed: ${err.message}` : 'Failed to unzip and download images');
//     } finally {
//       setLoading(false);
//     }
//   };

  const handleReset = (): void => {
    setUrls(['']);
    setError(null);
    setSuccess(false);
    // setCompressedZipBlob(null);
    setJobId(null);
  };

  const validUrlCount = getValidUrls().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 text-center">
            Batch Image Compressor
          </h1>
          <p className="text-gray-500 text-center mb-10 text-lg">
            Enter image URLs, receive a compressed ZIP, and download all compressed images individually.
          </p>

          <div className="space-y-8">
            <div className="border-4 border-dashed border-purple-200 bg-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Link className="w-6 h-6 text-purple-600" />
                <span className="text-lg text-purple-700 font-semibold">
                  Image URLs ({validUrlCount})
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto p-1">
                {urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleUrlChange(index, e.target.value)}
                      placeholder={`Image URL ${index + 1}`}
                      className="flex-1 min-w-0 px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700"
                    />
                    {urls.length > 1 && (
                      <button
                        onClick={() => removeUrlField(index)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                        aria-label="Remove URL"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addUrlField}
                className="mt-4 w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Add Another URL
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Compression size</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[3840, 2560, 1920, 1280, 720, 480].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedMaxWidth(size)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition text-center ${
                      selectedMaxWidth === size
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                    aria-pressed={selectedMaxWidth === size}
                  >
                    {size}px
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

            {/* {success && (
              <div className="bg-green-100 border border-green-400 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium text-center sm:text-left">
                  Compression successful! Ready to download {validUrlCount} compressed files.
                </p>
              </div>
            )} */}

            {success && jobId && (
              <div className="bg-green-100 border border-green-400 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-md">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="text-green-800 font-medium text-center sm:text-left">
                  Compression started successfully! Job ID:
                  <span className="break-all sm:break-normal text-green-600 sm:text-green-800 font-mono sm:bg-white sm:px-2 py-1 sm:rounded sm:border sm:border-green-300 ml-2">{jobId}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCompress}
                disabled={validUrlCount === 0 || loading || success}
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

              {/* {success && (
                <button
                  onClick={handleDownloadUnzipped}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Download {validUrlCount} Files
                    </>
                  )}
                </button>
              )} */}

              {success && jobId && (
                <a
                  href="/url-compressor/jobs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition duration-300"
                >
                  <ExternalLink className="w-6 h-6" />
                  Go to Queue
                </a>
              )}
            </div>

            {(validUrlCount > 0 || error || success) && (
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