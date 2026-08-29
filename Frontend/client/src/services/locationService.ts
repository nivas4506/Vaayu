import { Coordinates } from '../types';

export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is unavailable in this browser.'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
      (error) => reject(new Error(error.code === error.PERMISSION_DENIED ? 'Location permission was denied.' : 'Unable to detect your location.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
