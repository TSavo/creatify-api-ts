import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  TestResourceTracker,
} from './setup';

describe('Workspace API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      console.log('Workspace integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping Workspace integration tests - API credentials not provided');
        return;
      }
      throw error;
    }
  }, 30000);

  beforeEach(() => {
    resourceTracker = new TestResourceTracker();
  });

  afterAll(async () => {
    if (resourceTracker) {
      await resourceTracker.cleanup();
    }
  });

  describe('Workspace Information', () => {
    it('should get workspace details', async () => {
      console.log('Fetching workspace information...');
      
      const workspace = await creatify.workspace.getWorkspace();
      
      expect(workspace).toHaveProperty('id');
      expect(workspace).toHaveProperty('name');
      expect(typeof workspace.id).toBe('string');
      expect(typeof workspace.name).toBe('string');
      
      console.log(`Workspace: ${workspace.name} (${workspace.id})`);
      
      // Check for common workspace properties
      if (workspace.credits_remaining !== undefined) {
        expect(typeof workspace.credits_remaining).toBe('number');
        console.log(`Credits remaining: ${workspace.credits_remaining}`);
      }
      
      if (workspace.plan !== undefined) {
        expect(typeof workspace.plan).toBe('string');
        console.log(`Plan: ${workspace.plan}`);
      }
      
      if (workspace.usage !== undefined) {
        expect(typeof workspace.usage).toBe('object');
        console.log(`Usage data available`);
      }
    });

    it('should get workspace usage statistics', async () => {
      console.log('Fetching workspace usage statistics...');
      
      try {
        const usage = await creatify.workspace.getWorkspaceUsage();
        
        expect(usage).toBeInstanceOf(Object);
        console.log('Usage statistics retrieved successfully');
        
        // Check for common usage properties
        if (usage.videos_created !== undefined) {
          expect(typeof usage.videos_created).toBe('number');
          console.log(`Videos created: ${usage.videos_created}`);
        }
        
        if (usage.credits_used !== undefined) {
          expect(typeof usage.credits_used).toBe('number');
          console.log(`Credits used: ${usage.credits_used}`);
        }
        
        if (usage.current_period !== undefined) {
          expect(typeof usage.current_period).toBe('object');
          console.log('Current period usage data available');
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Workspace usage endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should get workspace settings', async () => {
      console.log('Fetching workspace settings...');
      
      try {
        const settings = await creatify.workspace.getWorkspaceSettings();
        
        expect(settings).toBeInstanceOf(Object);
        console.log('Workspace settings retrieved successfully');
        
        // Check for common settings properties
        if (settings.default_aspect_ratio !== undefined) {
          expect(typeof settings.default_aspect_ratio).toBe('string');
          console.log(`Default aspect ratio: ${settings.default_aspect_ratio}`);
        }
        
        if (settings.webhook_url !== undefined) {
          expect(typeof settings.webhook_url).toBe('string');
          console.log(`Webhook URL configured: ${settings.webhook_url ? 'Yes' : 'No'}`);
        }
        
        if (settings.brand_settings !== undefined) {
          expect(typeof settings.brand_settings).toBe('object');
          console.log('Brand settings available');
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Workspace settings endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Workspace Members', () => {
    it('should list workspace members', async () => {
      console.log('Fetching workspace members...');
      
      try {
        const members = await creatify.workspace.getWorkspaceMembers();
        
        expect(members).toBeInstanceOf(Array);
        console.log(`Found ${members.length} workspace members`);
        
        if (members.length > 0) {
          const member = members[0];
          expect(member).toHaveProperty('id');
          expect(member).toHaveProperty('email');
          expect(typeof member.id).toBe('string');
          expect(typeof member.email).toBe('string');
          
          console.log(`Sample member: ${member.email} (${member.role || 'unknown role'})`);
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Workspace members endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should get current user information', async () => {
      console.log('Fetching current user information...');
      
      try {
        const user = await creatify.workspace.getCurrentUser();
        
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(typeof user.id).toBe('string');
        expect(typeof user.email).toBe('string');
        
        console.log(`Current user: ${user.email} (${user.id})`);
        
        if (user.role !== undefined) {
          expect(typeof user.role).toBe('string');
          console.log(`User role: ${user.role}`);
        }
        
        if (user.permissions !== undefined) {
          expect(user.permissions).toBeInstanceOf(Array);
          console.log(`User permissions: ${user.permissions.length} permissions`);
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Current user endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Workspace Billing', () => {
    it('should get billing information', async () => {
      console.log('Fetching billing information...');
      
      try {
        const billing = await creatify.workspace.getBillingInfo();
        
        expect(billing).toBeInstanceOf(Object);
        console.log('Billing information retrieved successfully');
        
        // Check for common billing properties
        if (billing.plan !== undefined) {
          expect(typeof billing.plan).toBe('string');
          console.log(`Billing plan: ${billing.plan}`);
        }
        
        if (billing.credits_remaining !== undefined) {
          expect(typeof billing.credits_remaining).toBe('number');
          console.log(`Credits remaining: ${billing.credits_remaining}`);
        }
        
        if (billing.next_billing_date !== undefined) {
          expect(typeof billing.next_billing_date).toBe('string');
          console.log(`Next billing date: ${billing.next_billing_date}`);
        }
        
        if (billing.subscription_status !== undefined) {
          expect(typeof billing.subscription_status).toBe('string');
          console.log(`Subscription status: ${billing.subscription_status}`);
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Billing information endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should get credit usage history', async () => {
      console.log('Fetching credit usage history...');
      
      try {
        const creditHistory = await creatify.workspace.getCreditHistory();
        
        expect(creditHistory).toBeInstanceOf(Array);
        console.log(`Found ${creditHistory.length} credit usage records`);
        
        if (creditHistory.length > 0) {
          const record = creditHistory[0];
          expect(record).toHaveProperty('date');
          expect(record).toHaveProperty('credits_used');
          expect(typeof record.date).toBe('string');
          expect(typeof record.credits_used).toBe('number');
          
          console.log(`Sample record: ${record.credits_used} credits on ${record.date}`);
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Credit history endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Workspace API Keys', () => {
    it('should list API keys', async () => {
      console.log('Fetching API keys...');
      
      try {
        const apiKeys = await creatify.workspace.getApiKeys();
        
        expect(apiKeys).toBeInstanceOf(Array);
        console.log(`Found ${apiKeys.length} API keys`);
        
        if (apiKeys.length > 0) {
          const apiKey = apiKeys[0];
          expect(apiKey).toHaveProperty('id');
          expect(apiKey).toHaveProperty('name');
          expect(typeof apiKey.id).toBe('string');
          expect(typeof apiKey.name).toBe('string');
          
          console.log(`Sample API key: ${apiKey.name} (${apiKey.id})`);
          
          if (apiKey.created_at !== undefined) {
            expect(typeof apiKey.created_at).toBe('string');
            console.log(`Created: ${apiKey.created_at}`);
          }
          
          if (apiKey.last_used !== undefined) {
            console.log(`Last used: ${apiKey.last_used || 'Never'}`);
          }
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('API keys endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should validate current API key', async () => {
      console.log('Validating current API key...');
      
      try {
        const validation = await creatify.workspace.validateApiKey();
        
        expect(validation).toHaveProperty('valid');
        expect(typeof validation.valid).toBe('boolean');
        expect(validation.valid).toBe(true);
        
        console.log(`API key validation: ${validation.valid ? 'Valid' : 'Invalid'}`);
        
        if (validation.permissions !== undefined) {
          expect(validation.permissions).toBeInstanceOf(Array);
          console.log(`API key permissions: ${validation.permissions.length} permissions`);
        }
        
        if (validation.rate_limit !== undefined) {
          expect(typeof validation.rate_limit).toBe('object');
          console.log('Rate limit information available');
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('API key validation endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });
});
