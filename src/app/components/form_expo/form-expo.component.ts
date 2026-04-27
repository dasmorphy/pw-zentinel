import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MenuService } from 'src/app/services/menu.service';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-form-expo',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    DialogModule,
    OverlayPanelModule,
    MultiSelectModule
  ],
  templateUrl: './form-expo.component.html',
  styleUrls: ['./form-expo.component.sass'],
})
export class FormExpoComponent {
    
}