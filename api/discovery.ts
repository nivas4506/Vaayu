import { apiFetch } from './client';
import { Facility } from '../frontend/src/types/index';

export interface DiscoverParams {
  pincode: string;
  service_id?: string;
  max_distance_km?: number;
  min_confidence?: number;
}

export interface DiscoverResponse {
  facilities: Facility[];
  alternates: Facility[];
  gap_detected: boolean;
  total_matching: number;
}

export async function discoverFacilities(params: DiscoverParams): Promise<DiscoverResponse> {
  const query = new URLSearchParams();
  query.append('pincode', params.pincode);
  if (params.service_id) query.append('service_id', params.service_id);
  if (params.max_distance_km) query.append('max_distance_km', params.max_distance_km.toString());
  if (params.min_confidence) query.append('min_confidence', params.min_confidence.toString());

  return apiFetch<DiscoverResponse>(`/discover?${query.toString()}`);
}
