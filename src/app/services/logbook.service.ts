import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class LogbookService {
    private readonly http = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    categories: WritableSignal<any[]> = signal<any[]>([]);
    unitiesWeight: WritableSignal<any[]> = signal<any[]>([]);
    showModalSummary: WritableSignal<any> = signal<any>(null);

    openSummary(datLogbook: any) {
        this.showModalSummary.set(datLogbook);
    }

    closeSummary() {
        this.showModalSummary.set(null);
    }

    getAllCategories() {
        this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/allCategories`)
            .subscribe({
                next: (data: any) => {
                    this.categories.set(data?.data || []);
                },
                error: ({ error }: any) => this.onError(error.message)
            })
    }

    getAllUnitiesWeight() {
        this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/allUnitiesWeight`)
            .subscribe({
                next: (data: any) => {
                    this.unitiesWeight.set(data?.data || []);
                },
                error: ({ error }: any) => this.onError(error.message)
            })
    }

    saveLogbookEntry(formData: FormData) {
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/post/logbook-entry`,
            formData
        );
    }


    saveLogbookOut(formData: FormData) {
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/post/logbook-out`, formData);
    }

    getHistoryLogbook(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filter?.start_date) {
            params = params.set('start_date', filter.start_date);
        }

        if (filter?.end_date) {
            params = params.set('end_date', filter.end_date);
        }

        if (filter?.groups_business_id) {
            headers = headers.set('groups-business-id', filter?.groups_business_id)
        }

        if (filter?.workday) {
            headers = headers.set('workday', filter?.workday)
        }

        if (filter?.sectors) {
            headers = headers.set('sectors', filter?.sectors)
        }

        if (filter?.ids_categories) {
            headers = headers.set('ids-categories', filter?.ids_categories)
        }

        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/history-logbook`,
            { headers, params }
        )
    }

    getGenerateReportExcel() {
        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/generate_report`,
            {
                responseType: 'blob',
                observe: 'response'
            }
        )
    }

    getGenerateReportPdf() {
        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/generate_report_pdf`,
            {
                responseType: 'blob',
                observe: 'response'
            }
        );
    }

    onError(message: string) {
        this.messageService.add({
            life: 5000,
            severity: 'error',
            summary: 'Error',
            detail: message
        });
    }


}