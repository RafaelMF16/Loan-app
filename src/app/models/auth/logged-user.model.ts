export interface LoggedUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
