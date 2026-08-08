import {useQuery} from '@tanstack/react-query';

import {UserApiPayload} from '@/interfaces/User';
import {useAuthStore} from '@/states/store';

export function useUserQuery() {
  const authToken = useAuthStore(state => state.authToken);

  const query = useQuery({
    queryKey: [authToken],
    enabled: Boolean(authToken),
    queryFn: async () => {
      const response = await fetch(
        `${process.env.BIKESPACE_API_URL}/users/me`,
        {
          headers: {
            Accept: 'application/json',
            'Authentication-Token': authToken!,
          },
        }
      );
      const data = await response.json();
      return data as UserApiPayload;
    },
  });
  return query;
}
