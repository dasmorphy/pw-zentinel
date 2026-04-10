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
import { AuthService } from 'src/app/services/auth.service';
import { DispatchService } from 'src/app/services/dispatch.service';

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
        OverlayPanelModule
    ],
    templateUrl: './all-dispatchs.component.html',
    styleUrls: ['./all-dispatchs.component.sass']
})
export class AllDispatchsComponent {


    public readonly dispatchService = inject(DispatchService);


    dataDispatchs: any = [];
    isLoading: boolean = false;

    selectedDispatch: any = null;

    items: any = [
        {
            label: 'Ver detalles',
            icon: 'pi pi-eye',
            // command: () => this.viewLogbookDetails(this.selectedDispatch)
        },
        {
            label: 'Continuar',
            icon: 'pi pi-play-circle',
            // visible: () => this.selectedDispatch?.status === 'Pendiente Salida',
            // command: () => this.routeOut()
        },
    ];

    ngOnInit() {
        this.fetchAllDispatchs();
    }

    fetchAllDispatchs() {
        this.isLoading = true;
        this.dispatchService.getAllDispatchs().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataDispatchs = data?.data;
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }
    
    reloadDataDispatch() {
        this.fetchAllDispatchs();
    }

    optionsDispatch(loogbook: any) {
        this.selectedDispatch = loogbook
    }

    getSeverity(status: string) {
        switch (status) {
        case "Ingresado en bodega":
            return 'success';
        case "En tránsito":
            return 'warning';
        case "Listo para despacho":
            return 'info';
        default:
            return 'info';
        }
    }
}