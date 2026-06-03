import { pool } from '../database/connection';

export interface DashboardStats {
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  avgLoanDurationDays: number | null;
}

export const dashboardRepository = {
  async getStats(userId: number | null): Promise<DashboardStats> {
    const result = await pool.query<{
      total_items: string;
      available_items: string;
      borrowed_items: string;
      total_loans: string;
      active_loans: string;
      returned_loans: string;
      overdue_loans: string;
      avg_loan_duration_days: string | null;
    }>(`SELECT * FROM sp_dashboard_stats($1)`, [userId]);

    const row = result.rows[0];
    return {
      totalItems: parseInt(row.total_items, 10),
      availableItems: parseInt(row.available_items, 10),
      borrowedItems: parseInt(row.borrowed_items, 10),
      totalLoans: parseInt(row.total_loans, 10),
      activeLoans: parseInt(row.active_loans, 10),
      returnedLoans: parseInt(row.returned_loans, 10),
      overdueLoans: parseInt(row.overdue_loans, 10),
      avgLoanDurationDays:
        row.avg_loan_duration_days !== null ? parseFloat(row.avg_loan_duration_days) : null,
    };
  },
};
