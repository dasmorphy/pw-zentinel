import { Component, computed, effect, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuItem, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { TimelineModule } from 'primeng/timeline';
import { SplitButtonModule } from 'primeng/splitbutton';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { DashboardService } from 'src/app/services/dashboard.service';
import { UserService } from 'src/app/services/user.service';
import { validate } from 'uuid';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';
import { LogBookDetailsModalComponent } from 'src/app/components/modals/logbook-details-modal/logbook-details-modal.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
    selector: 'app-logbooks-table',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        FormsModule,
        ButtonModule,
        ProgressSpinnerModule,
        ToastModule,
        DropdownModule,
        TableModule,
        InputTextModule,
        ReactiveFormsModule,
        TagModule,
        CalendarModule,
        MultiSelectModule,
        TimelineModule,
        SplitButtonModule,
        NgxTippyModule,
        TieredMenuModule,
        LogBookDetailsModalComponent,
        OverlayPanelModule
    ],
    templateUrl: './all-logbooks.component.html',
    styleUrls: ['./all-logbooks.component.sass']
})
export class AllLogbookComponent {
    @Input() dataModal: any = null;
    
    public readonly dashboardService = inject(DashboardService);
    public readonly userService = inject(UserService);
    public readonly logbookService = inject(LogbookService);
    public readonly utilsService = inject(UtilsService);

    logbookSelected = computed(() => this.logbookService.showModalSummary());


    dataLogbooks: any = [];
    selectedLogbook: any = null;
    isLoading: boolean = true;

    optionSector: any = [];
    optionGroupBusiness: any = [];
    selectedGroupBusiness: number[] = [];
    selectedSector: number[] = [];
    selectedTime: string[] = ['Diurna', 'Nocturna'];
    filters: any = {};
    dateRange: Date[] | null = null;


    optionFilterCategory = [
        { value: 'all', label: 'Todos' },
        { value: 'entrada', label: 'Entrada' },
        { value: 'salida', label: 'Salida' }
    ]

    optionTime= [ 'Diurna', 'Nocturna']

    user_session: any



    breadCrumbItems: MenuItem[] = [
        { label: 'ventas', routerLink: ['/ventas'] },
    ];

    items: any = [
        {
            label: 'Ver detalles',
            icon: 'pi pi-eye',
            command: () => this.viewLogbookDetails(this.selectedLogbook)
        },
    ];


    ngOnInit() {
        if (!this.dataModal) {
            console.log('sin data de entrada')
            this.fetchHistoryLogbook();
        }else {
            console.log('data de entrada')
            this.dataLogbooks = this.dataModal
        }

        this.fetchGroupBusinessByBusiness();
        this.fetchSectorByBusiness();
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

    fetchHistoryLogbook(filters = this.filters) {
        this.isLoading = true;
        this.user_session = this.userService.getUserStorage();



        if (this.user_session?.role !== 'admin') {
            filters.user = this.user_session?.user
        }

        this.logbookService.getHistoryLogbook(filters).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataLogbooks = data?.data;
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }

    reloadHistoryLogbook() {
        this.fetchHistoryLogbook();
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

    applyFilter(imagePanel: any) {
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

        this.filters = filter_date;
        console.log(this.filters)
        this.fetchHistoryLogbook();
    }

    clearFilter() {

    }

    onFilterChange(event: any) {
        console.log(event)
    }

    optionsLogbook(loogbook: any) {
        this.selectedLogbook = loogbook
    }

    viewLogbookDetails(log: any) {
        let log_found;

        if (log?.id_logbook_entry) {
            log_found = this.dataLogbooks.find(
                (item: any) => item.id_logbook_entry === log.id_logbook_entry
            );
        } else {
            log_found = this.dataLogbooks.find(
                (item: any) => item.id_logbook_out === log.id_logbook_out
            );
        }

        this.logbookService.openSummary(log_found);
    }
}
