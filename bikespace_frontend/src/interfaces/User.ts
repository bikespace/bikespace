export interface UserApiPayload {
  id: number;
  username: string;
  email: string;
  active: boolean;
  confirmed_at: string;
  first_name: string | null;
  last_name: string | null;
}
