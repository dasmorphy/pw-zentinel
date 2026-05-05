import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuService } from 'src/app/services/menu.service';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DoughnutComponent } from 'src/app/components/graphs/doughnut/doughnut.component';
import { UserService } from 'src/app/services/user.service';
import { DialogModule } from 'primeng/dialog';
import { LogbookRecentComponent } from 'src/app/components/logbook/logbook-recent/logbook-recent.component';
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
    private readonly userService = inject(UserService);

    toggle = computed(() => this.menuService.toggle());

    user_permissions_signal = computed(() => this.authService.user_permissions_signal());

    user_session: any;
    isLoading: boolean = false;
    optionsDashboard = ["Expalsa", "Biomar"];
    optionDashboardSelected = "";


    ngOnInit() {
        this.user_session = this.userService.getDataSession();

        if (this.user_session.role === "admin_tlsg") {
            this.optionDashboardSelected = "Expalsa";
        }
    }
    
    onChangeDahboard(option: string) {
        this.optionDashboardSelected = option
    }

}