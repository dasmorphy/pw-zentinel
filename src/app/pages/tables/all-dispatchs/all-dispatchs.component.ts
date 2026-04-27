import { Component, computed, effect, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, AbstractControl } from '@angular/forms';
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
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { v4 as uuidv4} from 'uuid';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';

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
        DispatchDetailsModalComponent,
        FileUploadModule,
        InputSwitchModule,
        InputNumberModule
    ],
    templateUrl: './all-dispatchs.component.html',
    styleUrls: ['./all-dispatchs.component.sass']
})
export class AllDispatchsComponent {
    @ViewChild('fileUpload') fileUpload!: FileUpload;


    public readonly dispatchService = inject(DispatchService);
    public readonly utilsService = inject(UtilsService);
    public readonly userService = inject(UserService);

    dispatchSelected = computed(() => this.dispatchService.showModalSummary());
    statusDispatch = computed(() => this.dispatchService.statusDispatch());
    
    receptionForm: FormGroup;

    dataDispatchs: Dispatch[] = [];
    isLoading: boolean = false;
    showUpdate: boolean = false;
    showReception: boolean = false;
    selectedDispatch: Dispatch | null = null;

    images: File[] = [];
    imagesError: string | null = null;

    user_json: any;

    items: any = [
        {
            label: 'Ver detalles',
            icon: 'pi pi-eye',
            command: () => this.viewDispatchDetails(this.selectedDispatch!)
        },
        {
            label: 'Continuar Salida',
            icon: 'pi pi-play-circle',
            visible: () => this.selectedDispatch?.status === 'Listo para despacho',
            command: () => this.showUpdate = true
        },
        {
            label: 'Continuar Recepción',
            icon: 'pi pi-play-circle',
            visible: () => this.selectedDispatch?.status === 'En tránsito',
            command: () => this.setReception()
        },
    ];


    constructor(private fb: FormBuilder,) {
        this.receptionForm = this.fb.group({
            observations: [''],
            reception_details: this.fb.array([
                this.createProduct()
            ]),
        });
    }

    ngOnInit() {
        this.user_json = this.userService.getDataSession();
        this.fetchAllDispatchs();
        this.dispatchService.getStatusDispatch();
    }

    createProduct(product?: any): FormGroup {
        return this.fb.group({
            has_discrepancy: [true],
            expected_quantity: [product?.quantity, Validators.required],
            received_quantity: [null, Validators.required],
            observations: [''],
            product_id: [product?.id_product, Validators.required],
            product_sku_id: [product?.id_product_sku, Validators.required],
            product_name: [product?.name]
        });
    }

    createProductDiscrepancy(product: any): FormGroup {
        return this.fb.group({
            expected_quantity: [product?.expected_quantity, Validators.required],
            received_quantity: [product?.received_quantity, Validators.required],
            observations: [product?.observations],
            product_id: [product?.product_sku_id, Validators.required],
        });
    }

    get productsReception(): FormArray {
        return this.receptionForm.get('reception_details') as FormArray;
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

    getFormGroup(control: AbstractControl): FormGroup {
        console.log('dsadsa')
        return control as FormGroup;
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

    viewDispatchDetails(dispatch: Dispatch) {
        const dispatch_found = this.dataDispatchs.find(
            item => item.id_dispatch === dispatch.id_dispatch
        );
        
        if (dispatch_found) {
            this.dispatchService.openSummary(dispatch_found);
        } 
    }

    onUpdateDispatch() {
        this.isLoading = true;
        if (this.images.length < 5) {
            this.imagesError = 'Debes subir mínimo 5 imágenes';
            this.isLoading = false;
            return;
        }
        const status_id = this.statusDispatch()?.find((status: any) => status.name === 'En tránsito')?.id_status;

        const data_save = {
            status_id,
            user: this.user_json?.user,
            channel: 'ZENTINEL_WEB',
            external_transaction_id: uuidv4()
        };

        const formData = new FormData();

        formData.append(
            'dispatch_data',
            new Blob([JSON.stringify(data_save)], { type: 'application/json' })
        );

        this.images.forEach((file: File) => {
            formData.append('images', file);
        });

        this.showUpdate = false;
        this.dispatchService.patchDispatch(
            formData,
            this.selectedDispatch!.id_dispatch
        ).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Despacho actualizado correctamente'
                this.utilsService.onSuccess(message)
                this.images = [];
                this.imagesError = '';
                this.fetchAllDispatchs();
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al actualizar despacho, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }

    closeModal() {
        this.showUpdate = false;
        this.images = [];
    }

    setReception() {
        this.showReception = true;
        this.productsReception.clear();
        const allProducts = this.selectedDispatch!.skus.flatMap(sku => sku.products);

        allProducts.forEach(product => {
            this.productsReception.push(this.createProduct(product));
        });

    }

    onSaveReception() {
        if (this.images.length < 5) {
            this.utilsService.onError('Debe subir mínimo 5 imágenes')
            this.imagesError = 'Debe subir mínimo 5 imágenes';
            this.isLoading = false;
            return;
        }

        const has_discrepancy: any[] = this.productsReception?.value.filter((p: any) => p.has_discrepancy === false);
        const reception_details = has_discrepancy.length > 0 ? has_discrepancy.map((p: any) => ({
            expected_quantity: p.expected_quantity,
            observations: p.observations,
            product_sku_id: p.product_sku_id,
            received_quantity: p.received_quantity != null
            ? parseInt(p.received_quantity, 10)
            : null
        })) 
        : null;

        const controls_ignore = ['observations', 'has_discrepancy'];

        this.utilsService.validateControlsForms(this.receptionForm, controls_ignore);
        this.utilsService.showControlVoiled();

        const data = {
            dispatch_id: this.selectedDispatch?.id_dispatch,
            images: this.images,
            is_correct: has_discrepancy.length > 0 ? false : true,
            observations: this.receptionForm.get('observations')?.value,
            reception_details: reception_details 
        }

        if (has_discrepancy.length === 0) {
            this.fetchSaveReception(data);
        }else {
            for (const product of has_discrepancy) {
                const formProductDiscrepancy = this.createProductDiscrepancy(product);

                this.utilsService.validateControlsForms(formProductDiscrepancy, controls_ignore);
                this.utilsService.showControlVoiled();

                if (!formProductDiscrepancy.valid) {
                    return;
                }

            }

            this.fetchSaveReception(data);
        }

    }

    fetchSaveReception(dataReception: any) {
        this.isLoading = true;
        this.showReception = false;
 
        const data_save = {
            ...dataReception,
            user: this.user_json?.user,
            channel: 'ZENTINEL_WEB',
            external_transaction_id: uuidv4()
        };

        const formData = new FormData();

        formData.append(
            'reception_data',
            new Blob([JSON.stringify(data_save)], { type: 'application/json' })
        );

        this.images.forEach((file: File) => {
            formData.append('images', file);
        });

        this.dispatchService.saveReception(formData).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Recepción guardada correctamente'
                this.utilsService.onSuccess(message)
                this.receptionForm.reset();
                this.createProductDiscrepancy(null).reset();
                this.createProduct().reset();
                // this.fileUpload.clear();
                this.images = [];
                this.imagesError = '';
                this.fetchAllDispatchs();
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al guardar recepción, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }
}