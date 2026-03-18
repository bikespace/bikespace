import umami, {UmamiEventData} from '@umami/node';

import {umamiConfig} from '@/config/umami';

umami.init(umamiConfig);

export const trackUmamiEvent = (eventName: string, data?: UmamiEventData) => {
  // Disable tracking during development
  // Tracking calls during testing _should_ be caught by mocks
  if (process.env.NODE_ENV === 'development') return;

  umami.track(eventName, data);
};
