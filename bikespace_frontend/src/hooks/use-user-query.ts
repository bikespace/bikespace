import {useQuery} from '@tanstack/react-query';

import {UserApiPayload} from '@/interfaces/User';
import {useAuthStore} from '@/states/store';

export function useUserQuery() {
  const {authToken, setAuthToken} = useAuthStore(state => ({
    authToken: state.authToken,
    setAuthToken: state.setAuthToken,
  }));

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
      // handle expired auth token: clear old token so user is prompted to log in again
      if (authToken && response.status === 401) {
        setAuthToken(null);
        throw new Error('Session is no longer valid. Please login again.');
      }
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data as UserApiPayload;
    },
  });
  return query;
}
