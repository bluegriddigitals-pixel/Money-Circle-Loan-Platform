import { NotificationType } from '../constants/enums';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: number;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}