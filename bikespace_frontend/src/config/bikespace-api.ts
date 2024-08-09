import {IssueType} from '@/interfaces/Submission';

// for "renderPriority", 0 is the highest priority and higher numbers are lower priority
export const issuePriority: {
  [key in IssueType]: number;
} = {
  not_provided: 0,
  damaged: 1,
  abandoned: 2,
  other: 3,
  full: 4,
};
