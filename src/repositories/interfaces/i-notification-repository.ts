import { Notification, NotificationType } from '@/domain/types/notification';
import { PaginationParams, PaginatedResult } from './common';

export interface NotificationFilterCriteria extends PaginationParams {
  user_id: string;
  is_read?: boolean;
  type?: NotificationType;
}

export type NewNotificationInput = Omit<Notification, 'notification_id' | 'created_at' | 'read_at'>;

export interface INotificationRepository {
  findById(notificationId: string): Promise<Notification | null>;
  findMany(filters: NotificationFilterCriteria): Promise<PaginatedResult<Notification>>;
  create(notification: NewNotificationInput): Promise<Notification>;
  markAsRead(notificationId: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
}
