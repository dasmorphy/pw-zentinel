import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";

@Injectable({
    providedIn: 'root'
})
export class ProjectTechnicalService {
    private readonly http = inject(HttpClient);

    getProjectsTechnical(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filter?.start_date) {
            params = params.set('start_date', filter.start_date);
        }

        if (filter?.end_date) {
            params = params.set('end_date', filter.end_date);
        }

        if (filter?.status) {
            params = params.set('status', filter.status);
        }

        if (filter?.client_id) {
            params = params.set('client_id', filter.client_id);
        }

        if (filter?.status) {
            params = params.set('status', filter.status);
        }

        return this.http.get(`${environment.apiTechnical}/rest/technical-control-api/v1.0/project`,
            { headers, params }
        )
    }

    updateStatusProject(data: any) {
        return this.http.patch(`${environment.apiTechnical}/rest/technical-control-api/v1.0/update-status-project/${data.id_project}`, {data});
    }

    getAuditingTechnical(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filter?.start_date) {
            params = params.set('start_date', filter.start_date);
        }

        if (filter?.end_date) {
            params = params.set('end_date', filter.end_date);
        }

        if (filter?.locations) {
            params = params.set('locations', filter.locations);
        }

        if (filter?.clients) {
            params = params.set('clients', filter.clients);
        }

        if (filter?.tasks) {
            params = params.set('tasks', filter.tasks);
        }

        return this.http.get(`http://localhost:2124/rest/technical-control-api/v1.0/auditing`,
            { headers, params }
        )
    }

    getResumeGraphsTechnical(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filter?.start_date) {
            params = params.set('start_date', filter.start_date);
        }

        if (filter?.end_date) {
            params = params.set('end_date', filter.end_date);
        }

        return this.http.get(`${environment.apiTechnical}/rest/technical-control-api/v1.0/resume-graphs`,
            { headers, params }
        )
    }
}
