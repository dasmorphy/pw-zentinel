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
    private readonly dispatchService = inject(DispatchService);
    private readonly logbookService = inject(LogbookService);


    productsSku = computed(() => this.dispatchService.productsSku());
    destinyIntern = computed(() => this.logbookService.destinyIntern());
    vehiclesTypes = computed(() => this.dispatchService.vehiclesTypes());

    dispatchForm: FormGroup;

    user_json: any;
    isLoading: boolean = false;
    messageEmpty: string = "No hay opciones disponibles";

    images: File[] = [];
    imagesError: string | null = null;

    constructor(private fb: FormBuilder,) {
        this.dispatchForm = this.fb.group({
            destiny: ['', Validators.required],
            driver: ['', Validators.required],
            observations: ['', Validators.required],
            order_number: ['', Validators.required],
            truck_license: ['', Validators.required],
            vehicle_type: ['', Validators.required],
            sku: this.fb.array([
                this.createSku()
            ])
        });
    }

    ngOnInit() {
        this.dispatchService.getProductsSku()
        this.logbookService.getAllDestinyIntern();
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
        this.products(skuIndex).push(this.createProduct());
    }

    removeProduct(skuIndex: number, productIndex: number) {
        this.products(skuIndex).removeAt(productIndex);
    }

    removeSku(index: number) {
        this.sku.removeAt(index);
    }


    onSubmit() {
        console.log(this.dispatchForm)
    }

}