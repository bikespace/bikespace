// TEST BROWSER CONFIGURATION
export const testLat = 43.76;
export const testLong = -79.43;

export const testDefaultViewport = {
  height: 600,
  width: 800,
};
export const testDesktopViewport = {
  height: 800,
  width: 1200,
};

export const defaultTestOptions = {
  geolocation: {
    latitude: testLat,
    longitude: testLong,
  },
  permissions: ['geolocation'],
  timezoneId: 'America/Toronto',
  viewport: testDefaultViewport,
};

// TEST USER ACCOUNTS
// should mirror values in bikespace_api/bikespace_api/seed.py
export const nonAdminUser = {
  username: 'nonadminuser',
  email: 'notanadmin@example.com',
  password: 'notanadmin',
};
