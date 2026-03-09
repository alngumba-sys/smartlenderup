/**
 * LocalStorage Monitor - Tracks all localStorage operations
 * This helps debug localStorage issues
 */

if (typeof window !== 'undefined') {
  // Save original methods
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  const originalClear = localStorage.clear.bind(localStorage);

  // Override setItem
  localStorage.setItem = function(key: string, value: string) {
    console.log(`📝 [localStorage] SET "${key}"`, value.substring(0, 100));
    const stack = new Error().stack;
    console.log(`   ↳ Called from:`, stack?.split('\n')[2]?.trim());
    originalSetItem(key, value);
  };

  // Override removeItem
  localStorage.removeItem = function(key: string) {
    console.log(`🗑️ [localStorage] REMOVE "${key}"`);
    const stack = new Error().stack;
    console.log(`   ↳ Called from:`, stack?.split('\n')[2]?.trim());
    originalRemoveItem(key);
  };

  // Override clear
  localStorage.clear = function() {
    console.log(`💥 [localStorage] CLEAR ALL`);
    const stack = new Error().stack;
    console.log(`   ↳ Called from:`, stack?.split('\n')[2]?.trim());
    originalClear();
  };

  console.log('👁️ LocalStorage monitor active - all operations will be logged');
}
