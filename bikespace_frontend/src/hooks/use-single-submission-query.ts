import {useQuery} from '@tanstack/react-query';
import {SubmissionApiPayload} from '@/interfaces/Submission';

export function useSingleSubmissionQuery(submissionId: number | null) {
  const query = useQuery({
    queryKey: ['submission', submissionId],
    enabled: Boolean(submissionId),
    queryFn: async () => {
      const res = await fetch(
        `${process.env.BIKESPACE_API_URL_DASHBOARD}/submissions/${submissionId}`
      );
      const data = await res.json();
      return data.submission as SubmissionApiPayload;
    },
  });
  return query;
}
