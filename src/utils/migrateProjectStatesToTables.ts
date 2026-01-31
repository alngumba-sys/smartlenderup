import { supabase } from '../lib/supabase';
import { syncAllEntitiesToTables } from './dualStorageSync';
import { toast } from 'sonner@2.0.3';

/**
 * ============================================
 * ONE-TIME MIGRATION SCRIPT
 * ============================================
 * 
 * This script migrates ALL existing data from project_states table
 * to individual normalized tables (clients, loans, repayments, etc.)
 * 
 * Run this once to sync all existing organizations' data.
 */

export async function migrateAllOrganizations(): Promise<void> {
  try {
    console.log('🔄 Starting migration from project_states to individual tables...');
    
    // Fetch all project states
    const { data: projectStates, error } = await supabase
      .from('project_states')
      .select('*');

    if (error) {
      console.error('❌ Error fetching project states:', error);
      toast.error('Migration failed: Could not fetch project states');
      return;
    }

    if (!projectStates || projectStates.length === 0) {
      console.log('ℹ️ No project states found to migrate');
      toast.info('No data to migrate');
      return;
    }

    console.log(`📊 Found ${projectStates.length} organizations to migrate`);

    let successCount = 0;
    let failCount = 0;

    // Migrate each organization
    for (const projectState of projectStates) {
      try {
        const organizationId = projectState.organization_id;
        const state = projectState.state;

        console.log(`\n🔄 Migrating organization: ${organizationId}`);

        // Get user ID from organization
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('id', organizationId)
          .single();

        if (!org) {
          console.warn(`⚠️ Organization ${organizationId} not found in organizations table`);
          failCount++;
          continue;
        }

        // Create a default user ID for sync (use organization ID as user ID)
        const userId = organizationId;

        // Sync all entities to individual tables
        const success = await syncAllEntitiesToTables(userId, organizationId, state);

        if (success) {
          successCount++;
          console.log(`✅ Successfully migrated ${organizationId}`);
        } else {
          failCount++;
          console.log(`❌ Failed to migrate ${organizationId}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating organization:`, error);
        failCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Success: ${successCount} organizations`);
    console.log(`   Failed: ${failCount} organizations`);

    if (successCount > 0) {
      toast.success(`Migration complete! Synced ${successCount} organizations`);
    }
    if (failCount > 0) {
      toast.warning(`${failCount} organizations failed to migrate`);
    }
  } catch (error) {
    console.error('❌ Migration exception:', error);
    toast.error('Migration failed with error');
  }
}

/**
 * Migrate a single organization by ID
 */
export async function migrateSingleOrganization(organizationId: string): Promise<boolean> {
  try {
    console.log(`🔄 Migrating organization: ${organizationId}`);

    // Fetch project state for this organization
    const { data: projectState, error } = await supabase
      .from('project_states')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error || !projectState) {
      console.error('❌ Could not fetch project state:', error);
      toast.error('Migration failed: Project state not found');
      return false;
    }

    // Use organization ID as user ID
    const userId = organizationId;

    // Sync all entities
    const success = await syncAllEntitiesToTables(userId, organizationId, projectState.state);

    if (success) {
      console.log(`✅ Successfully migrated ${organizationId}`);
      toast.success('Organization data synced successfully');
      return true;
    } else {
      console.log(`❌ Failed to migrate ${organizationId}`);
      toast.error('Migration failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    toast.error('Migration failed with error');
    return false;
  }
}
