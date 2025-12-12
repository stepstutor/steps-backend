import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { UserNotification } from '../entities/userNotification.entity';

@Injectable()
export class UserNotificationsService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
  ) {}

  /**
   * Create a new user notification
   */
  async create(
    userNotificationData: Partial<UserNotification>,
  ): Promise<UserNotification> {
    const userNotification =
      this.userNotificationRepository.create(userNotificationData);
    return this.userNotificationRepository.save(userNotification);
  }

  /**
   * Update an existing user notification
   */
  async update(
    id: string,
    updateData: Partial<UserNotification>,
  ): Promise<UserNotification> {
    await this.userNotificationRepository.update(id, updateData);
    return this.userNotificationRepository.findOneOrFail({ where: { id } });
  }

  /**
   * Find all user notifications with a generic where clause
   */
  async findAll(
    where?: FindOptionsWhere<UserNotification>,
  ): Promise<UserNotification[]> {
    return this.userNotificationRepository.find({
      where,
      order: { sentAt: 'DESC' },
    });
  }

  /**
   * Find one user notification by a generic where clause
   */
  async findOne(
    where: FindOptionsWhere<UserNotification>,
  ): Promise<UserNotification | null> {
    return this.userNotificationRepository.findOne({ where });
  }

  /**
   * Mark multiple user notifications as seen.
   * If a notification has no linkUrl, mark it as read as well.
   */
  async markAsSeen(notificationIds: string[]): Promise<boolean> {
    try {
      const now = new Date();

      // Update all notifications as seen
      await this.userNotificationRepository.update(
        { id: In(notificationIds) },
        { seenAt: now },
      );

      // Find notifications that also need to be marked as read (where linkUrl is null)
      await this.userNotificationRepository.update(
        { id: In(notificationIds), linkUrl: IsNull() },
        { readAt: now },
      );

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Mark a user notification as read.
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    await this.userNotificationRepository.update(notificationId, {
      readAt: new Date(),
    });
    return { success: true };
  }

  /**
   * Bulk create user notifications
   */
  async bulkCreate(
    userNotificationsData: Partial<UserNotification>[],
  ): Promise<UserNotification[]> {
    const userNotifications = this.userNotificationRepository.create(
      userNotificationsData,
    );
    return this.userNotificationRepository.save(userNotifications);
  }
}
