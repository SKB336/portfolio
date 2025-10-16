"use client"

import { useState, ChangeEvent } from 'react';
import { Upload, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setSuccess(false);
      setCompressedUrl(null);
    }
  };

  const handleCompress = async (): Promise<void> => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://157.173.101.184:8443/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Compression failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (): void => {
    if (compressedUrl && file) {
      const a = document.createElement('a');
      a.href = compressedUrl;
      a.download = `compressed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = (): void => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
    setCompressedUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Image Compressor
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Compress your images quickly and easily
          </p>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-gray-600 font-medium">
                  {file ? file.name : 'Click to select an image'}
                </span>
                <span className="text-sm text-gray-400 mt-2">
                  PNG, JPG, GIF up to 10MB
                </span>
              </label>
            </div>

            {preview && (
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700">Image compressed successfully!</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCompress}
                disabled={!file || loading}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  'Compress Image'
                )}
              </button>

              {success && (
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              )}
            </div>

            {(file || error || success) && (
              <button
                onClick={handleReset}
                className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium"
              >
                Start Over
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Your images are processed securely and not stored on our servers
        </p>
      </div>
    </div>
  );

}