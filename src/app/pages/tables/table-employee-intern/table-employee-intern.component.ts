import { Component, computed, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { TimelineModule } from 'primeng/timeline';
import { SplitButtonModule } from 'primeng/splitbutton';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { UserService } from 'src/app/services/user.service';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DispatchService } from 'src/app/services/dispatch.service';
import { DispatchDetailsModalComponent } from 'src/app/components/modals/dispatch-details-modal/dispatch-details-modal.component';
import { Dispatch } from 'src/app/models/dispatch';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { v4 as uuidv4} from 'uuid';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ImageGalleryComponent } from 'src/app/components/modals/shared/preview-image/preview-image.component';

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
        OverlayPanelModule,
        FileUploadModule,
        InputSwitchModule,
        InputNumberModule,
    ],
    templateUrl: './table-employee-intern.component.html',
    styleUrls: ['./table-employee-intern.component.sass']
})
export class TableEmployeeInternComponent {
    private readonly logbookService = inject(LogbookService);

    dataLeads: any[] = [];
    isLoading: boolean = false;


    constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.fetchLeads();

    }


    fetchLeads() {
        this.isLoading = true;

        this.logbookService.getLeads().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataLeads = data?.data;
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }

    reloadDataDispatch() {
        this.fetchLeads();
    }

}