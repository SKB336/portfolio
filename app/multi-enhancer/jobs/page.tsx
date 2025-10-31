"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, Trash } from "lucide-react";

// Function to dynamically load the JSZip library
const loadJSZip = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof (window as any).JSZip !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load JSZip library."));
    document.head.appendChild(script);
  });
};

interface JobItem {
  id: string;
  status: string;
  time: string;
  duration?: string;
  files_count: number;
  processed_count: number;
  rejected_files: string[];
  result: string | null;
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setError(null);
    try {
      // const response = await fetch("http://192.168.18.197:10000/jobs");
      const sessionId = localStorage.getItem("sessionId");
      const response = await fetch("https://api.crackvault.work/jobs", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadUnzipped = async (jobId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.crackvault.work/results/${jobId}`);
      if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
      const blob = await response.blob();

      await loadJSZip();
      const JSZip = (window as any).JSZip;
      const zip = await JSZip.loadAsync(blob);

      const filePromises: Promise<void>[] = [];
      zip.forEach((relativePath: string, zipEntry: { name: string; dir: boolean; async: (type: 'blob') => Promise<Blob> }) => {
        if (!zipEntry.dir) {
          filePromises.push(
            zipEntry.async('blob').then(contentBlob => {
              const url = URL.createObjectURL(contentBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = zipEntry.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            })
          );
        }
      });
      await Promise.all(filePromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unzip and download images');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm(`Are you sure you want to delete job ${jobId}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.crackvault.work/delete/${jobId}`, { method: "POST" }); 
      // If you changed backend to DELETE:
      // const response = await fetch(`/delete/${jobId}`, { method: "DELETE" });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete job: ${error.detail}`);
        return;
      }

      // Optimistically update the UI
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));

    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-8">
          Job Queue
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs currently in the queue.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">Status: {job.status}</p>
                  <p className="font-sm text-gray-800">Job ID: {job.id}</p>
                  <p className="text-sm text-gray-600">
                    Processed {job.processed_count}/{job.files_count}
                  </p>
                  {job.rejected_files.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Warning: {job.rejected_files.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                {job.status === "In Progress" && (
                  <div className="flex items-center gap-2 text-red-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing</span>
                  </div>
                )}

                {job.result && (
                  <button
                    onClick={() => handleDownloadUnzipped(job.result?.split('/').pop()?.replace('.zip', '') || '')}
                    className="flex flex-shrink-0 items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
                    disabled={loading}
                  >
                    <Download className="w-5 h-5" /> Download & Unzip
                  </button>
                )}

                {/* Delete Job button */}
                {job.status !== "In Progress" && (
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="flex flex-shrink-0 items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition disabled:opacity-50"
                  disabled={loading}
                >
                  <Trash className="w-5 h-5" />
                </button>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}