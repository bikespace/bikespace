import {cssVarHSL} from './sidebar/data-panel/plot_utils.js';

const parking_time_date_format = 'EEE, dd MMM yyyy hh:mm:ss z';

// for "render_priority", 0 is the highest priority and higher numbers are lower priority
const issue_attributes = {
  not_provided: {
    id: 'not_provided',
    icon: './assets/icons/icon_not_provided.svg',
    render_priority: 0,
    label_short: 'No nearby parking',
    label_long: 'Bicycle parking was not provided nearby',
    color: cssVarHSL('--color-secondary-blue', 'string'),
    color_light: cssVarHSL('--color-secondary-blue-light', 'string'),
  },
  damaged: {
    id: 'damaged',
    icon: './assets/icons/icon_damaged.svg',
    render_priority: 1,
    label_short: 'Parking damaged',
    label_long: 'Bicycle parking was damaged',
    color: cssVarHSL('--color-secondary-red', 'string'),
    color_light: cssVarHSL('--color-secondary-red-light', 'string'),
  },
  abandoned: {
    id: 'abandoned',
    icon: './assets/icons/icon_abandoned.svg',
    render_priority: 2,
    label_short: 'Abandoned bicycle',
    label_long: 'Parked bicycle was abandoned',
    color: cssVarHSL('--color-secondary-yellow-dark', 'string'),
    color_light: cssVarHSL('--color-secondary-yellow-light', 'string'),
  },
  other: {
    id: 'other',
    icon: './assets/icons/icon_other.svg',
    render_priority: 3,
    label_short: 'Other issue',
    label_long: 'Other issue',
    color: cssVarHSL('--color-secondary-med-grey', 'string'),
    color_light: cssVarHSL('--color-secondary-light-grey', 'string'),
  },
  full: {
    id: 'full',
    icon: './assets/icons/icon_full.svg',
    render_priority: 4,
    label_short: 'Parking full',
    label_long: 'Bicycle parking was full',
    color: cssVarHSL('--color-secondary-orange', 'string'),
    color_light: cssVarHSL('--color-secondary-orange-light', 'string'),
  },
};

const parking_duration_attributes = {
  minutes: {
    id: 'minutes',
    type: 'short-term',
    description: 'less than an hour',
    formatted_description: 'for <strong>less than an hour</strong>',
  },
  hours: {
    id: 'hours',
    type: 'short-term',
    description: 'several hours',
    formatted_description: 'for <strong>several hours</strong>',
  },
  overnight: {
    id: 'overnight',
    type: 'long-term',
    description: 'overnight',
    formatted_description: '<strong>overnight</strong>',
  },
  multiday: {
    id: 'multiday',
    type: 'long-term',
    description: 'several days',
    formatted_description: 'for <strong>several days</strong>',
  },
};

export {
  parking_time_date_format,
  issue_attributes,
  parking_duration_attributes,
};
