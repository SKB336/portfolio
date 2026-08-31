"use client";
import { useEffect, useState } from "react";
import { Loader2, Download, Trash } from "lucide-react";
import { getApiUrl } from "@/config/api";

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
  time: number;
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
      const response = await fetch(getApiUrl("/get-all-jobs"), {
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
      const response = await fetch(getApiUrl(`/results/${jobId}`));
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
      const response = await fetch(getApiUrl(`/delete/${jobId}`), { method: "POST" });
      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete job: ${error.detail}`);
        return;
      }
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 p-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-4 border-transparent bg-clip-padding"
           style={{ backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #ff0000, #ff9900, #ff00ff, #00ffff, #00ff00, #0000ff, #ff0000)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
          ✨ Job Queue ✨
        </h1>

        {error && (
          <div className="bg-red-600/90 text-white p-4 rounded-lg mb-6 shadow-lg border-2 border-red-300">
            {error}
          </div>
        )}

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            No jobs currently in the queue.
          </p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl p-6 shadow-xl transition-all hover:scale-[1.02] duration-300"
                style={{
                  background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                  border: "4px solid transparent",
                  backgroundClip: "padding-box, border-box",
                  backgroundOrigin: "padding-box, border-box",
                  backgroundImage: `linear-gradient(white, white), linear-gradient(90deg, 
                    #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0066ff, #ff00ff, #ff0000)`,
                }}
              >
                {/* Rainbow stripe on top */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="">
                    <p className="font-bold text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Status: {job.status}
                    </p>
                    <p className="text-sm font-medium text-gray-700 break-words">
                      Job ID:{" "}
                      <span className="font-mono text-indigo-600 break-all">
                        {job.id}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {new Date(job.time * 1000).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Processed {job.processed_count}/{job.files_count}
                    </p>
                    {job.rejected_files.length > 0 && (
                      <p className="text-xs font-semibold text-red-600 bg-yellow-200 px-2 py-1 rounded mt-2 inline-block">
                        ⚠️ Rejected: {job.rejected_files.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap w-full sm:w-auto">
                    {job.status === "In Progress" && (
                      <div className="flex items-center gap-2 text-purple-600 font-bold animate-pulse">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Processing…</span>
                      </div>
                    )}

                    {job.result && (
                      <button
                        onClick={() => handleDownloadUnzipped(job.result?.split('/').pop()?.replace('.zip', '') || '')}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-cyan-500 hover:from-green-500 hover:to-cyan-600 text-white font-bold py-3 px-3 md:px-6 rounded-xl shadow-lg transform hover:scale-105 transition disabled:opacity-60"
                        disabled={loading}
                      >
                        <Download className="w-5 h-5" />
                        <span>
                          <span className="hidden md:inline">Download &amp; Unzip</span>
                          <span className="inline md:hidden">Download</span>
                        </span>
                      </button>
                    )}

                    {job.status !== "In Progress" && (
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="flex flex-grow items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-3 md:px-6 rounded-xl shadow-lg transform hover:scale-105 transition disabled:opacity-60"
                        disabled={loading}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}