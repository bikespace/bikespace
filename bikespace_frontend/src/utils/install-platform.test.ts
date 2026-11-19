import {getInstallPlatform, InstallPlatform} from './install-platform';

const userAgents = {
  iPhoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iPhoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1',
  iPhoneInstagram:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0.0',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  windowsChrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  androidFirefox:
    'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
  androidWebView:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36',
};

describe('getInstallPlatform', () => {
  const cases: [string, string, number, InstallPlatform][] = [
    ['iPhone Safari', userAgents.iPhoneSafari, 5, 'ios'],
    ['iPhone Chrome', userAgents.iPhoneChrome, 5, 'ios'],
    ['iPad reporting as a Mac', userAgents.macSafari, 5, 'ios'],
    ['iPhone in-app browser', userAgents.iPhoneInstagram, 5, 'in-app'],
    ['Mac without touch', userAgents.macSafari, 0, 'desktop'],
    ['Windows laptop with touch', userAgents.windowsChrome, 10, 'desktop'],
    ['Android Chrome', userAgents.androidChrome, 5, 'android'],
    ['Android Firefox', userAgents.androidFirefox, 5, 'android'],
    ['Android WebView', userAgents.androidWebView, 5, 'in-app'],
  ];

  test.each(cases)(
    '%s is classified correctly',
    (_, userAgent, maxTouchPoints, expected) => {
      expect(getInstallPlatform({userAgent, maxTouchPoints})).toBe(expected);
    }
  );
});
