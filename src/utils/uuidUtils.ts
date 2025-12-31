/**
 * UUID Utility Functions
 * Centralized UUID generation and validation for Supabase compatibility
 */

/**
 * Validates if a string is a valid UUID v4
 * @param str - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export const isValidUUID = (str: string | undefined | null): boolean => {
  if (!str) return false;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Generates a new UUID v4
 * @returns A valid UUID v4 string
 */
export const generateUUID = (): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback to manual generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Converts a custom ID to a UUID or generates a new one
 * Useful for migrating from custom IDs (like "L001-203542") to UUIDs
 * @param customId - The custom ID to convert
 * @returns A valid UUID
 */
export const ensureUUID = (customId: string | undefined | null): string => {
  if (isValidUUID(customId)) {
    return customId as string;
  }
  return generateUUID();
};

/**
 * Validates multiple UUIDs and returns only valid ones
 * @param ids - Array of IDs to validate
 * @returns Array of valid UUIDs
 */
export const filterValidUUIDs = (ids: (string | undefined | null)[]): string[] => {
  return ids.filter((id): id is string => isValidUUID(id));
};

/**
 * Creates a mapping between custom IDs and UUIDs
 * Useful for maintaining references during migration
 */
export class IDMapper {
  private map: Map<string, string> = new Map();

  /**
   * Get UUID for a custom ID, or generate and store a new one
   * @param customId - The custom ID
   * @returns The corresponding UUID
   */
  getOrCreate(customId: string): string {
    if (isValidUUID(customId)) {
      return customId;
    }
    
    if (this.map.has(customId)) {
      return this.map.get(customId)!;
    }
    
    const uuid = generateUUID();
    this.map.set(customId, uuid);
    return uuid;
  }

  /**
   * Get UUID for a custom ID without creating a new one
   * @param customId - The custom ID
   * @returns The corresponding UUID or undefined
   */
  get(customId: string): string | undefined {
    if (isValidUUID(customId)) {
      return customId;
    }
    return this.map.get(customId);
  }

  /**
   * Check if a custom ID has a UUID mapping
   * @param customId - The custom ID
   * @returns true if mapping exists
   */
  has(customId: string): boolean {
    if (isValidUUID(customId)) {
      return true;
    }
    return this.map.has(customId);
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.map.clear();
  }

  /**
   * Get all mappings
   * @returns Object with custom IDs as keys and UUIDs as values
   */
  getAll(): Record<string, string> {
    return Object.fromEntries(this.map);
  }
}

/**
 * Singleton ID mapper for global use
 */
export const globalIDMapper = new IDMapper();
