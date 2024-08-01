import React, {createContext} from 'react';

import {SubmissionApiPayload} from '@/interfaces/Submission';

export const SubmissionsContext = createContext<SubmissionApiPayload[]>([]);
