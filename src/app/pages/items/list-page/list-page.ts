import { Component } from '@angular/core';
import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [AppHeaderComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.scss',
})
export class ListPageComponent {
}
