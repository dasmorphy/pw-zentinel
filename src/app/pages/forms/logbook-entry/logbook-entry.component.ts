import { CommonModule } from '@angular/common';
import { Component, computed, ViewChild } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "src/app/components/header/header.component";
import { MenuService } from 'src/app/services/menu.service';
import { MenuComponent } from "src/app/components/menu/menu.component";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DialogModule } from 'primeng/dialog';
import { UserService } from 'src/app/services/user.service';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { v4 as uuidv4} from 'uuid';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
    selector: 'app-logbook-entry',
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
    templateUrl: './logbook-entry.component.html',
    styleUrls: ['./logbook-entry.component.sass'],
})
export class LogbookEntryComponent {
    @ViewChild('fileUpload') fileUpload!: FileUpload;

    private logbookService = new LogbookService();
    private utilsService = new UtilsService();
    private dashboardService = new DashboardService();

    categories = computed(() => this.logbookService.categories());
    unitiesWeight = computed(() => this.logbookService.unitiesWeight());

    logbookForm: FormGroup;

    images: File[] = [];
    imagesError: string | null = null;

    isLoading: boolean = false;
    showConfirmSave: boolean = false;
    messageEmpty: string = "No hay opciones disponibles";
    optionWorkDay= [ 'Diurna', 'Nocturna']
    optionGroupBusiness= []
    user_json: any;

    categoryOptions = []

    constructor(private fb: FormBuilder,) {
        this.logbookForm = this.fb.group({
            truck_license: ['', Validators.required],
            name_driver: ['', Validators.required],
            workday: ['', Validators.required],
            id_group_business: ['', Validators.required],
            id_category: ['', Validators.required],
            id_unity: ['', Validators.required],
            shipping_guide: ['', Validators.required],
            quantity: [0, Validators.required],
            description: ['', Validators.required],
            weight: [null],
            provider: ['', Validators.required],
            destiny_intern: ['', Validators.required],
            authorized_by: ['', Validators.required],
            observations: [''],
        });
    }

    ngOnInit() {
        const user_session = localStorage.getItem('sb_token')
        this.user_json = user_session ? JSON.parse(user_session) : null;

        if (this.user_json?.attributes['group_business']) {
            this.logbookForm.get('id_group_business')?.setValue(this.user_json?.attributes['group_business']);
        }

        this.logbookService.getAllCategories();
        this.logbookService.getAllUnitiesWeight();
        this.fetchGroupBusinessByBusiness();
    }

    fetchGroupBusinessByBusiness() {
        const id_business = this.user_json?.attributes?.id_business
        this.dashboardService.getGroupBusinessByBusiness(id_business).subscribe({
        next: (resp: any) => {
            this.optionGroupBusiness = resp?.data
        },
        error: (err) => console.error(err)
        });
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
        this.utilsService.validateControlsForms(this.logbookForm, ['weight', 'observations']);
        this.utilsService.showControlVoiled();

        if (this.images.length < 5) {
            this.imagesError = 'Debes subir mínimo 5 imágenes';
            this.isLoading = false;
            return;
        }

        if (this.logbookForm.valid) {
            this.showConfirmSave = true;
        }
    }

    saveLogbook() {
        this.isLoading = true;
        this.showConfirmSave = false;
 
        const data_save = {
            ...this.logbookForm.value,
            created_by: this.user_json?.user,
            name_user: this.user_json?.attributes?.fullname,
            weight: this.logbookForm.get('weight')?.value ?? 0,
            channel: 'ZENTINEL_WEB',
            external_transaction_id: uuidv4()
        };

        const formData = new FormData();

        formData.append(
            'logbook_entry',
            new Blob([JSON.stringify(data_save)], { type: 'application/json' })
        );

        this.images.forEach((file: File) => {
            formData.append('images', file);
        });

        this.logbookService.saveLogbookEntry(formData).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Bitácora guardada'
                this.utilsService.onSuccess(message)
                this.logbookForm.reset();
                this.fileUpload.clear();
                this.images = [];
                this.imagesError = '';
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al guardar la bitacora de entrada, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }

    // setUnityByCategory(name_category: string) {
    //     let id_unity = 1;

    //     switch (name_category) {
    //         case 'Suministros':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
    //             break;
    //         case 'Repuestos':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
    //             break;
    //         case 'Balanceado':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'SACOS')?.id_unity;
    //             break;
    //         case 'Larvas':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
    //             break;
    //         case 'Maquinaria':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
    //             break;
    //         case 'Combustibles /lubricantes':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'GALONES')?.id_unity;
    //             break;
    //         case 'Otros':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'BINES')?.id_unity;
    //             break;
    //         case 'Camarón':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'LIBRAS')?.id_unity;
    //             break;
    //         case 'Tilapia':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'LIBRAS')?.id_unity;
    //             break;
    //         case 'Insumos':
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
    //             break;
    //         default:
    //             id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'LIBRAS')?.id_unity;
    //             break;
    //     }
    //     this.logbookForm.get('id_unity')?.setValue(id_unity);
    // }    

}
