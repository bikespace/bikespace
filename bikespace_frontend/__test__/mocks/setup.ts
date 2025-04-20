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

export {};
