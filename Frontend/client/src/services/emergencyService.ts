import { Coordinates, Facility } from '../types';

export const haversineKm = (from: Coordinates, to: Coordinates) => {
  const r = 6371; const rad = (value: number) => value * Math.PI / 180;
  const dLat = rad(to.latitude - from.latitude); const dLon = rad(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
export const rankFacilitiesByDistance = (facilities: Facility[], location: Coordinates) => facilities.filter((facility) => facility.emergencyAvailable).map((facility) => ({ facility, distanceKm: haversineKm(location, facility) })).sort((a, b) => a.distanceKm - b.distanceKm);
export const mapUrl = (location: Coordinates) => `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
export const buildEmergencySms = (phone: string, type: string, name: string, location?: Coordinates) => {
  const details = location ? `Location: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}\nMap: ${mapUrl(location)}` : 'Location: unavailable — please call me for details.';
  return `sms:${phone}?body=${encodeURIComponent(`VAAYU EMERGENCY ALERT\nEmergency: ${type}\nName: ${name}\n${details}\nPlease provide emergency assistance immediately.`)}`;
};
