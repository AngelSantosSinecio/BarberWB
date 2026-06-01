import { ActionType } from './log.model';

export interface ActivityLogApiItem {
  id: number;
  action: ActionType;
  entity: string;
  entity_id: number | null;
  user_id: number | null;
  user_name: string | null;
  details: string | null;
  timestamp: string;
}

export interface CreateActivityLogRequest {
  action: ActionType;
  entity: string;
  entityId: number | null;
  userId: number | null;
  details: string;
}
