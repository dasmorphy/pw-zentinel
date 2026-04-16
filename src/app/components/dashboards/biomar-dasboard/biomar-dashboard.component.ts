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

@Component({
    selector: 'app-biomar-dashboard',
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
        LogbookRecentComponent
    ],
    templateUrl: './biomar-dashboard.component.html',
    styleUrls: ['./biomar-dashboard.component.sass'],
})
export class BiomarDashboardComponent {
    private readonly menuService = inject(MenuService);
    private readonly logbookService = inject(LogbookService);
    private readonly dispatchService = inject(DispatchService);

    toggle = computed(() => this.menuService.toggle());
    graphs = computed(() => this.dispatchService.graphsDispatch());
    user_session: any;
    isLoading: boolean = false;

    ngOnInit() {
        const user_session = localStorage.getItem('sb_token')
        const user_json = user_session ? JSON.parse(user_session) : null;
        this.user_session = user_json;
        this.logbookService.getAllCategories();
        this.dispatchService.getGraphs()
    }


    getStatusStyles(statusName: string) {
        switch (statusName) {
            case 'En tránsito':
                return {
                    background: '#f3e178',
                    color: '#8a9019'
                };
            case 'Ingresado en bodega':
                return {
                    background: '#9df18a',
                    color: '#158308'
                };
            case 'Listo para despacho':
                return {
                    background: '#bfdaec',
                    color: '#3b6d89'
                };
            default:
                return {
                    background: '#F3F4F6',
                    color: '#374151'
                };
        }
    }


}