import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ActivityLog } from '../models/log.model';
import { ActivityLogApiItem } from '../models/activity-log-api.model';
import { ActivityLogsApiService } from './activity-logs-api.service';

@Injectable({ providedIn: 'root' })
export class LogService {
  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);

  logs$ = this.logsSubject.asObservable();

  constructor(private activityLogsApi: ActivityLogsApiService) {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('authToken')) {
      this.refreshLogs();
    }
  }

  logAction(
    action: ActivityLog['action'],
    entity: string,
    entityId: string,
    userId: string,
    _userName: string,
    details: string
  ) {
    this.activityLogsApi.createLog({
      action,
      entity,
      entityId: this.toOptionalNumber(entityId),
      userId: this.toOptionalNumber(userId),
      details
    }).subscribe({
      next: () => this.refreshLogs()
    });
  }

  refreshLogs() {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('authToken')) {
      this.logsSubject.next([]);
      return;
    }

    this.activityLogsApi.getLogs().subscribe({
      next: (logs) => this.logsSubject.next(logs.map((log) => this.toActivityLog(log))),
      error: () => this.logsSubject.next([])
    });
  }

  private toActivityLog(log: ActivityLogApiItem): ActivityLog {
    return {
      id: String(log.id),
      action: log.action,
      entity: log.entity,
      entityId: log.entity_id === null ? '' : String(log.entity_id),
      userId: log.user_id === null ? '' : String(log.user_id),
      userName: log.user_name || 'Sistema',
      timestamp: log.timestamp,
      details: log.details || ''
    };
  }

  private toOptionalNumber(value: string): number | null {
    const numberValue = Number(value);
    return Number.isInteger(numberValue) ? numberValue : null;
  }
}
