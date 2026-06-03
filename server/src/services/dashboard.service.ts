import { dashboardRepository, DashboardStats } from '../repositories/dashboard.repository';

export const dashboardService = {
  async getStats(userId: number): Promise<DashboardStats> {
    return dashboardRepository.getStats(userId);
  },

  async getAdminStats(): Promise<DashboardStats> {
    return dashboardRepository.getStats(null);
  },
};
