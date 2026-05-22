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

    // Data para tarjetas superiores
    totalDispatches: number = 1284;
    totalDispatchesPercent: number = 12;
    skuDispatched: number = 45302;
    skuDispatchedPercent: number = 98.2;
    newsCount: number = 18;
    newsPercent: number = 4;

    // Data para gráficos
    graphDestinations: any = [];
    graphReceptionQuality: any = [];
    graphTrendency: any = [];

    ngOnInit() {
        this.user_session = this.userService.getDataSession();
        this.loadData();
    }

    ngOnDestroy() {
        if (this.doughnutChart) {
            this.doughnutChart.destroy();
        }
        if (this.barChart) {
            this.barChart.destroy();
        }
    }

    loadData() {
        // Emular datos del backend
        this.graphDestinations = [
            { name: 'Ingresado a Bodegas', value: 873, percentage: 68 },
            { name: 'Ingresado a Clientes', value: 411, percentage: 32 }
        ];

        this.graphReceptionQuality = [
            { name: 'Correctas', value: 96.5, color: '#22c55e' },
            { name: 'Incorrectas', value: 3.5, color: '#ef4444' }
        ];

        this.graphTrendency = [
            { date: 'LUN', correct: 45, news: 5 },
            { date: 'MAR', correct: 32, news: 8 },
            { date: 'MIE', correct: 22, news: 6 },
            { date: 'JUE', correct: 49, news: 4 },
            { date: 'VIE', correct: 60, news: 2 },
            { date: 'SÁB', correct: 35, news: 9 },
            { date: 'DOM', correct: 49, news: 7 }
        ];

        // Crear gráficos
        this.createDoughnutChart();
        this.createBarChart();
    }

    createDoughnutChart() {
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
                ctx.fillText('68%', centerX, centerY + 5);

                ctx.restore();
            }
        };

        const config: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data: {
                labels: this.graphDestinations.map((d: any) => d.name),
                datasets: [{
                    data: this.graphDestinations.map((d: any) => d.value),
                    backgroundColor: ['#091426', '#515f74'],
                    hoverBackgroundColor: ['#091426', '#515f74'],
                    borderRadius: 10,
                    spacing: 2,
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '80%',
                responsive: true,
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

        if (!canvas) {
            return;
        }

        const config: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
                labels: this.graphTrendency.map((d: any) => d.date),
                datasets: [
                    {
                        label: 'Correctos',
                        data: this.graphTrendency.map((d: any) => d.correct),
                        backgroundColor: '#111827',
                        borderRadius: 4,
                        barThickness: 20
                    },
                    {
                        label: 'Novedades',
                        data: this.graphTrendency.map((d: any) => d.news),
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
                        max: Math.max(...this.graphTrendency.map((d: any) => d.correct + d.news))
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
