import React, { useState, useCallback, useEffect } from 'react';
import { analyzeServiceCall } from './services/geminiService';
import type { ProgressCallback } from './services/geminiService';
import type { AnalysisResult, HistoricalCase } from './types';
import AgentCard from './components/AgentCard';
import HistoricalCaseCard from './components/HistoricalCaseCard';
import CrewActivityMonitor from './components/CrewActivityMonitor';

// Icons
const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);
const WrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);
const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

interface AnalysisRecord {
    complaintId: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleMileage: number;
    complaintDescription: string;
    symptoms: string;
    faultCodes: string;
    diagnosticBrief: string;
    proposedResolution: string;
    customerResponse: string;
}

export interface CrewStatus {
    agent: string;
    status: 'working' | 'complete' | 'error' | 'pending';
    message?: string;
}

const App: React.FC = () => {
    const [complaintId, setComplaintId] = useState<string>('');
    const [vehicleMake, setVehicleMake] = useState<string>('');
    const [vehicleModel, setVehicleModel] = useState<string>('');
    const [complaintDescription, setComplaintDescription] = useState<string>('');
    const [symptoms, setSymptoms] = useState<string>('');
    const [faultCodes, setFaultCodes] = useState<string>('');

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedCases, setUploadedCases] = useState<HistoricalCase[] | null>(null);
    const [crewStatus, setCrewStatus] = useState<CrewStatus[]>([]);

    const createNewComplaintId = () => {
        const newId = `C-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        setComplaintId(newId);
    };

    useEffect(() => {
        createNewComplaintId();
    }, []);

    const handleAnalyze = useCallback(async () => {
        if (!vehicleMake.trim() || !vehicleModel.trim() || !complaintDescription.trim()) {
            setError("Please fill in the vehicle make, model, and complaint description.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setCrewStatus([]);

        const fullComplaint = `
            The customer has a ${vehicleMake} ${vehicleModel}.
            The main complaint is: "${complaintDescription}".
            They have observed the following symptoms: ${symptoms || 'none mentioned'}.
            They have noted the following error codes: ${faultCodes || 'none mentioned'}.
        `;
        
        const progressCallback: ProgressCallback = (agent, status, message) => {
             setCrewStatus(prev => {
                const existingIndex = prev.findIndex(s => s.agent === agent);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], status, message: message || updated[existingIndex].message };
                    return updated;
                }
                return [...prev, { agent, status, message: message || '' }];
            });
        };

        try {
            const result = await analyzeServiceCall(fullComplaint, uploadedCases, progressCallback);
            setAnalysisResult(result);
            
            const newRecord: AnalysisRecord = {
                complaintId,
                vehicleMake,
                vehicleModel,
                vehicleYear: result.summary.vehicleDetails.year,
                vehicleMileage: result.summary.vehicleDetails.mileage,
                complaintDescription,
                symptoms,
                faultCodes,
                diagnosticBrief: result.diagnosticBrief,
                proposedResolution: result.proposedResolution,
                customerResponse: result.customerResponse,
            };
            setAnalysisHistory(prev => [...prev, newRecord]);

            // Reset for next entry
            createNewComplaintId();
            setVehicleMake('');
            setVehicleModel('');
            setComplaintDescription('');
            setSymptoms('');
            setFaultCodes('');

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(errorMessage);
            
            const lastActiveAgent = crewStatus.find(s => s.status === 'working');
            if(lastActiveAgent) {
                progressCallback(lastActiveAgent.agent, 'error', errorMessage);
            }

        } finally {
            setIsLoading(false);
        }
    }, [complaintId, vehicleMake, vehicleModel, complaintDescription, symptoms, faultCodes, uploadedCases, crewStatus]);
    
    const handleExport = () => {
        if (analysisHistory.length === 0) {
            alert("There is no analysis data to export.");
            return;
        }

        const headers = [
            "Complaint ID",
            "Vehicle Company",
            "Vehicle Model",
            "Vehicle Year",
            "Vehicle Mileage",
            "Complaint Description",
            "Symptoms",
            "Error Codes",
            "Diagnostic Steps",
            "Proposed Resolution",
            "Customer Response"
        ];

        const escapeCsvCell = (cellData: string): string => {
            if (cellData === null || cellData === undefined) return '""';
            const str = String(cellData);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvContent = [
            headers.join(','),
            ...analysisHistory.map(row => [
                escapeCsvCell(row.complaintId),
                escapeCsvCell(row.vehicleMake),
                escapeCsvCell(row.vehicleModel),
                escapeCsvCell(String(row.vehicleYear)),
                escapeCsvCell(String(row.vehicleMileage)),
                escapeCsvCell(row.complaintDescription),
                escapeCsvCell(row.symptoms),
                escapeCsvCell(row.faultCodes),
                escapeCsvCell(row.diagnosticBrief),
                escapeCsvCell(row.proposedResolution),
                escapeCsvCell(row.customerResponse),
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `service_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    setError("CSV file is empty or has no data rows.");
                    return;
                }
                
                const dataLines = lines.slice(1);
                const parsedCases: HistoricalCase[] = dataLines.map((line, index) => {
                    const values = line.split(',');
                    return {
                        id: index,
                        vehicle: {
                            make: values[1] || '',
                            model: values[2] || '',
                            year: parseInt(values[3], 10) || 0,
                            mileage: parseInt(values[4], 10) || 0,
                        },
                        complaint: values[5] || '',
                        symptoms: values[6] ? values[6].split(',').map(s => s.trim()).filter(Boolean) : [],
                        faultCodes: values[7] ? values[7].split(',').map(c => c.trim()).filter(Boolean) : [],
                        resolution: values[9] || '',
                    };
                });
                
                setUploadedCases(parsedCases);
                setError(null);
            } catch (err) {
                console.error("Error parsing CSV:", err);
                setError("Failed to parse CSV. Please use a file exported from this app.");
                setUploadedCases(null);
            }
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
        }
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
                        AI Vehicle Service Complaint Analyzer
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        An intelligent agent crew to analyze customer complaints, retrieve historical cases, and provide diagnostic recommendations.
                    </p>
                </header>
                
                <div className="text-right mb-4 flex justify-end items-center flex-wrap gap-4">
                     <div>
                        <label htmlFor="csv-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all duration-200">
                            <UploadIcon />
                            Upload Cases (.csv)
                        </label>
                        <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                     </div>
                     <button
                        onClick={handleExport}
                        disabled={analysisHistory.length === 0}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <DownloadIcon />
                        Export All to Excel (.csv) ({analysisHistory.length})
                    </button>
                </div>

                {uploadedCases && <div className="text-right mb-4 text-sm text-green-400 -mt-2">{uploadedCases.length} historical cases loaded from file. Analysis will use this data.</div>}

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-300">
                            New Service Complaint
                        </h2>
                        <div className="text-sm font-mono text-gray-400 bg-gray-900 px-3 py-1 rounded">
                            ID: {complaintId}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                             <label htmlFor="vehicle-make" className="block text-sm font-medium text-gray-400 mb-1">
                                Vehicle Company (Make) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="vehicle-make"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="e.g., Ford"
                                value={vehicleMake}
                                onChange={(e) => setVehicleMake(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="vehicle-model" className="block text-sm font-medium text-gray-400 mb-1">
                                Vehicle Model <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="vehicle-model"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="e.g., F-150"
                                value={vehicleModel}
                                onChange={(e) => setVehicleModel(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                     <div className="mb-4">
                        <label htmlFor="complaint-description" className="block text-sm font-medium text-gray-400 mb-1">
                           Complaint Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="complaint-description"
                            rows={4}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="e.g., The ABS light is on and the brakes feel really weird and spongy."
                            value={complaintDescription}
                            onChange={(e) => setComplaintDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="symptoms" className="block text-sm font-medium text-gray-400 mb-1">
                                Symptoms (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="symptoms"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="e.g., ABS light on, spongy brakes"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                             <label htmlFor="fault-codes" className="block text-sm font-medium text-gray-400 mb-1">
                                Observed Error Codes (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="fault-codes"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="e.g., C0034, P0301"
                                value={faultCodes}
                                onChange={(e) => setFaultCodes(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                    {error && !isLoading && <p className="mt-4 text-red-400">{error}</p>}
                </div>

                {isLoading && <CrewActivityMonitor crewStatus={crewStatus} />}

                {analysisResult && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <AgentCard title="Service Call Summary" icon={<ClipboardIcon />}>
                                <p className="font-bold text-gray-100">{analysisResult.summary.vehicleDetails.year} {analysisResult.summary.vehicleDetails.make} {analysisResult.summary.vehicleDetails.model}</p>
                                <p className="text-sm text-gray-400">{analysisResult.summary.vehicleDetails.mileage.toLocaleString()} miles</p>
                                <p className="bg-gray-700/50 p-3 rounded-md italic">"{analysisResult.summary.complaintSummary}"</p>
                                <div>
                                    <h4 className="font-semibold text-gray-200 mb-2">Symptoms:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {analysisResult.summary.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                {analysisResult.summary.faultCodes.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-gray-200 mb-2">Fault Codes:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.summary.faultCodes.map((c, i) => <span key={i} className="bg-red-900/50 text-red-300 text-xs font-mono px-2 py-1 rounded">{c}</span>)}
                                        </div>
                                    </div>
                                )}
                            </AgentCard>

                            <AgentCard title="Diagnostic Analysis" icon={<WrenchIcon />}>
                                <p>{analysisResult.diagnosticBrief}</p>
                            </AgentCard>
                            
                            <AgentCard title="Proposed Resolution " icon={<LightbulbIcon />}>
                                <p>{analysisResult.proposedResolution}</p>
                            </AgentCard>

                            <AgentCard title="Formatted Customer Response" icon={<ChatIcon />}>
                                <p>{analysisResult.customerResponse}</p>
                            </AgentCard>
                        </div>
                        
                        {analysisResult.retrievedCases.length > 0 && (
                            <div>
                                <div className="flex items-center mb-4 mt-12">
                                    <div className="bg-gray-700 p-3 rounded-full mr-4 text-blue-400">
                                        <ArchiveIcon />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-100">Retrieved Historical Cases</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {analysisResult.retrievedCases.map(caseData => (
                                        <HistoricalCaseCard key={caseData.id} caseData={caseData} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <style>{`
              .animate-fade-in {
                animation: fadeIn 0.5s ease-in-out;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
        </div>
    );
};

export default App;