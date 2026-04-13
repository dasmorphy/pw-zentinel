import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment.development';
import { UtilsService } from './utils.service';
import { Dispatch } from '../models/dispatch';

@Injectable({
    providedIn: 'root'
})
export class DispatchService {
    private readonly http = inject(HttpClient);
    private readonly utilsService = inject(UtilsService);

    productsSku: WritableSignal<any[]> = signal<any[]>([]);
    vehiclesTypes: WritableSignal<any[]> = signal<any[]>([]);
    destinyIntern: WritableSignal<any[]> = signal<any[]>([]);
    unitiesWeight: WritableSignal<any[]> = signal<any[]>([]);
    showModalSummary: WritableSignal<Dispatch | null> = signal<any>(null);

    openSummary(dispatch: Dispatch) {
        this.showModalSummary.set(dispatch);
    }

    closeSummary() {
        this.showModalSummary.set(null);
    }

    getProductsSku() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/dispatch-products-sku`)
            .subscribe({
                next: (data: any) => {
                    this.productsSku.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }

    getVehiclesTypes() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/vehicle-types`)
            .subscribe({
                next: (data: any) => {
                    this.vehiclesTypes.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }


    getAllDispatchs() {
        return this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/dispatch`)
    }

    getAllEntryAccess() {
        return this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/entry-access`)
    }

}