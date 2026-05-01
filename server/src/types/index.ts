export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  status: 'disponivel' | 'emprestado';
  statusDetail?: string;
  icon: 'notebook' | 'camera' | 'tablet' | 'fone';
  created_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
}
