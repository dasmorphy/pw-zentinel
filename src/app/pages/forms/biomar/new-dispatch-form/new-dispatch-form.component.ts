import { CommonModule } from '@angular/common';
import { Component, computed, inject, ViewChild } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { v4 as uuidv4 } from 'uuid';
import { DashboardService } from 'src/app/services/dashboard.service';
import { Router } from '@angular/router';
import { DispatchService } from 'src/app/services/dispatch.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-logbook-out',
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
        FileUploadModule
    ],
    templateUrl: './new-dispatch-form.component.html',
    styleUrls: ['./new-dispatch-form.component.sass'],
})
export class NewDispatchForm {
    @ViewChild('fileUpload') fileUpload!: FileUpload;

    private readonly dispatchService = inject(DispatchService);
    private readonly logbookService = inject(LogbookService);
    private readonly utilsService = inject(UtilsService);
    public readonly userService = inject(UserService);


    productsSku = computed(() => this.dispatchService.productsSku());
    destinyIntern = computed(() => this.logbookService.destinyIntern());
    vehiclesTypes = computed(() => this.dispatchService.vehiclesTypes());

    dispatchForm: FormGroup;

    user_json: any;
    isLoading: boolean = false;
    showConfirmSave: boolean = false;
    messageEmpty: string = "No hay opciones disponibles";

    images: File[] = [];
    imagesError: string | null = null;

    constructor(private fb: FormBuilder,) {
        this.dispatchForm = this.fb.group({
            destiny: ['', Validators.required],
            driver: ['', Validators.required],
            observations: [''],
            order_number: ['', Validators.required],
            truck_license: ['', Validators.required],
            vehicle_type: ['', Validators.required],
            sku: this.fb.array([
                this.createSku()
            ])
        });
    }

    ngOnInit() {
        this.user_json = this.userService.getDataSession();

        let filters: any = {business: "2"};

        this.dispatchService.getProductsSku()
        this.logbookService.getAllDestinyIntern(filters);
        this.dispatchService.getVehiclesTypes()
    }

    createSku(): FormGroup {
        return this.fb.group({
            type_sku: ['Individual', Validators.required],
            products: this.fb.array([
                this.createProduct()
            ])
        });
    }

    createProduct(): FormGroup {
        return this.fb.group({
            id_product: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
    }

    get sku(): FormArray {
        return this.dispatchForm.get('sku') as FormArray;
    }

    products(index: number): FormArray {
        return this.sku.at(index).get('products') as FormArray;
    }

    addSku() {
        this.sku.push(this.createSku());
    }

    addProduct(skuIndex: number) {
        const skuGroup = this.sku.at(skuIndex) as FormGroup;
        const productsArray = skuGroup.get('products') as FormArray;

        // Agregar producto
        productsArray.push(this.createProduct());

        // Actualizar tipo según cantidad
        const type = productsArray.length > 1 ? 'Multiple' : 'Individual';

        skuGroup.get('type_sku')?.setValue(type);
    }

    removeProduct(skuIndex: number, productIndex: number) {
        const skuGroup = this.sku.at(skuIndex) as FormGroup;
        const productsArray = skuGroup.get('products') as FormArray;
        
        if (productsArray.length > 1) {
            this.products(skuIndex).removeAt(productIndex);
    
            const type = productsArray.length > 1 ? 'Multiple' : 'Individual';
            skuGroup.get('type_sku')?.setValue(type);
        }else{
            this.utilsService.onWarn('Es obligatorio tener al menos 1 producto por sku')
        }
    }

    removeSku(index: number) {
        if (this.sku.length > 1) {
            this.sku.removeAt(index);
        }else{
            this.utilsService.onWarn('Es obligatorio tener al menos 1 sku')
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

    onSubmit() {
        console.log(this.dispatchForm)
        const controls_ignore = ['weight', 'observations'];

        this.utilsService.validateControlsForms(this.dispatchForm, controls_ignore);
        this.utilsService.validateControlsForms(this.createSku(), []);
        this.utilsService.showControlVoiled();

        if (this.images.length < 5) {
            this.imagesError = 'Debes subir mínimo 5 imágenes';
            this.isLoading = false;
            return;
        }

        if (this.dispatchForm.valid) {
            this.showConfirmSave = true;
        }
    }

    saveDispatch() {
        this.isLoading = true;
        this.showConfirmSave = false;
 
        const data_save = {
            ...this.dispatchForm.value,
            user: this.user_json?.user,
            // weight: this.dispatchForm.get('weight')?.value,
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

        this.dispatchService.saveDispatch(formData).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Despacho guardado correctamente'
                this.utilsService.onSuccess(message)
                this.dispatchForm.reset();
                this.createSku().reset();
                this.createProduct().reset();
                this.fileUpload.clear();
                this.images = [];
                this.imagesError = '';
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al guardar despacho, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }

}