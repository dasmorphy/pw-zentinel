import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import dataControlFormsJson  from '../../utils/controlsForms.json';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    private readonly messageService = inject(MessageService)


    firstControlForms: string;

    validateControlsForms(form: FormGroup, controlsIgnore: any) {
        Object.keys(form.controls).forEach((key) => {
            const control = form.get(key);
            if (control && !controlsIgnore.includes(key)) {
                if ((Array.isArray(control.value) && control.value.length === 0) || control.value === null || control.value === undefined || control.value === ''
                    || control.value === false) {
                    if (!this.firstControlForms) {
                        this.firstControlForms = key;
                    }
                    control.setErrors({ campoVacio: true });
                } else {
                    this.deleteErrorControl(control, 'campoVacio');
                }
            }
        });
    }


    deleteErrorControl(control_name: any, name_error: string) {
        if (control_name?.hasError(name_error)) {
            control_name?.setErrors(null)
        }
    }

    showControlVoiled() {
        const controles: any = dataControlFormsJson
        if (controles.hasOwnProperty(this.firstControlForms)) {
            const controlFound = controles[this.firstControlForms];

            if (this.firstControlForms && this.firstControlForms !== '') {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `El campo ${controlFound} es requerido`,
                });
            }
        }

        this.firstControlForms = '';
    }

    onSuccess(message: string, time: number = 5000) {
        this.messageService.add({
            life: time,
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });
    }

    onWarn(message: string, time: number = 5000) {
        this.messageService.add({
            life: time,
            severity: 'warn',
            summary: 'Aviso',
            detail: message
        });
    }

    onError(message: string, time: number = 5000) {
        this.messageService.add({
            life: time,
            severity: 'error',
            summary: 'Error',
            detail: message
        });
    }
}


