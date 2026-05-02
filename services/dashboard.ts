import { connectDB } from '@/lib/db';
import { DashboardConfig } from '@/db/models';
import { UpdateDashboardConfigInput } from '@/lib/validation';

/**
 * Dashboard service for config-driven UI
 */

export class DashboardService {
  /**
   * Get dashboard config for a project
   */
  static async getDashboardConfig(projectId: string) {
    await connectDB();

    let config = await DashboardConfig.findOne({ projectId }).exec();

    // If no config exists, create default
    if (!config) {
      config = await DashboardConfig.create({
        projectId,
        sections: this.getDefaultConfig(),
      });
    }

    return config;
  }

  /**
   * Update dashboard config
   */
  static async updateDashboardConfig(
    projectId: string,
    data: UpdateDashboardConfigInput
  ) {
    await connectDB();

    const config = await DashboardConfig.findOneAndUpdate(
      { projectId },
      {
        sections: data.sections,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    ).exec();

    return config;
  }

  /**
   * Default dashboard configuration
   */
  private static getDefaultConfig() {
    return [
      {
        id: 'overview',
        title: 'Overview',
        order: 1,
        widgets: [
          {
            id: 'total-conversations',
            type: 'metric',
            title: 'Total Conversations',
            order: 1,
            config: { value: 0 },
          },
          {
            id: 'total-messages',
            type: 'metric',
            title: 'Total Messages',
            order: 2,
            config: { value: 0 },
          },
        ],
      },
      {
        id: 'integrations',
        title: 'Integrations',
        order: 2,
        widgets: [
          {
            id: 'shopify-status',
            type: 'card',
            title: 'Shopify Integration',
            order: 1,
            config: { status: 'inactive' },
          },
          {
            id: 'crm-status',
            type: 'card',
            title: 'CRM Integration',
            order: 2,
            config: { status: 'inactive' },
          },
        ],
      },
    ];
  }
}
