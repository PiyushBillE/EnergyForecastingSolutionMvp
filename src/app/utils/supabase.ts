import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Create Supabase client singleton
const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

// API Base URL for server endpoints
const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-33a46fa6`;

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== CAMPUS PROFILE API ====================

export interface CampusProfile {
  id?: string;
  name: string;
  location: string;
  num_buildings: number;
  campus_size: 'Small' | 'Medium' | 'Large';
  avg_occupancy: number;
  has_hostels: boolean;
  peak_hours_start: string;
  peak_hours_end: string;
  special_event_frequency: 'Rare' | 'Monthly' | 'Weekly';
  created_at?: string;
}

export async function getCampuses(): Promise<CampusProfile[]> {
  return apiCall('/campuses');
}

export async function getCampus(id: string): Promise<CampusProfile> {
  return apiCall(`/campus/${id}`);
}

export async function createOrUpdateCampus(campus: CampusProfile): Promise<CampusProfile> {
  return apiCall('/campus', {
    method: 'POST',
    body: JSON.stringify(campus),
  });
}

export async function deleteCampus(id: string): Promise<{ success: boolean }> {
  return apiCall(`/campus/${id}`, {
    method: 'DELETE',
  });
}

// ==================== ENERGY DATA API ====================

export interface EnergyData {
  id?: string;
  campus_id: string;
  building_id?: string;
  timestamp: string;
  occupancy: number;
  temperature: number;
  humidity: number;
  energy_consumption: number;
}

export async function getEnergyData(
  campusId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<EnergyData[]> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/energy-data/${campusId}${query}`);
}

export async function createEnergyData(data: EnergyData | EnergyData[]): Promise<EnergyData[]> {
  return apiCall('/energy-data', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== PREDICTIONS API ====================

export interface Prediction {
  id?: string;
  campus_id: string;
  prediction_time: string;
  predicted_energy: number;
  efficiency_score?: number;
  recommendation?: string;
  created_at?: string;
}

export async function getPredictions(
  campusId: string,
  limit?: number
): Promise<Prediction[]> {
  const query = limit ? `?limit=${limit}` : '';
  return apiCall(`/predictions/${campusId}${query}`);
}

export async function createPredictions(predictions: Prediction | Prediction[]): Promise<Prediction[]> {
  return apiCall('/predictions', {
    method: 'POST',
    body: JSON.stringify(predictions),
  });
}

// ==================== USER INPUTS API ====================

export interface UserInput {
  id?: string;
  campus_id: string;
  input_date: string;
  input_time: string;
  occupancy: number;
  temperature: number;
  created_at?: string;
}

export async function getUserInputs(
  campusId: string,
  limit?: number
): Promise<UserInput[]> {
  const query = limit ? `?limit=${limit}` : '';
  return apiCall(`/user-inputs/${campusId}${query}`);
}

export async function createUserInput(input: UserInput): Promise<UserInput> {
  return apiCall('/user-inputs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ==================== BUILDINGS API ====================

export interface Building {
  id?: string;
  campus_id: string;
  building_name: string;
  building_type: string;
  floor_area: number;
  created_at?: string;
}

export async function getBuildings(campusId: string): Promise<Building[]> {
  return apiCall(`/buildings/${campusId}`);
}

export async function createBuilding(building: Building): Promise<Building> {
  return apiCall('/buildings', {
    method: 'POST',
    body: JSON.stringify(building),
  });
}

// ==================== ANALYTICS API ====================

export interface CampusMetrics {
  totalEnergy: number;
  avgDailyEnergy: number;
  peakDemand: number;
  avgOccupancy: number;
  carbonEmissions: number;
  dataPoints: number;
}

export async function getCampusMetrics(campusId: string): Promise<CampusMetrics> {
  return apiCall(`/analytics/${campusId}/metrics`);
}
