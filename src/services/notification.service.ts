import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import type { NotificationItem } from '@/types';

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  limit: number;
}

class NotificationService {
  /**
   * Get notifications for the logged-in user (paginated)
   */
  async getNotifications(page = 1, limit = 20, signal?: AbortSignal): Promise<NotificationListResponse> {
    const response = await api.get<ApiResponse<NotificationListResponse>>('/notifications', {
      params: { page, limit },
      signal,
    });
    // API retorna { status, data: { notifications, total, page, limit } }
    return response.data.data!;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(signal?: AbortSignal): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count', {
      signal,
    });
    return response.data.data?.count ?? 0;
  }

  /**
   * Mark one notification as read
   */
  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<number> {
    const response = await api.post<ApiResponse<{ count: number }>>('/notifications/read-all');
    return response.data.data?.count ?? 0;
  }
}

export const notificationService = new NotificationService();
