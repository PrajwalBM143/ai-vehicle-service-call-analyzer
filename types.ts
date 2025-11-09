export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  mileage: number;
}

export interface HistoricalCase {
  id: number;
  vehicle: VehicleDetails;
  complaint: string;
  symptoms: string[];
  faultCodes: string[];
  resolution: string;
}

export interface AnalysisSummary {
  vehicleDetails: VehicleDetails;
  symptoms: string[];
  faultCodes: string[];
  complaintSummary: string;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  diagnosticBrief: string;
  proposedResolution: string;
  customerResponse: string;
  retrievedCases: HistoricalCase[];
}
