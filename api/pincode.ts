import { apiFetch } from './client';
import { PincodeLookupResponse } from './types';

export async function lookupPincode(pincode: string): Promise<PincodeLookupResponse> {
  return apiFetch<PincodeLookupResponse>(`/pincode/${pincode}`);
}
