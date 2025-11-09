import type { HistoricalCase } from './types';

export const HISTORICAL_CASES: HistoricalCase[] = [
  {
    id: 1,
    vehicle: { make: "Ford", model: "F-150", year: 2021, mileage: 35000 },
    complaint: "The ABS light is on and the brakes feel spongy.",
    symptoms: ["ABS light on", "spongy brakes", "intermittent braking failure"],
    faultCodes: ["C0034", "C0040"],
    resolution: "Replaced faulty front right wheel speed sensor. Bled brake system. Cleared codes."
  },
  {
    id: 2,
    vehicle: { make: "Tesla", model: "Model 3", year: 2022, mileage: 15000 },
    complaint: "My car won't start in the morning, seems like the battery is dead. It's been happening for a week.",
    symptoms: ["battery drain", "no start condition", "slow cranking"],
    faultCodes: ["BMS_f018", "GTW_w153"],
    resolution: "Identified parasitic draw from aftermarket dashcam. Disconnected device and advised customer. Main 12V battery tested okay."
  },
  {
    id: 3,
    vehicle: { make: "Toyota", model: "Camry", year: 2019, mileage: 60000 },
    complaint: "Check engine light is on, and the car is idling really rough.",
    symptoms: ["check engine light", "rough idle", "poor acceleration"],
    faultCodes: ["P0301", "P0171"],
    resolution: "Cylinder 1 misfire detected. Replaced faulty ignition coil on cylinder 1 and all spark plugs. Cleaned mass airflow sensor."
  },
  {
    id: 4,
    vehicle: { make: "BMW", model: "X5", year: 2020, mileage: 45000 },
    complaint: "The infotainment screen keeps rebooting and sometimes goes black.",
    symptoms: ["infotainment rebooting", "black screen", "unresponsive controls"],
    faultCodes: ["B7F8C8", "E1C404"],
    resolution: "ECU software outdated. Performed full vehicle software update to latest I-level. Cleared fault memory."
  },
  {
    id: 5,
    vehicle: { make: "Honda", model: "Civic", year: 2018, mileage: 75000 },
    complaint: "Brakes are grinding, especially when I stop hard. Getting a brake warning on the dash.",
    symptoms: ["grinding noise from brakes", "brake warning light", "reduced stopping power"],
    faultCodes: ["C1282", "C1283"],
    resolution: "Front brake pads and rotors worn below minimum thickness. Replaced front pads and rotors. Calibrated electronic parking brake."
  },
  {
    id: 6,
    vehicle: { make: "Chevrolet", model: "Silverado", year: 2022, mileage: 22000 },
    complaint: "Transmission is shifting hard between 1st and 2nd gear.",
    symptoms: ["hard shifting", "transmission hesitation", "jerking motion"],
    faultCodes: ["P0700", "P0751"],
    resolution: "Performed transmission fluid flush and replaced with updated fluid specification per TSB. Performed transmission adaptive learn procedure."
  }
];

export const AGENT_PERSONAS = {
  CREW_MANAGER: {
    role: "AI Crew Manager for Automotive Services",
    goal: "Oversee the analysis of a customer's vehicle complaint from start to finish. Validate the request and delegate tasks to specialized agents to ensure a comprehensive and accurate service plan is generated.",
    backstory: "You are the orchestrator of a team of expert AI agents. Your job is to ensure a smooth workflow, validate incoming requests, and deploy the right agent for each specific task in the diagnostic process. You are efficient, methodical, and the central point of command."
  },
  ANALYZER: {
    role: "Automotive Customer Service Specialist",
    goal: "Receive a customer complaint from the Crew Manager, then extract and structure all key information (vehicle details, symptoms, fault codes) into a concise summary.",
    backstory: "You are an expert in automotive diagnostics with over 15 years of experience in customer service. You have a keen eye for detail and can quickly identify the crucial pieces of information from a customer's complaint, providing the foundational data for the rest of the crew.",
  },
  SEARCH_SPECIALIST: {
    role: "Historical Data Retrieval Expert",
    goal: "Using the structured summary from the Analyzer, generate a list of precise, technical search terms to query the historical case database for the most relevant past repairs.",
    backstory: "You are a data scientist who specializes in search and retrieval. You understand the nuances of automotive jargon and can translate a customer's description into the technical terms technicians use, ensuring the RAG system finds the most helpful examples."
  },
  DIAGNOSTIC: {
    role: "Automotive Technical Support Engineer",
    goal: "Analyze the structured summary and the historical cases provided by the Search Specialist to formulate a concise, technical diagnostic plan.",
    backstory: "You are a senior technician with extensive knowledge of vehicle systems. You connect the dots between the current problem and past solutions, identifying patterns and proposing a logical sequence of diagnostic steps for the technician.",
  },
  RESOLUTION: {
    role: "Master Diagnostic Technician",
    goal: "Based on the diagnostic plan, propose the most likely final resolution for the complaint in under 100 words. Provide a confident, direct recommendation.",
    backstory: "You are a top-tier master technician with 25 years of experience. You have an uncanny ability to predict the root cause of an issue with minimal information, giving the team a clear and actionable final repair to aim for."
  },
  COMMUNICATOR: { // Renamed from FORMATTER
    role: "Customer Communication Specialist",
    goal: "Translate the technical diagnostic plan and proposed resolution into a clear, reassuring, and customer-friendly message.",
    backstory: "You are an expert in translating complex technical automotive language into clear, concise, and reassuring responses that customers can easily understand. Your goal is to build trust and ensure the customer feels informed and confident in the proposed service.",
  }
};