import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "src/app/components/header/header.component";
import { MenuService } from 'src/app/services/menu.service';
import { MenuComponent } from "src/app/components/menu/menu.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DoughnutComponent } from 'src/app/components/graphs/doughnut/doughnut.component';
import { LogbookService } from 'src/app/services/logbook.service';
import { UserService } from 'src/app/services/user.service';
import { DialogModule } from 'primeng/dialog';
import { LogbookRecentComponent } from 'src/app/components/logbook/logbook-recent/logbook-recent.component';
import { DispatchService } from 'src/app/services/dispatch.service';
import { BiomarDashboardComponent } from 'src/app/components/dashboards/biomar-dasboard/biomar-dashboard.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-dashboard',
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
        DoughnutComponent,
        DialogModule,
        LogbookRecentComponent,
        BiomarDashboardComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent {
    private readonly menuService = inject(MenuService);
    private readonly authService = inject(AuthService);

    toggle = computed(() => this.menuService.toggle());

    user_permissions_signal = computed(() => this.authService.user_permissions_signal());

    user_session: any;
    isLoading: boolean = false;
    optionsDashboard = ["Expalsa", "Biomar"];
    optionDashboardSelected = "Expalsa";


    ngOnInit() {
        const user_session = localStorage.getItem('sb_token')
        const user_json = user_session ? JSON.parse(user_session) : null;
        this.user_session = user_json;
    }
    
    onChangeDahboard(option: string) {
        this.optionDashboardSelected = option
    }

}