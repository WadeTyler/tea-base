export interface User {
  user_id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  created_at: string;
}