import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Chart, ChartConfiguration } from 'chart.js';
import { MenuService } from 'src/app/services/menu.service';
import { DispatchService } from 'src/app/services/dispatch.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { catchError, of, Subscription } from 'rxjs';

@Component({
    selector: 'app-raw-material-dispatch',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ProgressBarModule,
        TableModule
    ],
    templateUrl: './raw-material-dispatch.component.html',
    styleUrls: ['./raw-material-dispatch.component.sass'],
})
export class RawMaterialDispatchComponent implements OnInit, OnDestroy {
    private readonly menuService = inject(MenuService);
    private readonly dispatchService = inject(DispatchService);
    private readonly userService = inject(UserService);
    private readonly utilsService = inject(UtilsService);

    toggle = computed(() => this.menuService.toggle());

    user_session: any;
    barChart!: Chart;

    graphDestiny: any = [];
    graphDispatchStatus: any = [];
    graphLast7Days: any = [];
    graphDiscrepancy: number = 0;

    filters: any = {};

    ngOnInit() {
        this.user_session = this.userService.getDataSession();
        const filters = { ...this.filters };
        filters.type_process = 'dispatch';
        this.filters = filters;
        this.dispatchService.getGraphs(this.filters).subscribe({
            next: (data: any) => {
                const dataGraph = data?.data;
                this.graphDestiny = dataGraph?.destiny_count;
                this.graphDispatchStatus = dataGraph?.dispatch_by_status;
                this.graphDiscrepancy = dataGraph?.discrepancy;
                this.graphLast7Days = dataGraph?.discrepancy_7_days;
                
                // Crear gráfico de barras
                this.createBarChart();
            },
            error: ({ error }: any) => this.utilsService.onError(error.message)
        })
    }

    ngOnDestroy() {
        if (this.barChart) {
            this.barChart.destroy();
        }
    }

    getTotalDispatch() {
        return this.graphDispatchStatus?.reduce((total: number, item: any) => total + item.count, 0);
    }

    createBarChart() {
        const canvas = document.getElementById('newsBarChart') as HTMLCanvasElement;
        const labels = this.graphLast7Days?.map((x: any) => x.day);
        const withDiscrepancy = this.graphLast7Days?.map((x: any) => x.with_discrepancy);
        const withoutDiscrepancy = this.graphLast7Days?.map((x: any) => x.without_discrepancy);

        if (!canvas) {
            return;
        }

        const config: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Correctos',
                        data: withoutDiscrepancy,
                        backgroundColor: '#111827',
                        borderRadius: 4,
                        barThickness: 20
                    },
                    {
                        label: 'Novedades',
                        data: withDiscrepancy,
                        backgroundColor: '#ef4444',
                        borderRadius: 4,
                        barThickness: 20
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(...this.graphLast7Days.map((d: any) => d.without_discrepancy + d.with_discrepancy))
                    }
                }
            }
        };

        if (this.barChart) {
            this.barChart.destroy();
        }

        this.barChart = new Chart(canvas, config);
    }
}
