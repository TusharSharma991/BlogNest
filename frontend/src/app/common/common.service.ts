import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { environment } from '../../environments/environemnt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {}


  wakeUp(): Observable<any> {
    return this.http.post<any>(`${this.baseURL}api/wakeUp`, {});
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseURL}user/authenticate`, { username, password });
  }

  postWithAuth<T>(route: string, data: any = {}): Observable<any> {
    const token = JSON.parse(localStorage.getItem('currentUser') || '{}')?.token || '';
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<T>(this.baseURL + route, data, { headers });
  }

  getWithAuth<T>(route: string): Observable<any> {
    const token = JSON.parse(localStorage.getItem('currentUser') || '{}')?.token || '';
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<T>(this.baseURL + route, { headers });
  }

  postFileWithAuth(route: string, formData: FormData): Observable<any> {
    const token = JSON.parse(localStorage.getItem('currentUser') || '{}')?.token || '';
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    return this.http.post(this.baseURL + route, formData, { headers });
  }
}