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
        DoughnutComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent {
    private readonly menuService = inject(MenuService);
    private readonly logbookService = inject(LogbookService);
    private readonly userService = inject(UserService);

    toggle = computed(() => this.menuService.toggle());
    dataHistory: any = [];
    user_session: any;

    ngOnInit() {
        const headers: any = {}
        const user_session = localStorage.getItem('sb_token')
        const user_json = user_session ? JSON.parse(user_session) : null;
        this.user_session = user_json;
        
        if (user_json?.role !== 'admin') {
            headers['user'] = user_json?.user
        }

        this.logbookService.getHistoryLogbook(headers).subscribe({
            next: (data: any) => {
                console.log(data)
                this.dataHistory = data?.data?.slice(0, 5)?.map((item: any) => {
                    const isEntry = !!item.id_logbook_entry;
                    return {
                        user: item.created_by,
                        type: isEntry ? 'entrada' : 'salida',
                        group: item.group_name,
                        date: new Date(item.created_at)
                    };
                });
            },
            error: (error: any) => {
                console.log(error)
            }
        })
    }

}