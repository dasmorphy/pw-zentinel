import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment.development';
import { UtilsService } from './utils.service';
import { Dispatch } from '../models/dispatch';
import { EntryAccess } from '../models/entry-access';

@Injectable({
    providedIn: 'root'
})
export class DispatchService {
    private readonly http = inject(HttpClient);
    private readonly utilsService = inject(UtilsService);

    productsSku: WritableSignal<any[]> = signal<any[]>([]);
    vehiclesTypes: WritableSignal<any[]> = signal<any[]>([]);
    destinyIntern: WritableSignal<any[]> = signal<any[]>([]);
    areasVisit: WritableSignal<any[]> = signal<any[]>([]);
    unitiesWeight: WritableSignal<any[]> = signal<any[]>([]);
    staffCharge: WritableSignal<any[]> = signal<any[]>([]);
    materials: WritableSignal<any[]> = signal<any[]>([]);
    statusDispatch: WritableSignal<any[]> = signal<any[]>([]);
    graphsDispatch: WritableSignal<any[]> = signal<any[]>([]);
    
    showModalSummary: WritableSignal<Dispatch | null> = signal<any>(null);
    showModalSummaryEntry: WritableSignal<EntryAccess | null> = signal<any>(null);

    openSummary(dispatch: Dispatch) {
        this.showModalSummary.set(dispatch);
    }

    openSummaryEntry(entryData: EntryAccess) {
        this.showModalSummaryEntry.set(entryData);
    }

    closeSummary() {
        this.showModalSummary.set(null);
    }

    closeSummaryEntry() {
        this.showModalSummaryEntry.set(null);
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

    getAllAreas() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/area-visit`)
        .subscribe({
                next: (data: any) => {
                    this.areasVisit.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }

    getStaffCharge() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/staff-charge`)
        .subscribe({
                next: (data: any) => {
                    this.staffCharge.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }

    getMaterials() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/materials`)
        .subscribe({
                next: (data: any) => {
                    this.materials.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }

    getStatusDispatch() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/status-dispatch`)
        .subscribe({
                next: (data: any) => {
                    this.statusDispatch.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }

    saveEntryAccess(formData: FormData) {
        return this.http.post(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/entry-access`, formData)
    }

    saveDispatch(formData: FormData) {
        return this.http.post(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/dispatch`, formData)
    }

    patchDispatch(formData: FormData, id_dispatch: number) {
        return this.http.patch(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/dispatch/${id_dispatch}`, formData)
    }

    patchEntryAccess(formData: FormData, id_entry: number) {
        return this.http.patch(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/entry-access/${id_entry}`, formData)
    }

    saveReception(formData: FormData) {
        return this.http.post(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/reception`, formData)
    }

    getGraphs() {
        this.http.get(`${environment.apiUrl}/rest/zent-dispatch-api/v1.0/get/resume_graphs`)
        .subscribe({
                next: (data: any) => {
                    this.graphsDispatch.set(data?.data || []);
                },
                error: ({ error }: any) => this.utilsService.onError(error.message)
            })
    }

}