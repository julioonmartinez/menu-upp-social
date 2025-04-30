import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explore-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-tabs.component.html',
  styleUrls: ['./explore-tabs.component.scss']
})
export class ExploreTabsComponent {
  @Input() activeTab: 'restaurants' | 'dishes' | 'routes' = 'restaurants';
  @Output() tabChange = new EventEmitter<'restaurants' | 'dishes' | 'routes'>();
  
  /**
   * Maneja el cambio de tab
   */
  onTabChange(tab: 'restaurants' | 'dishes' | 'routes'): void {
    if (tab !== this.activeTab) {
      this.tabChange.emit(tab);
    }
  }
}