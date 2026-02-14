export interface AuditLog {
  id: string;
  userId?: string;
  userIp?: string;
  userAgent?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  changes?: any;
  requestId?: string;
  statusCode?: number;
  createdAt: string;
}