import { Component, computed, effect, ElementRef, inject, ViewChild } from '@angular/core';
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

@Component({
    selector: 'app-sales-table',
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
    templateUrl: './all-logbooks.component.html',
    styleUrls: ['./all-logbooks.component.sass']
})
export class AllLogbookComponent {
    public readonly dashboardService = inject(DashboardService)
    public readonly userService = inject(UserService)
    public readonly logbookService = inject(LogbookService)


    dataLogbooks: any = [];
    isLoading: boolean = true;

    user_session: any



    breadCrumbItems: MenuItem[] = [
        { label: 'ventas', routerLink: ['/ventas'] },
    ];


    ngOnInit() {
        this.fetchHistoryLogbook();
    }

    fetchHistoryLogbook() {
        this.isLoading = true;
        const headers: any = {}
        const user_session = localStorage.getItem('sb_token')
        const user_json = user_session ? JSON.parse(user_session) : null;
        this.user_session = user_json;

        if (user_json?.role !== 'admin') {
            headers['user'] = user_json?.user
        }

        this.logbookService.getHistoryLogbook(headers).subscribe({
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

    applyFilter() {

    }

    clearFilter() {

    }

}
