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

    // Data para gráficos
    totalDispatches: number = 1284.4;
    warehouseOccupancy: number = 45302;
    newsInReception: number = 18;

    graphWarehouseStatus: any = [];
    graphNewsData: any = [];

    ngOnInit() {
        this.user_session = this.userService.getDataSession();
        // this.dispatchService.getGraphs().subscribe({
        //     next: (data: any) => {
        //         const dataGraph = data?.data;
        //         this.graphEntryStatus = dataGraph?.entry_biomar?.entry_by_status
        //         this.graphCountTypeAccess = dataGraph?.entry_biomar?.count_type_access
        //         this.graphTopMaterials = dataGraph?.entry_biomar?.top_materials

        //         this.createDoughnutChart(
        //             this.graphCountTypeAccess?.[0]?.percentage,
        //             this.graphCountTypeAccess?.[1]?.percentage,
        //         );
        //     },
        //     error: ({ error }: any) => this.utilsService.onError(error.message)
        // })
        this.loadData();
    }

    ngOnDestroy() {
        if (this.barChart) {
            this.barChart.destroy();
        }
    }

    loadData() {
        // Emular datos del backend
        this.graphWarehouseStatus = [
            { name: 'Bodega Principal', dispatches: 45, capacity: 122 },
            { name: 'Bodega Norte', dispatches: 29, capacity: 75 },
            { name: 'Bodega Logística 2', dispatches: 12, capacity: 48 },
            { name: 'Cámara de Frío', dispatches: 34, capacity: 42 }
        ];

        this.graphNewsData = [
            { date: 'LUN', correct: 45, news: 5 },
            { date: 'MAR', correct: 32, news: 8 },
            { date: 'MIE', correct: 22, news: 6 },
            { date: 'JUE', correct: 49, news: 4 },
            { date: 'VIE', correct: 60, news: 2 },
            { date: 'SÁB', correct: 35, news: 9 },
            { date: 'DOM', correct: 49, news: 7 }
        ];

        // Crear gráfico de barras
        this.createBarChart();
    }

    createBarChart() {
        const canvas = document.getElementById('newsBarChart') as HTMLCanvasElement;
        
        if (!canvas) {
            return;
        }

        const config: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
                labels: this.graphNewsData.map((d: any) => d.date),
                datasets: [
                    {
                        label: 'Correctos',
                        data: this.graphNewsData.map((d: any) => d.correct),
                        backgroundColor: '#111827',
                        borderRadius: 4,
                        barThickness: 20
                    },
                    {
                        label: 'Novedades',
                        data: this.graphNewsData.map((d: any) => d.news),
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
                        max: Math.max(...this.graphNewsData.map((d: any) => d.correct + d.news))
                    }
                }
            }
        };

        if (this.barChart) {
            this.barChart.destroy();
        }

        this.barChart = new Chart(canvas, config);
    }

    getWarehousePercentage(dispatches: number, capacity: number): number {
        return (dispatches / capacity * 100);
    }
}
