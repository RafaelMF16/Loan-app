export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
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
  role: 'user' | 'admin';
}

export type LoanStatus = 'ativo' | 'devolvido' | 'atrasado';

export interface Loan {
  id: number;
  itemId: number;
  createdBy: number;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  notes?: string;
  loanDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  status: LoanStatus;
  createdAt: Date;
}

export interface LoanWithDetails extends Loan {
  itemName: string;
  itemIcon: string;
  createdByName: string;
}
