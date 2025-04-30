import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './registration-sidebar.component.html',
  styleUrls: ['./registration-sidebar.component.scss']
})
export class RegistrationSidebarComponent {
  @Input() stats: { value: string, label: string }[] = [];
}