import {createWithEqualityFn} from 'zustand/traditional';
import {persist} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';

interface AuthStore {
  authToken: string | null;
  setAuthToken: (newToken: string | null) => void;
  username: string | null;
  setUsername: (newUsername: string | null) => void;
}

export const useAuthStore = createWithEqualityFn<AuthStore>()(
  persist(
    set => ({
      authToken: null,
      setAuthToken: newToken => set({authToken: newToken}),
      username: null,
      setUsername: newUsername => set({username: newUsername}),
    }),
    {name: 'auth-token'}
  ),
  shallow
);
