import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Chart, ChartConfiguration } from 'chart.js';
import { MenuService } from 'src/app/services/menu.service';
import { DispatchService } from 'src/app/services/dispatch.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
    selector: 'app-finished-product-dispatch',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ProgressBarModule
    ],
    templateUrl: './finished-product-dispatch.component.html',
    styleUrls: ['./finished-product-dispatch.component.sass'],
})
export class FinishedProductDispatchComponent implements OnInit, OnDestroy {
    private readonly menuService = inject(MenuService);
    private readonly dispatchService = inject(DispatchService);
    private readonly userService = inject(UserService);
    private readonly utilsService = inject(UtilsService);

    toggle = computed(() => this.menuService.toggle());

    user_session: any;
    doughnutChart!: Chart;
    barChart!: Chart;

    graphProductTerm: any = [];
    graphLast7Days: any = [];
    graphDiscrepancy: number = 0;
    graphWithoutDiscrepancy: number = 0;
    graphDispatchStatus: any = [];

    filters: any = {};

    ngOnInit() {
        this.user_session = this.userService.getDataSession();
        const filters = { ...this.filters };
        filters.type_process = 'product';
        this.filters = filters;

        this.dispatchService.getGraphs(this.filters).subscribe({
            next: (data: any) => {
                const dataGraph = data?.data;
                this.graphProductTerm = dataGraph?.product_term;
                // this.graphDestiny = dataGraph?.destiny_count;
                this.graphDispatchStatus = dataGraph?.dispatch_by_status;
                this.graphDiscrepancy = dataGraph?.discrepancy;
                this.graphWithoutDiscrepancy = dataGraph?.without_discrepancy;
                this.graphLast7Days = dataGraph?.discrepancy_7_days;
                
                this.createDoughnutChart();
                this.createBarChart();
            },
            error: ({ error }: any) => this.utilsService.onError(error.message)
        })
    }

    ngOnDestroy() {
        if (this.doughnutChart) {
            this.doughnutChart.destroy();
        }
        if (this.barChart) {
            this.barChart.destroy();
        }
    }

    createDoughnutChart() {
        console.log('ffjkfjkfjkfjk')
        const store_count = this.graphProductTerm?.warehouse_count ?? 0;
        const client_count = this.graphProductTerm?.client_count ?? 0;

        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw(chart: any) {
                const { ctx, width, height } = chart;
                ctx.save();

                const centerX = width / 2;
                const centerY = height / 2;

                // TEXTO SUPERIOR
                ctx.font = '500 14px Arial';
                ctx.fillStyle = '#6b7280';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('BODEGAS', centerX, centerY - 30);

                // VALOR
                ctx.font = 'bold 32px Arial';
                ctx.fillStyle = '#111827';
                ctx.fillText(
                    `${store_count}%`,
                    centerX,
                    centerY - 8
                );

                ctx.restore();
            }
        };

        const config: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data: {
                labels: ['Cliente', 'Bodegas'],
                datasets: [{
                    data: [client_count, store_count],
                    backgroundColor: ['#091426', '#515f74'],
                    hoverBackgroundColor: ['#091426', '#515f74'],
                    borderRadius: 10,
                    spacing: 2,
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '80%',
                responsive: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            } as any,
            plugins: [centerTextPlugin]
        };

        const canvas = document.getElementById('destinosChart') as HTMLCanvasElement;

        if (!canvas) {
            return;
        }

        if (this.doughnutChart) {
            this.doughnutChart.destroy();
        }

        this.doughnutChart = new Chart(canvas, config);
    }

    createBarChart() {
        const canvas = document.getElementById('tendencyChart') as HTMLCanvasElement;
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

    getTotalDispatch() {
        return this.graphDispatchStatus?.reduce((total: number, item: any) => total + item.count, 0);
    }

    valueProgressBar(value: number = 0): number {
        const total = this.graphDispatchStatus[2] ?? 1;
        return Number(((value / total) * 100).toFixed(0));
    }
}
