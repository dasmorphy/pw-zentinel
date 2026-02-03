import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LogbookService } from 'src/app/services/logbook.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DialogModule } from 'primeng/dialog';
import { UserService } from 'src/app/services/user.service';
import { FileUploadModule } from 'primeng/fileupload';

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
    templateUrl: './logbook-out.component.html',
    styleUrls: ['./logbook-out.component.sass'],
})
export class LogbookOutComponent {
    private logbookService = new LogbookService();
    private utilsService = new UtilsService();
    private userService = new UserService();

    categories = computed(() => this.logbookService.categories());
    unitiesWeight = computed(() => this.logbookService.unitiesWeight());

    logbookForm: FormGroup;

    images: File[] = [];
    imagesError: string | null = null;


    isLoading: boolean = false;
    showConfirmSave: boolean = false;
    messageEmpty: string = "No hay opciones disponibles";
    optionWorkDay= [ 'Diurna', 'Nocturna']

    categoryOptions = []

    constructor(private fb: FormBuilder,) {
        this.logbookForm = this.fb.group({
            workday: ['', Validators.required],
            id_category: ['', Validators.required],
            id_unity: ['', Validators.required],
            shipping_guide: ['', Validators.required],
            quantity: ['', Validators.required],
            truck_license: ['', Validators.required],
            weight: [null],
            name_driver: ['', Validators.required],
            destiny: ['', Validators.required],
            person_withdraws: ['', Validators.required],
            authorized_by: ['', Validators.required],
            observations: [''],
        });
        this.logbookForm.get('id_unity')?.disable();
    }

    ngOnInit() {
        this.logbookService.getAllCategories();
        this.logbookService.getAllUnitiesWeight();
    }

    onChangeCategory() {
        const id_category = this.logbookForm.get('id_category')?.value;
        const object_category = this.categories()?.find((category: any) => category.id_category === id_category);

        if (object_category) {
            this.setUnityByCategory(object_category?.name_category);
        } else {
            this.utilsService.onWarn('No se encontrado la categoría seleccionada')
        }
    }

    onSubmit() {
        this.utilsService.validateControlsForms(this.logbookForm, ['weight', 'observations']);
        this.utilsService.showControlVoiled();

        if (this.logbookForm.valid) {
            this.showConfirmSave = true;
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


    saveLogbook() {
        this.isLoading = true;
        this.showConfirmSave = false;
        const user_session = localStorage.getItem('sb_token')
        const user_json = user_session ? JSON.parse(user_session) : null;

        const data_save = {
            ...this.logbookForm.value,
            id_group_business: user_json?.group_business,
            created_by: user_json?.user,
            name_user: user_json?.name,
            id_unity: this.logbookForm.get('id_unity')?.value,
            weight: this.logbookForm.get('weight')?.value ?? 0
        }

        this.logbookService.saveLogbookOut(data_save).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Bitácora guardada'
                this.utilsService.onSuccess(message)
                this.logbookForm.reset()
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al guardar la bitacora salida, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }

    setUnityByCategory(name_category: string) {
        let id_unity = 1;

        switch (name_category) {
            case 'Suministros':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
                break;
            case 'Repuestos':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
                break;
            case 'Balanceado':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'SACOS')?.id_unity;
                break;
            case 'Larvas':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
                break;
            case 'Maquinaria':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'UNIDAD')?.id_unity;
                break;
            case 'Combustibles /lubricantes':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'GALONES')?.id_unity;
                break;
            case 'Otros':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'BINES')?.id_unity;
                break;
            case 'Camarón':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'LIBRAS')?.id_unity;
                break;
            case 'Tilapia':
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'LIBRAS')?.id_unity;
                break;
            default:
                id_unity = this.unitiesWeight()?.find((unity: any) => unity.name === 'LIBRAS')?.id_unity;
                break;
        }
        this.logbookForm.get('id_unity')?.setValue(id_unity);
    }

}
