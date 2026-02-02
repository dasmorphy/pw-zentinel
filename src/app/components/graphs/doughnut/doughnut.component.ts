import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-doughnut',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './doughnut.component.html',
  styleUrls: ['./doughnut.component.sass'],
})
export class DoughnutComponent {

  private readonly menuService = inject(MenuService);
  private readonly dashboardService = inject(DashboardService);

  toggle = computed(() => this.menuService.toggle());

  categoriesData: any[] = [];
  categoryChart!: Chart;
  optionFilterCategory = [
    { value: 'all', label: 'Todos' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'salida', label: 'Salida' }
  ]

  ngOnInit() {
    this.dashboardService.getResumeChart().subscribe({
      next: (resp: any) => {
        this.createLogbookChart(
          resp?.data.porcentaje_entrada,
          resp?.data.porcentaje_salida
        );
        this.categoriesData = resp.data.categorias;
        this.initCategoryChart('all'); // 🔥 carga inicial
      },
      error: (err) => console.error(err)
    });
  }

  // =====================
  // 📊 Inicializar chart
  // =====================
  initCategoryChart(filter: 'all' | 'entrada' | 'salida') {
    const { labels, values } = this.getChartData(filter);

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#AB47BC',
            '#26C6DA'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
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
      return c.porcentaje_total;
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
    new Chart(canvas, config);
  }
}
