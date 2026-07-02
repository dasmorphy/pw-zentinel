import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NgxTippyModule } from "ngx-tippy-wrapper";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TieredMenuModule } from "primeng/tieredmenu";
import { TimelineModule } from "primeng/timeline";
import { ToastModule } from "primeng/toast";
import { Dispatch } from "src/app/models/dispatch";
import { DashboardService } from "src/app/services/dashboard.service";
import { DispatchService } from "src/app/services/dispatch.service";
import { PurchaseOrderService } from "src/app/services/puchase-order.service";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
    selector: 'app-purchase-order',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        FormsModule,
        ButtonModule,
        ProgressSpinnerModule,
        ToastModule,
        DropdownModule,
        TableModule,
        InputTextModule,
        ReactiveFormsModule,
        TagModule,
        CalendarModule,
        MultiSelectModule,
        TimelineModule,
        SplitButtonModule,
        NgxTippyModule,
        TieredMenuModule,
        OverlayPanelModule,
        FileUploadModule,
        InputSwitchModule,
        InputNumberModule,
    ],
    templateUrl: './purchase-order.component.html',
    styleUrls: ['./purchase-order.component.sass']
})
export class PurchaseOrderComponent {
    @ViewChild('fileUpload') fileUpload!: FileUpload;


    public readonly dispatchService = inject(DispatchService);
    public readonly purchaseOrderService = inject(PurchaseOrderService);
    public readonly utilsService = inject(UtilsService);
    public readonly userService = inject(UserService);
    private readonly dashboardService = inject(DashboardService);


    showModal: boolean = false;
    showNewOrder: boolean = false;
    showUpdate: boolean = false;
    orderForm: FormGroup;

    expandedRows = {};

    dataPurchaseOrder: Dispatch[] = [];
    isLoading: boolean = false;

    selectedOrder: any;
    optionGroupBusiness = []
    typeOrders = ["BALANCEADO", "COMBUSTIBLE"]
    rangeDates: Date[] | undefined;


    dateRangeFilter: Date[] | null = null;
    messageEmpty: string = "No hay opciones disponibles";

    filters: any = {
    };

    user_json: any;

    items: any = [
        {
            label: 'Ver detalles',
            icon: 'pi pi-eye',
            command: () => this.showModal = true
        },
        {
            label: 'Habilitar orden',
            icon: 'pi pi-play-circle',
            visible: () => this.selectedOrder?.status_name === 'Con Novedad' && this.utilsService.formatLocalDate(new Date()) > this.selectedOrder?.end_date,
            command: () => this.showUpdate = true
        },
    ];


    constructor(private fb: FormBuilder, private route: ActivatedRoute) {
        this.orderForm = this.fb.group({
            number_order: ['', Validators.required],
            type_order: ['', Validators.required],
            destiny_id: ['', Validators.required],
            provider: ['', Validators.required],
            quantity: [null, Validators.required],
            observations: [''],
        });
    }

    ngOnInit() {
        this.user_json = this.userService.getDataSession();
        const filters = { ...this.filters };
        this.fetchOrderPurchase();
        this.fetchGroupBusinessByBusiness();

    }


    fetchOrderPurchase() {
        this.isLoading = true;
        const filters = { ...this.filters };

        this.purchaseOrderService.getAllPurchaseOrders(filters).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataPurchaseOrder = data?.data;
            },
            error: (error: any) => {
                this.isLoading = false;
                console.log(error)
            }
        })
    }

    fetchGroupBusinessByBusiness() {
        // const id_business = this.user_json?.attributes?.id_business
        this.dashboardService.getGroupBusinessByBusiness(1).subscribe({
            next: (resp: any) => {
                this.optionGroupBusiness = resp?.data
            },
            error: (err) => console.error(err)
        });
    }

    reloadDataDispatch() {
        this.fetchOrderPurchase();
    }

    optionsDispatch(loogbook: any) {
        this.selectedOrder = loogbook
    }

    // expandAll() {
    //     this.expandedRows = this.dataPurchaseOrder.reduce((acc, p) => (acc[p.id] = true) && acc, {});
    // }

    // collapseAll() {
    //     this.expandedRows = {};
    // }

    onQuantityInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        // Convierte comas en puntos
        let value = input.value.replace(/,/g, '.');

        // Elimina cualquier carácter que no sea número o punto
        value = value.replace(/[^0-9.]/g, '');

        // Permite solo un punto decimal
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        input.value = value;

        this.orderForm.get('quantity')?.setValue(value, {
            emitEvent: false
        });
    }


    saveOrder() {
        console.log(this.rangeDates)

        if (!this.rangeDates || this.rangeDates.length < 2) {
            this.utilsService.onWarn('Por favor, seleccione un rango de fechas válido.');
            return;
        }

        const [startDate, endDate] = this.rangeDates;

        console.log(startDate, endDate)

        this.utilsService.validateControlsForms(this.orderForm, ["observations"]);
        this.utilsService.showControlVoiled();

        if (this.orderForm.valid) {
            this.isLoading = true;
            const data_save = {
                ...this.orderForm.value,
                user: this.user_json?.user,
                start_date: this.utilsService.formatLocalDate(startDate),
                end_date: this.utilsService.formatLocalDate(endDate),
            };
            console.log(data_save)

            this.purchaseOrderService.savePurchaseOrder(data_save).subscribe({
                next: (data: any) => {
                    this.isLoading = false;
                    const message = data?.message ?? 'Orden de compra guardada correctamente'
                    this.utilsService.onSuccess(message)
                    this.rangeDates = undefined;
                    this.orderForm.reset();
                    this.showNewOrder = false;
                    this.fetchOrderPurchase();
                },
                error: (error: any) => {
                    console.log(error);
                    this.isLoading = false;
                    const error_message = error?.error?.message ?? 'Error al guardar orden de compra, por favor intente nuevamente'
                    this.utilsService.onError(error_message)
                }
            })
        }

    }

    applyFilter(imagePanel: any) {
        imagePanel.hide()
        let filter_date: any = {}

        if (Array.isArray(this.dateRangeFilter)) {
            if (this.dateRangeFilter.length === 2) {
                const [startDate, endDate] = this.dateRangeFilter;

                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);

                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                filter_date.start_date = this.utilsService.formatLocalDate(start);
                filter_date.end_date = this.utilsService.formatLocalDate(end);
            };
        };

        this.filters = filter_date;
        console.log(this.filters)
        this.fetchOrderPurchase();
    }

    clearFilter() {

    }

    updateStatus() {
        this.isLoading = true;
        const data_save = {
            order: {
                user: this.user_json?.user,
                status_update: "Incompleto",
            }
        };

        this.purchaseOrderService.updateStatus(data_save, this.selectedOrder?.id_order).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                const message = data?.message ?? 'Estado de orden actualizado correctamente'
                this.utilsService.onSuccess(message)
                this.showUpdate = false;
                this.fetchOrderPurchase();
            },
            error: (error: any) => {
                console.log(error);
                this.isLoading = false;
                const error_message = error?.error?.message ?? 'Error al actualizar estado de orden, por favor intente nuevamente'
                this.utilsService.onError(error_message)
            }
        })
    }

}