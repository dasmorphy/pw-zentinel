import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MenuService } from 'src/app/services/menu.service';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doughnut',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    FormsModule
  ],
  templateUrl: './doughnut.component.html',
  styleUrls: ['./doughnut.component.sass'],
})
export class DoughnutComponent {

  private readonly menuService = inject(MenuService);
  private readonly dashboardService = inject(DashboardService);

  toggle = computed(() => this.menuService.toggle());

  categoriesData: any[] = [];
  dateRange: Date[] | null = null;
  categoryChart!: Chart;
  logbookChart!: Chart;

  optionFilterCategory = [
    { value: 'all', label: 'Todos' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'salida', label: 'Salida' }
  ]

  ngOnInit() {
    this.fetchDataGraphs()
  }

  fetchDataGraphs(filters?: any) {
    this.dashboardService.getResumeChart(filters).subscribe({
      next: (resp: any) => {
        this.createLogbookChart(
          resp?.data.total_entrada,
          resp?.data.total_salida
        );
        this.categoriesData = resp.data.categorias;
        this.initCategoryChart('all'); // 🔥 carga inicial
      },
      error: (err) => console.error(err)
    });
  }

  onFilterDate() {
    if (!Array.isArray(this.dateRange)) return;
    if (this.dateRange.length !== 2) return;

    const [startDate, endDate] = this.dateRange;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // 👈 opcional pero MUY recomendado

    const filter_date = {
      start_date: this.formatLocalDate(start),
      end_date: this.formatLocalDate(end)
    };

    if (startDate && endDate) {
      this.fetchDataGraphs(filter_date);
    }

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
        return 'Total total';
    }
  }

}
