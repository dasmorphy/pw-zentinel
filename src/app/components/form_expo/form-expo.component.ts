import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MenuService } from 'src/app/services/menu.service';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserService } from 'src/app/services/user.service';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-form-expo',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    DialogModule,
    OverlayPanelModule,
    MultiSelectModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    RadioButtonModule
  ],
  templateUrl: './form-expo.component.html',
  styleUrls: ['./form-expo.component.sass'],
})
export class FormExpoComponent {

  private utilsService = new UtilsService();
  private dashboardService = new DashboardService();
  isAssisting: boolean = false;
  otherIndustry: any = '';
  registrationForm: FormGroup;

  typeIndustry: string[] = [
    "Ninguna", 
    "Camaronera", 
    "Industrial", 
    "Bananera", 
    "Minera", 
    "Urbanizaciones / Inmobiliario", 
    "Seguridad", 
    "Otro"
  ];

  constructor(private fb: FormBuilder,) {
    this.registrationForm = this.fb.group({
      names: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")]],
      business: ['', Validators.required],
      position: ['', Validators.required],
      type_industry: ['', Validators.required],
      is_assist: [null, Validators.required],
    });
  }


  onSubmit() {
    if (this.registrationForm.valid) {
      let formValue = { ...this.registrationForm.value };

      if (formValue.type_industry === 'Otro' && !this.otherIndustry) {
        this.utilsService.onWarn("Por favor, ingrese el nombre de la industria.");
        return;
      }

      if (formValue.type_industry === 'Otro') {
        formValue.type_industry = this.otherIndustry;
      }

      this.dashboardService.postFormExpo(formValue).subscribe({
        next: (response) => {
          this.utilsService.onSuccess("Formulario enviado exitosamente.");  
          this.registrationForm.reset();
          this.otherIndustry = null;
        },
        error: (error) => {
          console.log(error);
          this.utilsService.onError("Error al enviar el formulario. Por favor, inténtelo de nuevo.");
        }
      });


    } else {
      this.utilsService.onWarn("Por favor, complete todos los campos requeridos.");
    }
  }
    
}