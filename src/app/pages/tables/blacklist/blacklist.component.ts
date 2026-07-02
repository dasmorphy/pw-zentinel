import { CommonModule } from '@angular/common';
import { Component, computed, inject, ViewChild } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { PurchaseOrderService } from 'src/app/services/puchase-order.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { v4 as uuidv4} from 'uuid';
import { UserService } from 'src/app/services/user.service';


interface MotivoOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-blacklist',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        AvatarModule,
        InputTextModule,
        DropdownModule,
        InputNumberModule,
        FormsModule,
        ReactiveFormsModule,
        ToastModule,
        ProgressSpinnerModule,
        DialogModule,
        FileUploadModule,
        TableModule,
        CardModule,
        TooltipModule,
        SplitButtonModule
    ],
    templateUrl: './blacklist.component.html',
    styleUrls: ['./blacklist.component.sass'],
})
export class BlacklistComponent {
    private readonly purcharOrderService = inject(PurchaseOrderService);
    private readonly utilsService = inject(UtilsService);
    private readonly userService = inject(UserService);
    
    imagePreview: string | null = null;
    selectedFile: File | null = null;

    dataBlacklist = [];
    dataReasonRestriction = [];
    selectedData: any = {};

    isLoading: boolean = true;
    showConfirmDelete: boolean = false;

    blacklistForm: FormGroup;
    

    // Datos del formulario
    nombreCompleto = '';
    cedula = '';
    motivoSeleccionado: string | null = null;
    observaciones = '';

    user_json: any;

    items: any = [
        {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            command: () => this.showConfirmDelete = true
        },
    ]

    // Opciones de motivos
    motivosOptions: MotivoOption[] = [
        { label: 'Intento de Robo', value: 'intento_robo' },
        { label: 'Falsificación', value: 'falsificacion' },
        { label: 'Comportamiento Agresivo', value: 'comportamiento_agresivo' },
        { label: 'Fraude', value: 'fraude' },
        { label: 'Incumplimiento de Pago', value: 'incumplimiento_pago' }
    ];

    constructor(private fb: FormBuilder){
        this.blacklistForm = this.fb.group({
            full_names: ['', Validators.required],
            dni: ['', Validators.required],
            observations: [''],
            reason_restriction: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.user_json = this.userService.getDataSession();
        this.fetchBlacklist();
        this.fetchReasonRestriction();
    }

    fetchBlacklist() {
        this.purcharOrderService.getBlacklist().subscribe({
            next: (data: any) => {
                this.dataBlacklist = data?.data;
            },
            error: (error: any) => {
                console.log(error)
                this.utilsService.onError(error?.error?.message ?? 'Error al obtener la lista negra de conductores');
            }
        })
    }

    fetchReasonRestriction() {
        this.purcharOrderService.getReasonRestriction().subscribe({
            next: (data: any) => {
                this.dataReasonRestriction = data?.data;
            },
            error: (error: any) => {
                console.log(error)
                this.utilsService.onError(error?.error?.message ?? 'Error al obtener la lista negra de conductores');
            }
        })
    }

    /**
     * Limpia el formulario
     */
    clearForm() {
        this.blacklistForm.reset();
        this.selectedFile = null;
    }

    optionsData(data: any) {
        this.selectedData = data
    }


    deleteBlacklist() {
        this.isLoading = true;
        this.showConfirmDelete = false;

        this.purcharOrderService.deleteBlacklist(this.selectedData?.id_blacklist).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.utilsService.onSuccess(data?.data?.message ?? 'Registro eliminado correctamente');
                this.fetchBlacklist();
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
                this.utilsService.onError(error?.error?.message ?? 'No se pudo eliminar el registro');
            }
        })
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files?.length) {
            return;
        }

        this.selectedFile = input.files[0];

        const reader = new FileReader();

        reader.onload = () => {
            this.imagePreview = reader.result as string;
        };

        reader.readAsDataURL(this.selectedFile);
    }


    saveBlacklist() {
        if (this.blacklistForm.get('dni')?.value?.length < 10) {
            this.utilsService.onWarn("La cédula debe ser de 10 dígitos");
            return;
        }

        this.utilsService.validateControlsForms(this.blacklistForm, ["observations"]);
        this.utilsService.showControlVoiled();
        
        if (!this.blacklistForm.valid) {
            return;
        }
        
        this.isLoading = true;
        
        const data_save = {
            ...this.blacklistForm.value,
            user: this.user_json?.user,
            channel: 'ZENTINEL_WEB',
            external_transaction_id: uuidv4()
        };

        const formData = new FormData();

        formData.append(
            'data',
            new Blob([JSON.stringify(data_save)], { type: 'application/json' })
        );


        if (this.selectedFile) {
            formData.append('images', this.selectedFile, this.selectedFile.name);
        }

        console.log(formData)
        
        this.purcharOrderService.saveBlacklist(formData).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Registro guardada';
                this.utilsService.onSuccess(message);
                this.blacklistForm.reset();
                this.selectedFile = null;
                this.fetchBlacklist();
            },
            error: (error: any) => {
                console.error('Error:', error);
                this.isLoading = false;
                const error_message = error?.error?.message ??
                    'Error al guardar, por favor intente nuevamente';
                this.utilsService.onError(error_message);
            }
        });
        
        
    }
}