"use client"

import React, { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { Download, Loader2, ArrowRight } from 'lucide-react';

// Configuration
const API_URL = 'https://157.173.101.184:8443/calculate';
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// Define types for the form data
interface FormData {
    ck_type?: 'E' | 'F';
    age?: string;
    size?: string;
    diameter?: string;
    show_type?: 'E' | 'F';
}

// Define the expected API response type
interface ApiResponse {
    image_base64?: string;
}

// Custom hook for managing form state and validation
const useForm = (initialState: FormData = {}) => {
    const [formData, setFormData] = useState<FormData>(initialState);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return { formData, handleChange };
};

// Main application component
const App: React.FC = () => {
    const { formData, handleChange } = useForm({});

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Exponential Backoff Retry Fetch
    const fetchWithRetry = useCallback(async (url: string, options: RequestInit): Promise<Response> => {
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            } catch (err) {
                if (i === MAX_RETRIES - 1) throw err;
                const delay = INITIAL_DELAY_MS * (2 ** i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // TypeScript needs a return, though it never reaches here
        throw new Error('Unexpected fetch error');
    }, []);

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setImageSrc(null);

        const payload = {
            ck_type: formData.ck_type || 'E',
            age: parseInt(formData.age || '0', 10),
            size: parseFloat(formData.size || '0'),
            diameter: parseFloat(formData.diameter || '0'),
            show_type: formData.show_type || 'E',
        };

        console.log(payload);

        if (isNaN(payload.age) || isNaN(payload.size) || isNaN(payload.diameter)) {
            setError("Age, Size, and Diameter must be valid numbers.");
            setIsLoading(false);
            return;
        }

        console.log(JSON.stringify(payload));
        try {
            const response = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageSrc(imageUrl);

        } catch (err: any) {
            console.error('API Call Error:', err);
            setError(`Failed to fetch image: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Download image
    const handleDownload = () => {
        if (imageSrc) {
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = `calculated_result_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const inputClasses = "text-gray-900 w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150 shadow-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Data Visualization Generator
                    </h1>
                    <p className="text-lg text-gray-500">
                        Input parameters to generate a custom PNG plot from the external API.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Form Card */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-2xl h-fit">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Input Parameters</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="ck_type" className={labelClasses}>CK Type (String)</label>
                                <select
                                    id="ck_type"
                                    name="ck_type"
                                    value={formData.ck_type}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="E">Type E</option>
                                    <option value="F">Type F</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="age" className={labelClasses}>Age (Integer)</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                    min={10}
                                    max={18}
                                    step="1"
                                />
                            </div>

                            <div>
                                <label htmlFor="size" className={labelClasses}>Size (Float)</label>
                                <input
                                    type="number"
                                    id="size"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label htmlFor="diameter" className={labelClasses}>Diameter (Float)</label>
                                <input
                                    type="number"
                                    id="diameter"
                                    name="diameter"
                                    value={formData.diameter}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label htmlFor="show_type" className={labelClasses}>Show Type (String)</label>
                                <select
                                    id="show_type"
                                    name="show_type"
                                    value={formData.show_type}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="E">Type E</option>
                                    <option value="F">Type F</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                ) : (
                                    <ArrowRight className="mr-2 h-5 w-5" />
                                )}
                                {isLoading ? 'Generating...' : 'Generate Image'}
                            </button>
                        </form>
                    </div>

                    {/* Results Display Card */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Generated Result</h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline ml-2">{error}</span>
                            </div>
                        )}

                        {imageSrc ? (
                            <div className="space-y-4">
                                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex justify-center items-center">
                                    <img
                                        src={imageSrc}
                                        alt="Generated data visualization"
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                        style={{ maxHeight: '70vh' }}
                                    />
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="w-full sm:w-auto flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Download PNG
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                {isLoading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-sky-500 mb-3" />
                                        <p>Awaiting API response...</p>
                                    </div>
                                ) : (
                                    <p>Submit the form to generate the image here.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
