import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    getHistoryLogbook(headers_json?: any, filters?: any) {
        let headers = new HttpHeaders();
        let params: any = {};

        if (headers_json?.user) {
            headers = headers.set('user', headers_json?.user);
        }

        if (headers_json?.ids_categories) {
            headers = headers.set('ids-categories', headers_json?.ids_categories);
        }

        if (filters) {
            if (filters.dateRange && filters.dateRange.length === 2) {
                params.start_date = filters.dateRange[0].toISOString().split('T')[0];
                params.end_date = filters.dateRange[1].toISOString().split('T')[0];
            }
            // Add other filters as needed
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