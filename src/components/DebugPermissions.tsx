import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

export function DebugPermissions() {
  const { currentUser } = useAuth();
  const { customPermissions, userRole } = usePermissions();
  const [showDebug, setShowDebug] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    // Read localStorage directly
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      try {
        setLocalStorageData(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }
  }, [currentUser]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-[10000]"
      >
        🔍 Debug Permissions
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto z-[10000] text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Permission Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-red-400">✕</button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>User:</strong> {currentUser?.name}
        </div>
        <div>
          <strong>Role:</strong> {currentUser?.role}
        </div>
        <div>
          <strong>UserType:</strong> {currentUser?.userType}
        </div>
        
        <hr className="border-gray-700" />
        
        <div>
          <strong>Custom Permissions Count:</strong> {customPermissions?.length || 0}
        </div>
        
        {customPermissions && customPermissions.length > 0 && (
          <div>
            <strong>Custom Permissions:</strong>
            <ul className="list-disc pl-4 mt-1 max-h-32 overflow-auto">
              {customPermissions.map((perm, i) => (
                <li key={i} className="text-[10px]">{perm}</li>
              ))}
            </ul>
          </div>
        )}
        
        <hr className="border-gray-700" />
        
        <div>
          <strong>LocalStorage granular_permissions:</strong>
          {localStorageData?.granular_permissions ? (
            <pre className="bg-gray-800 p-2 rounded mt-1 text-[10px] overflow-auto max-h-32">
              {typeof localStorageData.granular_permissions === 'string' 
                ? localStorageData.granular_permissions.substring(0, 200) + '...'
                : JSON.stringify(localStorageData.granular_permissions, null, 2).substring(0, 200) + '...'}
            </pre>
          ) : (
            <div className="text-red-400">NOT FOUND</div>
          )}
        </div>
        
        <hr className="border-gray-700" />
        
        <div>
          <strong>LocalStorage granularPermissions:</strong>
          {localStorageData?.granularPermissions ? (
            <pre className="bg-gray-800 p-2 rounded mt-1 text-[10px] overflow-auto max-h-32">
              {typeof localStorageData.granularPermissions === 'string' 
                ? localStorageData.granularPermissions.substring(0, 200) + '...'
                : JSON.stringify(localStorageData.granularPermissions, null, 2).substring(0, 200) + '...'}
            </pre>
          ) : (
            <div className="text-red-400">NOT FOUND</div>
          )}
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('bvfunguo_user');
            window.location.reload();
          }}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs w-full"
        >
          Clear Cache & Reload
        </button>
      </div>
    </div>
  );
}
