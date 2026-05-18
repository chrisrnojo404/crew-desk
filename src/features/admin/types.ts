export type DirectusRole = {
  id: string;
  name: string;
  description?: string | null;
  admin_access?: boolean | null;
  app_access?: boolean | null;
  users?: number | null;
};

export type DirectoryUser = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  employee_id?: string | null;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  status?: string | null;
  last_access?: string | null;
  role?: {
    id: string;
    name: string;
  } | null;
  manager?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
};
