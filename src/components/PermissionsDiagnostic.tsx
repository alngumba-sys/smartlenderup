import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PermissionsDiagnostic() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);

  const checkUser = async () => {
    if (!email) return;

    // Check staff_users table
    const { data: staffUser, error: staffError } = await supabase
      .from('staff_users')
      .select('id, full_name, email, role, granular_permissions')
      .eq('email', email)
      .single();

    if (staffError) {
      setResult({ error: staffError.message });
      return;
    }

    // Check staff_permissions table
    const { data: oldPerms, error: oldPermsError } = await supabase
      .from('staff_permissions')
      .select('*')
      .eq('staff_user_id', staffUser.id);

    setResult({
      staffUser,
      oldPermissions: oldPerms,
      granularPermissionsType: typeof staffUser.granular_permissions,
      granularPermissionsIsNull: staffUser.granular_permissions === null,
      granularPermissionsValue: staffUser.granular_permissions,
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Permissions Diagnostic</h1>
      
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter staff email"
          className="border px-4 py-2 rounded mr-2 w-80"
        />
        <button
          onClick={checkUser}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check User
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 p-4 rounded">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}