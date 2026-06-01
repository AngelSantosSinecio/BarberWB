import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityLogApiItem, CreateActivityLogRequest } from '../models/activity-log-api.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ActivityLogsApiService {
  constructor(private api: ApiService) {}

  getLogs(): Observable<ActivityLogApiItem[]> {
    return this.api.get<ActivityLogApiItem[]>('/activity-logs');
  }

  createLog(body: CreateActivityLogRequest): Observable<ActivityLogApiItem> {
    return this.api.post<ActivityLogApiItem, CreateActivityLogRequest>('/activity-logs', body);
  }
}
