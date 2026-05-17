export type SessionUser = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  role?: string | null;
};
