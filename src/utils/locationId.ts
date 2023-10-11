export const STATION_MIN = 60000000;
export const STATION_MAX = 64000000;
export const LOCATION_MIN = STATION_MIN;
export const LOCATION_MAX = 2000000000000;

export const isLocationIdStructure = (locationId?: number | null): boolean =>
  locationId !== undefined &&
  locationId !== null &&
  locationId > STATION_MAX &&
  locationId <= LOCATION_MAX;

export const isLocationIdStation = (locationId?: number | null): boolean =>
  locationId !== undefined &&
  locationId !== null &&
  locationId >= STATION_MIN &&
  locationId <= STATION_MAX;

export const isLocationIdValid = (locationId?: number | null): boolean =>
  locationId !== undefined &&
  locationId !== null &&
  locationId >= LOCATION_MIN &&
  locationId <= LOCATION_MAX;

const RE_DIGITS = /^\d+$/;
export const isLocationIdStringValid = (locationId: string): boolean =>
  RE_DIGITS.test(locationId) && isLocationIdValid(Number(locationId));
