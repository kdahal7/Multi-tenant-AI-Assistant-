import { connectDB, disconnectDB } from '../lib/db';
import { User, Project, ProductInstance, Integration, DashboardConfig } from '../db/models';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  try {
    await connectDB();
    console.log('Starting database seed...');

    // Clear existing data (optional - comment out to keep existing data)
    // await Promise.all([
    //   User.deleteMany({}),
    //   Project.deleteMany({}),
    //   ProductInstance.deleteMany({}),
    //   Integration.deleteMany({}),
    //   DashboardConfig.deleteMany({}),
    // ]);

    // Create a demo project
    const project = await Project.findOneAndUpdate(
      { slug: 'demo' },
      {
        name: 'Demo Project',
        slug: 'demo',
        description: 'Demo project for testing',
        ownerId: new mongoose.Types.ObjectId(),
      },
      { upsert: true, new: true }
    );

    console.log('✓ Project created:', project.slug);

    // Create demo users
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        projectId: project._id,
      },
      { upsert: true, new: true }
    );

    const memberUser = await User.findOneAndUpdate(
      { email: 'user@example.com' },
      {
        email: 'user@example.com',
        name: 'Member User',
        role: 'member',
        projectId: project._id,
      },
      { upsert: true, new: true }
    );

    console.log('✓ Users created:', adminUser.email, memberUser.email);

    // Create product instances
    const salesAssistant = await ProductInstance.findOneAndUpdate(
      { namespace: 'sales', projectId: project._id },
      {
        projectId: project._id,
        productType: 'sales-assistant',
        name: 'Sales Assistant',
        namespace: 'sales',
        config: {
          description: 'AI-powered sales assistant for product inquiries',
        },
      },
      { upsert: true, new: true }
    );

    const supportBot = await ProductInstance.findOneAndUpdate(
      { namespace: 'support', projectId: project._id },
      {
        projectId: project._id,
        productType: 'support-bot',
        name: 'Support Bot',
        namespace: 'support',
        config: {
          description: 'AI-powered customer support bot',
        },
      },
      { upsert: true, new: true }
    );

    console.log('✓ Product instances created:', salesAssistant.name, supportBot.name);

    // Create integrations for sales assistant
    await Integration.findOneAndUpdate(
      { type: 'shopify', productInstanceId: salesAssistant._id },
      {
        projectId: project._id,
        productInstanceId: salesAssistant._id,
        type: 'shopify',
        enabled: true,
        config: {
          apiKey: 'demo_key',
          storeName: 'demo-store.myshopify.com',
        },
      },
      { upsert: true, new: true }
    );

    await Integration.findOneAndUpdate(
      { type: 'crm', productInstanceId: salesAssistant._id },
      {
        projectId: project._id,
        productInstanceId: salesAssistant._id,
        type: 'crm',
        enabled: false,
        config: {
          apiKey: 'demo_crm_key',
          endpoint: 'https://crm.example.com',
        },
      },
      { upsert: true, new: true }
    );

    console.log('✓ Integrations created for sales assistant');

    // Create dashboard config
    await DashboardConfig.findOneAndUpdate(
      { projectId: project._id },
      {
        projectId: project._id,
        sections: [
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
                config: { value: 42 },
              },
              {
                id: 'total-messages',
                type: 'metric',
                title: 'Total Messages',
                order: 2,
                config: { value: 342 },
              },
              {
                id: 'active-users',
                type: 'metric',
                title: 'Active Users',
                order: 3,
                config: { value: 15 },
              },
              {
                id: 'avg-response-time',
                type: 'metric',
                title: 'Avg Response Time',
                order: 4,
                config: { value: '1.2s' },
              },
            ],
          },
          {
            id: 'integrations',
            title: 'Integrations Status',
            order: 2,
            widgets: [
              {
                id: 'shopify-status',
                type: 'card',
                title: 'Shopify Integration',
                order: 1,
                config: { status: 'active' },
              },
              {
                id: 'crm-status',
                type: 'card',
                title: 'CRM Integration',
                order: 2,
                config: { status: 'inactive' },
              },
              {
                id: 'email-status',
                type: 'card',
                title: 'Email Integration',
                order: 3,
                config: { status: 'active' },
              },
              {
                id: 'slack-status',
                type: 'card',
                title: 'Slack Integration',
                order: 4,
                config: { status: 'inactive' },
              },
            ],
          },
          {
            id: 'analytics',
            title: 'Analytics',
            order: 3,
            widgets: [
              {
                id: 'messages-chart',
                type: 'chart',
                title: 'Messages Over Time',
                order: 1,
              },
              {
                id: 'usage-table',
                type: 'table',
                title: 'Product Usage',
                order: 2,
              },
            ],
          },
        ],
      },
      { upsert: true, new: true }
    );

    console.log('✓ Dashboard configuration created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDemo credentials:');
    console.log('  Email: admin@example.com (admin)');
    console.log('  Email: user@example.com (member)');
    console.log('  Project slug: demo');
    console.log('\nMongoDB collections populated:');
    console.log('  - Projects');
    console.log('  - Users');
    console.log('  - ProductInstances');
    console.log('  - Integrations');
    console.log('  - DashboardConfigs');

    await disconnectDB();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
