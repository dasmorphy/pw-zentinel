import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { EventSourceService } from "src/app/services/event-source.service";
import { LogbookService } from "src/app/services/logbook.service";
import { UtilsService } from "src/app/services/utils.service";
import { LogBookDetailsModalComponent } from "../modals/logbook-details-modal/logbook-details-modal.component";
import { filter, Subscription } from "rxjs";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: 'app-logbook-recent',
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
        ProgressSpinnerModule,
        DialogModule,
        LogBookDetailsModalComponent
    ],
    templateUrl: './logbook-recent.component.html',
    styleUrls: ['./logbook-recent.component.sass'],
})

export class LogbookRecentComponent implements OnInit, OnDestroy {
    private readonly logbookService = inject(LogbookService);
    private readonly eventSourceService = inject(EventSourceService);
    private readonly utilsService = inject(UtilsService);
    private readonly userService = inject(UserService);

    logbookSelected = computed(() => this.logbookService.showModalSummary());

    private sseSub?: Subscription;

    dataHistory: any = [];
    dataComplete: any[] = [];
    user_session: any;
    // showDetail: boolean = false;
    isLoading: boolean = false;
    log_selected: any;

    ngOnInit() {
        this.fetchHistoryLogbook();

        this.sseSub = this.eventSourceService.connect(0).subscribe({
            next: (data: any) => {
                this.utilsService.onWarn('Se ha recibido una nueva bitácora')
                console.log('Nuevo mensaje:', data);
                this.dataComplete.unshift(data?.logbook);
                this.dataHistory = this.mapHistory(this.dataComplete).slice(0, 5);

            },
            error: (err: any) => {
                console.error('Error SSE:', err);
            }
        });
    }

    ngOnDestroy() {
        this.sseSub?.unsubscribe();
    }


    fetchHistoryLogbook() {
        this.isLoading = true;
        const headers: any = {}
        this.user_session = this.userService.getUserStorage();
        let filters: any = {};

        if (this.user_session?.role !== 'admin') {
            headers['user'] = this.user_session?.user
            filters.user = this.user_session?.user
        }

        this.logbookService.getHistoryLogbook(filters).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataComplete = data?.data;
                this.dataHistory = this.mapHistory(this.dataComplete).slice(0, 5);
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }

    reloadHistoryLogbook() {
        this.fetchHistoryLogbook();
    }


    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase().trim();

        if (!value) {
            // si no hay búsqueda, vuelve a mostrar los últimos 5
            this.dataHistory = this.mapHistory(this.dataComplete).slice(0, 5);
            return;
        }

        const filtered = this.dataComplete.filter((item: any) => {
            return (
                item.shipping_guide?.toLowerCase().includes(value) ||
                item.group_name?.toLowerCase().includes(value) ||
                item.created_by?.toLowerCase().includes(value) ||
                item.truck_license?.toLowerCase().includes(value) ||
                item.name_category?.toLowerCase().includes(value)
            );
        });

        this.dataHistory = this.mapHistory(filtered);
    }

    mapHistory(data: any[]) {
        return data.map((item: any) => {
            const isEntry = !!item.id_logbook_entry;

            if (!item?.name_category) {
                console.log('id sin nombre', item.category_id)
            }

            return {
                user: item.created_by,
                id: isEntry ? item.id_logbook_entry : item.id_logbook_out,
                guide: item.shipping_guide,
                name_category: item.name_category,
                type: isEntry ? 'entrada' : 'salida',
                group: item.group_name,
                truck_license: item.truck_license,
                date: item.created_at
            };
        });
    }



    viewLogbookDetails(log: any) {
        let log_found;

        if (log.type === 'entrada') {
            log_found = this.dataComplete.find(
                (item: any) => item.id_logbook_entry === log.id
            );
        } else {
            log_found = this.dataComplete.find(
                (item: any) => item.id_logbook_out === log.id
            );
        }

        this.log_selected = log_found;
        this.logbookService.openSummary(log_found);
        // this.showDetail = true;
    }

    // viewContractDetails(logbook: any) {
    //     if (!this.selectedLogbook) {
    //         this.utilsService.onWarn('Registro no seleccionado');
    //         return;
    //     }
    //     this.logbookService.openSummary(logbook);
    // }

    
    
}