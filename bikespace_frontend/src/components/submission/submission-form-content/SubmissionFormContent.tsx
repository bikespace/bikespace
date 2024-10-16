import React from 'react';
import dynamic from 'next/dynamic';

import {formOrder} from '../constants';

import {Issue} from '../issue';
import {MapHandler} from '../map-handler';
import {Time} from '../time';
import {Comments} from '../comments';
import {Summary} from '../summary';

import {LocationProps} from '../location';

interface SubmissionFormContentProps {
  step: number;
}

const Location = dynamic<LocationProps>(() => import('../location/Location'), {
  loading: () => <></>,
  ssr: false,
});

export function SubmissionFormContent({step}: SubmissionFormContentProps) {
  switch (formOrder[step]) {
    case 'issues':
      return <Issue />;
    case 'location':
      return <Location handler={<MapHandler />} />;
    case 'parkingTime':
      return <Time />;
    case 'comments':
      return <Comments />;
    case 'summary': {
      return <Summary />;
    }
    default:
      throw new Error('Undefined component set to load');
  }
}
