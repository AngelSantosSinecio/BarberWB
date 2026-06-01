export type ActionType = 'creación' | 'cancelación' | 'edición' | 'login' | 'logout';

export interface ActivityLog {
  id: string;
  action: ActionType;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}
