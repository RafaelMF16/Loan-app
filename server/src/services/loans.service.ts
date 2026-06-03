import { pool } from '../database/connection';
import { loanRepository, LoanFilters } from '../repositories/loan.repository';
import { itemRepository } from '../repositories/item.repository';
import { LoanWithDetails } from '../types';
import { PaginatedResult } from './items.service';

const PAGE_SIZE = 10;

export const loansService = {
  async getAll(
    page: number,
    filters: LoanFilters,
    userId: number
  ): Promise<PaginatedResult<LoanWithDetails>> {
    await loanRepository.updateOverdueStatuses();
    const { rows, total } = await loanRepository.findAll(page, filters, userId);
    return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE) || 1,
      perPage: PAGE_SIZE,
    };
  },

  async getById(id: number, userId: number): Promise<LoanWithDetails> {
    await loanRepository.updateOverdueStatuses();
    const loan = await loanRepository.findById(id, userId);
    if (!loan) throw new Error('Empréstimo não encontrado.');
    return loan;
  },

  async getByItemId(
    itemId: number,
    page: number
  ): Promise<PaginatedResult<LoanWithDetails>> {
    await loanRepository.updateOverdueStatuses();
    const { rows, total } = await loanRepository.findByItemId(itemId, page);
    return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE) || 1,
      perPage: PAGE_SIZE,
    };
  },

  async createLoan(
    data: Omit<{ itemId: number; borrowerName: string; borrowerEmail?: string; borrowerContact?: string; expectedReturnDate?: string; notes?: string }, never>,
    createdBy: number
  ): Promise<LoanWithDetails> {
    if (data.expectedReturnDate) {
      const returnDate = new Date(data.expectedReturnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (returnDate < today) {
        throw Object.assign(
          new Error('A data de devolução prevista não pode ser no passado.'),
          { statusCode: 400 }
        );
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `SELECT * FROM sp_criar_emprestimo($1, $2, $3, $4, $5, $6, $7)`,
        [
          data.itemId,
          createdBy,
          data.borrowerName,
          data.borrowerEmail ?? null,
          data.borrowerContact ?? null,
          data.expectedReturnDate ?? null,
          data.notes ?? null,
        ]
      );

      await client.query('COMMIT');

      const createdLoan = result.rows[0];
      const full = await loanRepository.findById(createdLoan.id, createdBy);
      return full!;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === 'P0002') {
        throw Object.assign(new Error('Item não encontrado.'), { statusCode: 404 });
      }
      if (error.code === 'P0001') {
        throw Object.assign(
          new Error('Item não está disponível para empréstimo.'),
          { statusCode: 409 }
        );
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async returnLoan(loanId: number, userId: number): Promise<LoanWithDetails> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const loanResult = await client.query<{ id: number; item_id: number; status: string }>(
        `SELECT l.id, l.item_id, l.status
         FROM loans l
         JOIN items i ON i.id = l.item_id
         WHERE l.id = $1 AND i.user_id = $2
         FOR UPDATE`,
        [loanId, userId]
      );
      const loan = loanResult.rows[0];

      if (!loan) {
        throw Object.assign(new Error('Empréstimo não encontrado.'), { statusCode: 404 });
      }
      if (loan.status === 'devolvido') {
        throw Object.assign(
          new Error('Este empréstimo já foi registrado como devolvido.'),
          { statusCode: 400 }
        );
      }

      await loanRepository.markReturned(loanId, client);
      await itemRepository.updateStatus(loan.item_id, 'disponivel', client);

      await client.query('COMMIT');

      const full = await loanRepository.findById(loanId, userId);
      return full!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
