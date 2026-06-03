import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { AppHeaderComponent } from '../../components/shared/app-header/app-header';
import { AuthService } from '../../services/auth/auth.service';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent],
  templateUrl: './dashboard-page.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly stats = this.dashboardService.stats;
  readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.dashboardService.loadStats(false);
  }
}
