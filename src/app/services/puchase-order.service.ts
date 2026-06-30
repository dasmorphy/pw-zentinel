import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
    private readonly http = inject(HttpClient);
    
    getPurchaseOrderReceipts(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/purchase-order-receipts`,
            { headers, params }
        )
    }

    getBlacklist(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/blacklist-driver`,
            { headers, params }
        )
    }

    deleteBlacklist(id: number) {
        let params = new HttpParams();

        if (id) {
            params = params.set('id', id);
        }


        return this.http.delete(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/blacklist-driver`,
            { params }
        )
    }

    saveBlacklist(formData: FormData) {
        const headers = new HttpHeaders().set('Token', localStorage.getItem('sb_token') || '');
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/blacklist-driver`, formData, { headers });
    }
}