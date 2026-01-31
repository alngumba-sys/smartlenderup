/**
 * Migration Utility: Convert UUID Client IDs to CL001 Format
 * 
 * This utility automatically migrates client IDs from UUID format to the new
 * alphanumeric format (CL001, CL002, etc.) and updates all related records.
 * 
 * Runs automatically on application load to ensure data consistency.
 */

import type { Client, Loan } from '../contexts/DataContext';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  clientIdMap: Map<string, string>; // UUID -> CL001 mapping
}

/**
 * Check if a client ID is in UUID format
 */
function isUuidFormat(id: string): boolean {
  // UUID format: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Check if a client ID is in the new CL### format
 */
function isNewFormat(id: string): boolean {
  const newFormatRegex = /^CL\d{3}$/;
  return newFormatRegex.test(id);
}

/**
 * Generate the next available client ID in CL### format
 */
function generateNextClientId(existingClients: Client[]): string {
  // Find the maximum ID number from existing CL### format IDs
  const maxId = existingClients.reduce((max, client) => {
    const match = client.id.match(/^CL(\d{3})$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  
  return `CL${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * Migrate client IDs from UUID to CL### format
 */
export function migrateClientIds(
  clients: Client[],
  loans: Loan[]
): MigrationResult {
  const errors: string[] = [];
  const clientIdMap = new Map<string, string>();
  let migratedCount = 0;

  try {
    // Step 1: Identify clients with UUID format IDs
    const uuidClients = clients.filter(client => isUuidFormat(client.id));
    
    if (uuidClients.length === 0) {
      console.log('✅ No UUID client IDs found. Migration not needed.');
      return {
        success: true,
        migratedCount: 0,
        errors: [],
        clientIdMap
      };
    }

    console.log(`🔄 Found ${uuidClients.length} client(s) with UUID format IDs. Starting migration...`);

    // Step 2: Create mapping of old UUID -> new CL### IDs
    const validClients = clients.filter(c => isNewFormat(c.id));
    
    uuidClients.forEach(client => {
      const newId = generateNextClientId([...validClients, ...Array.from({ length: migratedCount }, (_, i) => ({
        id: `CL${String(i + 1).padStart(3, '0')}`
      } as Client))]);
      
      clientIdMap.set(client.id, newId);
      migratedCount++;
      
      console.log(`  📝 Mapping: ${client.id.substring(0, 8)}... → ${newId} (${client.name})`);
    });

    // Step 3: Update client IDs
    const updatedClients = clients.map(client => {
      if (clientIdMap.has(client.id)) {
        const newId = clientIdMap.get(client.id)!;
        console.log(`  ✓ Updated client: ${client.name} (${client.id.substring(0, 8)}... → ${newId})`);
        return {
          ...client,
          id: newId
        };
      }
      return client;
    });

    // Step 4: Update loan clientId references
    const updatedLoans = loans.map(loan => {
      if (clientIdMap.has(loan.clientId)) {
        const newClientId = clientIdMap.get(loan.clientId)!;
        console.log(`  ✓ Updated loan ${loan.id}: clientId ${loan.clientId.substring(0, 8)}... → ${newClientId}`);
        return {
          ...loan,
          clientId: newClientId
        };
      }
      return loan;
    });

    console.log(`✅ Migration completed successfully!`);
    console.log(`   - ${migratedCount} client(s) migrated`);
    console.log(`   - ${updatedLoans.length} loan record(s) checked`);

    return {
      success: true,
      migratedCount,
      errors,
      clientIdMap
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('❌ Migration failed:', errorMsg);
    
    return {
      success: false,
      migratedCount,
      errors,
      clientIdMap
    };
  }
}

/**
 * Apply migration results to update client and loan arrays
 */
export function applyMigration(
  clients: Client[],
  loans: Loan[],
  clientIdMap: Map<string, string>
): { updatedClients: Client[], updatedLoans: Loan[] } {
  const updatedClients = clients.map(client => {
    if (clientIdMap.has(client.id)) {
      return {
        ...client,
        id: clientIdMap.get(client.id)!
      };
    }
    return client;
  });

  const updatedLoans = loans.map(loan => {
    if (clientIdMap.has(loan.clientId)) {
      return {
        ...loan,
        clientId: clientIdMap.get(loan.clientId)!
      };
    }
    return loan;
  });

  return { updatedClients, updatedLoans };
}
