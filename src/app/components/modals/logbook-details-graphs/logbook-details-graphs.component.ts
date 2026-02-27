import { Component, computed, effect, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
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
import { TieredMenuModule } from 'primeng/tieredmenu';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
    selector: 'app-logbook-details-graphs',
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
    ],
    templateUrl: './logbook-details-graphs.component.html',
    styleUrls: ['./logbook-details-graphs.component.sass']
})
export class LogbookDetailsGraphsComponent {
    @Input() filtersLogbook: any = null;
    @Output() close = new EventEmitter<boolean>();
    
    public readonly dashboardService = inject(DashboardService);
    public readonly userService = inject(UserService);
    public readonly logbookService = inject(LogbookService);
    public readonly utilsService = inject(UtilsService);

    logbookSelected = computed(() => this.logbookService.showModalSummary());

    showModal: boolean = false;
    selectedLogbook: any = null;
    isLoading: boolean = true;
    dataLogbooks: any[] = []

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
        this.fetchHistoryLogbook();
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

    fetchHistoryLogbook() {
        this.isLoading = true;
        this.user_session = this.userService.getUserStorage();

        this.logbookService.getHistoryLogbook(this.filtersLogbook).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataLogbooks = data?.data;
                this.showModal = true;

            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }

    closeModal() {
        this.close.emit(false);
    }

}
