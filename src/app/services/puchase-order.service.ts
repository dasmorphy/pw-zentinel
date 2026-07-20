import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
    private readonly http = inject(HttpClient);
    
    getPurchaseOrderReceipts(filters?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filters?.withoutOrder) {
            params = params.set('without-order', filters?.withoutOrder);
        }

        return this.http.get(`http://localhost:2120/rest/zent-logbook-api/v1.0/purchase-order-receipts`,
            { headers, params }
        )
    }

    getBlacklist(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filter?.dni) {
            params = params.set('dni', filter.dni);
        }

        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/blacklist-driver`,
            { headers, params }
        )
    }

    getReasonRestriction() {
        return this.http.get(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/reason_restriction`);
    }

    deleteBlacklist(id: number) {
        let params = new HttpParams();

        if (id) {
            params = params.set('id-blacklist', id);
        }


        return this.http.delete(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/blacklist-driver`,
            { params }
        )
    }

    saveBlacklist(formData: FormData) {
        const headers = new HttpHeaders().set('Token', localStorage.getItem('sb_token') || '');
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/blacklist-driver`, formData, { headers });
    }

    updatePurchaseOrder(data: any, id_order: number) {
        const headers = new HttpHeaders().set('Token', localStorage.getItem('sb_token') || '');
        return this.http.patch(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/update-purchase-order/${id_order}`, data, { headers });
    }

    getAllPurchaseOrders(filter?: any) {
        let params = new HttpParams();
        let headers = new HttpHeaders();

        if (filter?.withoutReceipts) {
            params = params.set('without-receipts', filter.withoutReceipts);
        }

        return this.http.get(`http://localhost:2120/rest/zent-logbook-api/v1.0/purchase-order`,
            { headers, params }
        )
    }

    savePurchaseOrder(order: any) {
        const headers = new HttpHeaders().set('Token', localStorage.getItem('sb_token') || '');
        return this.http.post(`${environment.apiUrl}/rest/zent-logbook-api/v1.0/purchase-order`, {order}, { headers });
    }

    assignReceiptsToOrder(data: any) {
        return this.http.patch(`http://localhost:2120/rest/zent-logbook-api/v1.0/assign-order-to-receipt`, {data});
    }
}