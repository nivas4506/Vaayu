import { apiFetch } from './client';
import { PincodeLookupResponse } from '../frontend/src/types/index';

export async function lookupPincode(pincode: string): Promise<PincodeLookupResponse> {
  return apiFetch<PincodeLookupResponse>(`/pincode/${pincode}`);
}
