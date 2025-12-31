import { useState } from 'react';
import { Database, Eye, EyeOff, Trash2, Download, RefreshCw } from 'lucide-react';
import { db } from '../utils/database';
import { useTheme } from '../contexts/ThemeContext';

export function DatabaseViewer() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const organizations = db.getAllOrganizations();
  const dbData = db.exportDatabase();

  const handleClearDatabase = () => {
    if (confirm('Are you sure you want to clear the entire database? This action cannot be undone.')) {
      db.clearDatabase();
      setIsOpen(false);
      window.location.reload();
    }
  };

  const handleExportDatabase = () => {
    const dataStr = JSON.stringify(dbData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartlenderup_db_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all"
        title="View Database"
      >
        <Database className="size-6" />
        {organizations.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full size-6 flex items-center justify-center font-bold">
            {organizations.length}
          </span>
        )}
      </button>

      {/* Database Viewer Panel */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-[100] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-500 w-[600px] max-h-[600px] overflow-hidden ${isDark ? 'dark' : ''}`}>
          {/* Header */}
          <div className="bg-purple-600 dark:bg-purple-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-white" />
              <h3 className="font-bold text-white">Database Viewer (Dev Tool)</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
            >
              {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPasswords ? 'Hide' : 'Show'} Passwords
            </button>
            <button
              onClick={handleExportDatabase}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
            >
              <Download className="size-4" />
              Export JSON
            </button>
            <button
              onClick={handleClearDatabase}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm ml-auto"
            >
              <Trash2 className="size-4" />
              Clear All
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[450px]">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Organizations ({organizations.length})
              </h4>
              
              {organizations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No organizations created yet</p>
              ) : (
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <div key={org.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">ID:</span>
                          <p className="text-gray-900 dark:text-white font-mono text-xs">{org.id}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">Username:</span>
                          <p className="text-purple-700 dark:text-purple-300 font-mono font-bold">{org.username}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Organization:</span>
                          <p className="text-gray-900 dark:text-white">{org.organization_name}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
                          <p className="text-gray-900 dark:text-white text-xs">{org.email}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span>
                          <p className="text-gray-900 dark:text-white text-xs">{org.phone}</p>
                        </div>
                        {showPasswords && (
                          <div className="col-span-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-2">
                            <span className="font-semibold text-yellow-800 dark:text-yellow-300">Password:</span>
                            <p className="text-yellow-900 dark:text-yellow-200 font-mono text-xs">{org.password_hash}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            org.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            org.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {org.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Created:</span>
                          <p className="text-gray-900 dark:text-white text-xs">
                            {new Date(org.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Database Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Database Statistics</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">Clients</div>
                  <div className="text-blue-900 dark:text-blue-100 font-bold">{dbData.clients?.length || 0}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                  <div className="text-green-600 dark:text-green-400 font-semibold">Loans</div>
                  <div className="text-green-900 dark:text-green-100 font-bold">{dbData.loans?.length || 0}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                  <div className="text-purple-600 dark:text-purple-400 font-semibold">Users</div>
                  <div className="text-purple-900 dark:text-purple-100 font-bold">{dbData.users?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
