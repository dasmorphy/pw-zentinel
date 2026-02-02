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

    saveLogbookEntry(data: any) {
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/post/logbook-entry`, {
            logbook_entry: data
        });
    }


    saveLogbookOut(data: any) {
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/post/logbook-out`, {
            logbook_out: data
        });
    }

    getHistoryLogbook(headers_json?: any) {
        let headers = new HttpHeaders();

        if (headers_json?.user) {
            headers = headers.set('user', headers_json?.user);
        }

        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/history-logbook`,
            { headers }
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