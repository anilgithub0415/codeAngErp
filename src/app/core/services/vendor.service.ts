import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap
import { CreateProductDto, Product } from '../models/product.model';
import { Vendor } from '../models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

    // Base URL for your Product API endpoints on the backend
    // Assuming your backend serves product APIs under /api/products
    private apiUrl = '/vendor';

    constructor(private http: HttpClient) { }

    /**
     * Handles HTTP errors from API calls.
     * @param error The HttpErrorResponse.
     * @returns An Observable that throws an error.
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error occurred.
            console.error('Client-side error:', error.error.message);
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        // Return an observable with a product-facing error message.
        return throwError(() => new Error(errorMessage));
    }

 /**
     * Creates a new product by sending data to the backend API.
     * @param productData The data for the new product (CreateProductDto).
     * @returns An Observable of the created Product object (including its new ID).
     */
 createProduct(productData: Partial<CreateProductDto>): Observable<Product> {
    console.log(`Creating product at ${this.apiUrl} with data:`, productData);
    return this.http.post<Product>(this.apiUrl, productData).pipe(
        tap(newProduct => console.log('Created product:', newProduct)),
        catchError(this.handleError)
    );
}
getProduct(ptenantId:string,prodId:number): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl+'/'+ptenantId+'/'+prodId)
}

getProducts(ptenantId:string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.apiUrl+'/?activeTenantId='+ptenantId)
}
getProductFinalPrice(pProductId:number,ptenantId:string,p:any): Observable<number> {
    var url=this.apiUrl+'/finalPrice/'+pProductId+'/'+ptenantId+'/1';
    console.log('posting url:',url);
    
    return this.http.post<number>(url,p)
}

    //for ngx-formly to work
    getProducttableFieldsConfig(ptenantId:any):Observable<any>{
        var url=this.apiUrl+'/product_table_fields/'+ptenantId;
        
        
        return this.http.get<any[]>(url).pipe(
            // tap(tenants => console.log('Fetched tenants:', tenants)),
             catchError(this.handleError)
         );
     }

}
