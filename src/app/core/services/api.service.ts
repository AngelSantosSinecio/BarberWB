import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.apiUrl}${endpoint}`)
      .pipe(map((response) => response.data));
  }

  post<T, Body = unknown>(endpoint: string, body: Body): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(map((response) => response.data));
  }

  put<T, Body = unknown>(endpoint: string, body: Body): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(map((response) => response.data));
  }

  patch<T, Body = unknown>(endpoint: string, body: Body): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(map((response) => response.data));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.apiUrl}${endpoint}`)
      .pipe(map((response) => response.data));
  }
}
