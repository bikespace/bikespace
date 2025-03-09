import React from 'react';
import dynamic from 'next/dynamic';

import {formOrder} from '../constants';

import {Issue} from '../issue';
import {Time} from '../time';
import {Comments} from '../comments';
import {Summary} from '../summary';
import {Location} from '../location';

interface SubmissionFormContentProps {
  step: number;
}

export function SubmissionFormContent({step}: SubmissionFormContentProps) {
  switch (formOrder[step]) {
    case 'issues':
      return <Issue />;
    case 'location':
      return <Location />;
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
