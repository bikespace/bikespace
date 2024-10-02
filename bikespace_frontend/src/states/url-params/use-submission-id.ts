import {useQueryState, parseAsInteger} from 'nuqs';

export const useSubmissionId = () => {
  return useQueryState('submission_id', parseAsInteger);
};
