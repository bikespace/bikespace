// maplibre-gl v5+ uses TextDecoder at module load time; jsdom does not provide it
import {TextDecoder, TextEncoder} from 'util';
Object.assign(global, {TextDecoder, TextEncoder});

// mock navigator.geolocation
const clearWatchMock = jest.fn();
const getCurrentPositionMock = jest.fn().mockImplementationOnce(success =>
  Promise.resolve(
    success({
      coords: {
        latitude: 43.65322,
        longitude: -79.384452,
      },
    })
  )
);
const watchPositionMock = jest.fn();

const geolocation = {
  clearWatch: clearWatchMock,
  getCurrentPosition: getCurrentPositionMock,
  watchPosition: watchPositionMock,
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: geolocation,
});

// mock window.URL.createObjectURL
if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn();
}

export {};
