import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, effect, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    getResumeChart() {
        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/get/resume_graphs`)
    }
}