export type LoanStatus = 'ativo' | 'devolvido' | 'atrasado';

export interface Loan {
  id: number;
  itemId: number;
  createdBy: number;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  notes?: string;
  loanDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: LoanStatus;
  createdAt: string;
  itemName?: string;
  itemIcon?: string;
  createdByName?: string;
}

export interface CreateLoanPayload {
  itemId: number;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface PaginatedLoans {
  data: Loan[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
}
