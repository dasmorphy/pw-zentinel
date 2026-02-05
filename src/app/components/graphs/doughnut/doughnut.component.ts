import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MenuService } from 'src/app/services/menu.service';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { PolarChartComponent } from '../polar-chart/polar-chart.component';

@Component({
  selector: 'app-doughnut',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    DialogModule,
    OverlayPanelModule,
    MultiSelectModule,
    PolarChartComponent
  ],
  templateUrl: './doughnut.component.html',
  styleUrls: ['./doughnut.component.sass'],
})
export class DoughnutComponent {
  
  private readonly menuService = inject(MenuService);
  private readonly dashboardService = inject(DashboardService);
  
  toggle = computed(() => this.menuService.toggle());
  
  dataCategoryQuantity: any = [];
  categoriesData: any[] = [];
  dateRange: Date[] | null = null;
  categoryChart!: Chart;
  logbookChart!: Chart;

  showImageDialog = false;
  optionSector: any = [];
  optionGroupBusiness: any = [];
  selectedGroupBusiness: number[] = [];
  selectedSector: number[] = [];
  selectedTime: string[] = ['Diurna', 'Nocturna'];

  optionFilterCategory = [
    { value: 'all', label: 'Todos' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'salida', label: 'Salida' }
  ]

  optionTime= [ 'Diurna', 'Nocturna']
  user_session: any;

  ngOnInit() {
    const user_session = localStorage.getItem('sb_token')
    const user_json = user_session ? JSON.parse(user_session) : null;
    this.user_session = user_json;
    this.fetchDataGraphs()
    this.fetchSectorByBusiness();
    this.fetchGroupBusinessByBusiness();
  }

  fetchSectorByBusiness() {
    const id_business = this.user_session?.attributes?.id_business
    this.dashboardService.getSectorByBusiness(id_business).subscribe({
      next: (resp: any) => {
        this.optionSector = resp?.data
        // this.selectedSector = this.optionSector?.map((sector: any) => sector.id_sector)
      },
      error: (err) => console.error(err)
    });
  }

  fetchGroupBusinessByBusiness() {
    const id_business = this.user_session?.attributes?.id_business
    this.dashboardService.getGroupBusinessByBusiness(id_business).subscribe({
      next: (resp: any) => {
        this.optionGroupBusiness = resp?.data
        // this.selectedGroupBusiness  = this.optionGroupBusiness?.map((group_business: any) => group_business.id_group_business)
      },
      error: (err) => console.error(err)
    });
  }

  fetchDataGraphs(filters?: any) {
    this.dashboardService.getResumeChart(filters).subscribe({
      next: (resp: any) => {
        this.createLogbookChart(
          resp?.data.total_entrada,
          resp?.data.total_salida
        );
        this.categoriesData = resp.data.categorias;
        this.dataCategoryQuantity = resp.data.categorias_cantidad;
        this.initCategoryChart('all');
      },
      error: (err) => console.error(err)
    });
  }

  onFilterDate(imagePanel: any) {
    imagePanel.hide()
    let filter_date: any = {}

    if (Array.isArray(this.dateRange)) {
      if (this.dateRange.length === 2) {
        const [startDate, endDate] = this.dateRange;
    
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
    
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    
        filter_date.start_date = this.formatLocalDate(start);
        filter_date.end_date = this.formatLocalDate(end);
      };
    };

    if (this.selectedGroupBusiness.length > 0) {
      filter_date.groups_business_id = this.selectedGroupBusiness.join(',');
    }

    if (this.selectedSector.length > 0) {
      filter_date.sectors = this.selectedSector.join(',');
    }

    if (this.selectedTime.length > 0) {
      filter_date.workday = this.selectedTime.join(',');;
    }

    this.fetchDataGraphs(filter_date);
  }

  formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }




  // =====================
  // 📊 Inicializar chart
  // =====================
  initCategoryChart(filter: 'all' | 'entrada' | 'salida') {
    const { labels, values } = this.getChartData(filter);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: this.getDatasetLabel(filter),
          data: values,
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#AB47BC',
            '#26C6DA'
          ],
          borderRadius: 8, // 👈 barras redondeadas (opcional, se ve bonito)
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value
            }
          }
        }
      }
    };

    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    this.categoryChart = new Chart(canvas, config);
  }

  // =====================
  // 🔄 Cambio de filtro
  // =====================
  onFilterChange(event: any) {
    const value = event?.value

    const { labels, values } = this.getChartData(value);

    this.categoryChart.data.labels = labels;
    this.categoryChart.data.datasets[0].data = values;
    this.categoryChart.update();
  }

  // =====================
  // 🧠 Data dinámica
  // =====================
  getChartData(filter: 'all' | 'entrada' | 'salida') {
    const labels = this.categoriesData.map(c => c.categoria);

    const values = this.categoriesData.map(c => {
      if (filter === 'entrada') return c.entrada;
      if (filter === 'salida') return c.salida;
      return c.total;
    });

    return { labels, values };
  }


  createLogbookChart(entrada: number, salida: number) {
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Bitácoras entrada', 'Bitácoras salida'],
        datasets: [{
          data: [entrada, salida],
          backgroundColor: ['#42A5F5', '#66BB6A'],
          hoverBackgroundColor: ['#1E88E5', '#43A047'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    const canvas = document.getElementById('myDoughnutChart') as HTMLCanvasElement;

    if (this.logbookChart) {
      this.logbookChart.destroy();
    }

    this.logbookChart = new Chart(canvas, config);
  }

  getDatasetLabel(filter: 'all' | 'entrada' | 'salida'): string {
    switch (filter) {
      case 'entrada':
        return 'Total de entradas';
      case 'salida':
        return 'Total de salidas';
      default:
        return 'Total';
    }
  }

}
