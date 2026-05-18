export type SessionUser = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  employee_id?: string | null;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  manager?: string | null;
  role?: {
    id: string;
    name: string;
    admin_access?: boolean | null;
  } | null;
};
