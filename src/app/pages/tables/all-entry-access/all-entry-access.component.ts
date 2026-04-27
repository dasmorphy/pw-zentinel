import { Component, computed, effect, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
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
import { DispatchDetailsModalComponent } from 'src/app/components/modals/dispatch-details-modal/dispatch-details-modal.component';
import { Dispatch } from 'src/app/models/dispatch';
import { EntryAccess } from 'src/app/models/entry-access';
import { EntryDetailsModalComponent } from 'src/app/components/modals/entry-details-modal/entry-details-modal.component';
import { FileUploadModule } from 'primeng/fileupload';
import { v4 as uuidv4} from 'uuid';

@Component({
    selector: 'app-entry-access-table',
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
        EntryDetailsModalComponent
    ],
    templateUrl: './all-entry-access.component.html',
    styleUrls: ['./all-entry-access.component.sass']
})
export class AllEntryAccessComponent {


    public readonly dispatchService = inject(DispatchService);
    public readonly utilsService = inject(UtilsService);
    public readonly userService = inject(UserService);

    entrySelected = computed(() => this.dispatchService.showModalSummaryEntry());

    dataEntries: EntryAccess[] = [];
    isLoading: boolean = false;
    showUpdate: boolean = false;
    observationOut: string = '';
    selectedEntry: EntryAccess | null = null;

    images: File[] = [];
    imagesError: string | null = null;
    user_json: any;

    items: any = [
        {
            label: 'Ver detalles',
            icon: 'pi pi-eye',
            command: () => this.viewDispatchDetails(this.selectedEntry!)
        },
        {
            label: 'Crear salida',
            icon: 'pi pi-play-circle',
            visible: () => this.selectedEntry?.status === 'Pendiente Salida',
            command: () => this.showUpdate = true
        },
    ];

    ngOnInit() {
        this.user_json = this.userService.getDataSession();
        this.fetchAllEntries();
    }

    fetchAllEntries() {
        this.isLoading = true;
        this.dispatchService.getAllEntryAccess().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataEntries = data?.data;
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }

    reloadDataDispatch() {
        this.fetchAllEntries();
    }

    optionsDispatch(entry: any) {
        this.selectedEntry = entry
    }

    getSeverity(status: string) {
        switch (status) {
        case "Finalizado":
            return 'success';
        case "Pendiente Salida":
            return 'warning';
        default:
            return 'info';
        }
    }

    viewDispatchDetails(entry: EntryAccess) {
        const entry_found = this.dataEntries.find(
            item => item.id_access_control === entry.id_access_control
        );
        
        if (entry_found) {
            this.dispatchService.openSummaryEntry(entry_found);
        } 
    }

    closeModal() {
        this.showUpdate = false;
        this.observationOut = '';
        this.images = [];
    }

    onSelectImages(event: any) {
        const selectedFiles: File[] = event.files;

        // 🔄 acumular imágenes
        this.images = [...this.images, ...selectedFiles];

        if (this.images.length < 5) {
            this.imagesError = 'Debe subir al menos 5 imágenes';
            return;
        }

        if (this.images.length > 10) {
            this.imagesError = 'No puede subir más de 10 imágenes';
            this.images = this.images.slice(0, 10); // 👈 recorta exceso
            return;
        }

        this.imagesError = null;
    }

    onRemoveImages(event: any) {
        const removedFile = event.file;

        const index = this.images.findIndex(
            file => file.name === removedFile.name &&
            file.size === removedFile.size &&
            file.lastModified === removedFile.lastModified
        );

        if (index !== -1) {
            this.images.splice(index, 1);
        }
    }

    onSaveOut() {
        this.isLoading = true;
        if (this.images.length < 5) {
            this.imagesError = 'Debes subir mínimo 5 imágenes';
            this.isLoading = false;
            return;
        }

        const data_save = {
            observations: this.observationOut,
            user: this.user_json?.user,
            channel: 'ZENTINEL_WEB',
            external_transaction_id: uuidv4()
        };

        const formData = new FormData();

        formData.append(
            'entry_data',
            new Blob([JSON.stringify(data_save)], { type: 'application/json' })
        );

        this.images.forEach((file: File) => {
            formData.append('images', file);
        });

        this.showUpdate = false;
        this.dispatchService.patchEntryAccess(
            formData,
            this.selectedEntry!.id_access_control
        ).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Salida creada correctamente'
                this.utilsService.onSuccess(message)
                this.observationOut = '';
                this.images = [];
                this.imagesError = '';
                this.fetchAllEntries();
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al crear la salida, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }
}