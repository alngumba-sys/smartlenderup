/**
 * Utility to fix shareholders data in Supabase
 * Run this once to update Victor and Ben's total_investment to 1,000,000 each
 */

import { supabaseDataService } from '../services/supabaseDataService';

export async function fixShareholdersData(organizationId: string) {
  console.log('🔧 Fixing shareholders data...');
  
  try {
    // Get all shareholders
    const shareholders = await supabaseDataService.shareholders.getAll(organizationId);
    console.log('Current shareholders:', shareholders);
    
    // Find Victor and Ben
    const victor = shareholders.find(s => 
      s.name?.toLowerCase().includes('victor') || 
      s.shareholder_name?.toLowerCase().includes('victor')
    );
    
    const ben = shareholders.find(s => 
      s.name?.toLowerCase().includes('ben') || 
      s.shareholder_name?.toLowerCase().includes('ben')
    );
    
    // Update Victor if found
    if (victor && victor.id) {
      console.log('Updating Victor Muthama...');
      await supabaseDataService.shareholders.update(victor.id, {
        ...victor,
        total_investment: 1000000,
        share_value: 1000000,
        status: 'active'
      }, organizationId);
      console.log('✅ Victor updated');
    }
    
    // Update Ben if found
    if (ben && ben.id) {
      console.log('Updating Ben Mbuvi...');
      await supabaseDataService.shareholders.update(ben.id, {
        ...ben,
        total_investment: 1000000,
        share_value: 1000000,
        status: 'active'
      }, organizationId);
      console.log('✅ Ben updated');
    }
    
    // Verify updates
    const updatedShareholders = await supabaseDataService.shareholders.getAll(organizationId);
    console.log('Updated shareholders:', updatedShareholders);
    console.log('Total investment:', updatedShareholders.reduce((sum, s) => sum + (s.total_investment || 0), 0));
    
    return updatedShareholders;
  } catch (error) {
    console.error('Error fixing shareholders:', error);
    throw error;
  }
}
