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
import { v4 as uuidv4} from 'uuid';
import { DispatchService } from 'src/app/services/dispatch.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-new-entry',
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
    templateUrl: './new-entry-form.component.html',
    styleUrls: ['./new-entry-form.component.sass'],
})
export class NewEntryFormComponent {
    @ViewChild('fileUpload') fileUpload!: FileUpload;

    private logbookService = new LogbookService();
    private utilsService = new UtilsService();
    private readonly dispatchService = inject(DispatchService);
    public readonly userService = inject(UserService);

    categories = computed(() => this.logbookService.categories());
    unitiesWeight = computed(() => this.logbookService.unitiesWeight());
    authorized = computed(() => this.logbookService.authorized());
    destinyIntern = computed(() => this.logbookService.destinyIntern());

    areasVisit = computed(() => this.dispatchService.areasVisit());
    staffCharge = computed(() => this.dispatchService.staffCharge());
    materials = computed(() => this.dispatchService.materials());


    entryForm: FormGroup;

    images: File[] = [];
    imagesError: string | null = null;

    isLoading: boolean = false;
    showConfirmSave: boolean = false;
    messageEmpty: string = "No hay opciones disponibles";
    optionGroupBusiness= []
    user_json: any;

    categoryOptions = []

    constructor(private fb: FormBuilder,) {
        this.entryForm = this.fb.group({
            area_visit: ['', Validators.required],
            names_visit: ['', Validators.required],
            dni: ['', Validators.required],
            person_charge: ['', Validators.required],
            reason_visit: ['', Validators.required],
            material_entry: this.fb.array([
                this.createMaterial()
            ]),
            observations: [''],

        });
    }

    ngOnInit() {
        this.user_json = this.userService.getDataSession();
        this.dispatchService.getAllAreas();
        this.dispatchService.getStaffCharge();
        this.dispatchService.getMaterials();
    }

    createMaterial(): FormGroup {
        return this.fb.group({
            id_material: ['', Validators.required],
            quantity: [1, Validators.required]
        });
    }

    get materialsEntry(): FormArray {
        return this.entryForm.get('material_entry') as FormArray;
    }

    addMaterial() {
        if (this.materialsEntry.length < this.materials().length) {
            this.materialsEntry.push(this.createMaterial());
        }

    }

    removeMaterial(index: number) {
        if (this.materialsEntry.length > 1) {
            this.materialsEntry.removeAt(index);
        }else{
            this.utilsService.onWarn('Es obligatorio tener al menos 1 material')
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
        const controls_ignore = ['observations'];

        this.utilsService.validateControlsForms(this.entryForm, controls_ignore);
        this.utilsService.validateControlsForms(this.createMaterial(), []);
        this.utilsService.showControlVoiled();

        if (this.images.length < 5) {
            this.imagesError = 'Debes subir mínimo 5 imágenes';
            this.isLoading = false;
            return;
        }

        if (this.entryForm.valid) {
            this.showConfirmSave = true;
        }
    }

    saveEntry() {
        this.isLoading = true;
        this.showConfirmSave = false;
 
        const data_save = {
            ...this.entryForm.value,
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

        this.dispatchService.saveEntryAccess(formData).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Ingreso guardado'
                this.utilsService.onSuccess(message)
                this.entryForm.reset();
                this.createMaterial().reset();
                this.fileUpload.clear();
                this.images = [];
                this.imagesError = '';
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al guardar el ingreso, por favor intente nuevamente'
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
    //     this.entryForm.get('id_unity')?.setValue(id_unity);
    // }    

}
