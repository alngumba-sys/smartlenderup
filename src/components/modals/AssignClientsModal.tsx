import React, { useState } from 'react';
import { X, Search, Users, UserCheck, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

interface AssignClientsModalProps {
  institution: {
    id: string;
    name: string;
    type: string;
  };
  onClose: () => void;
}

export function AssignClientsModal({ institution, onClose }: AssignClientsModalProps) {
  const { isDark } = useTheme();
  const { clients, updateClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get clients not already assigned to this institution
  const availableClients = clients.filter(
    c => c.institutionId !== institution.id
  );

  // Filter clients based on search term
  const filteredClients = availableClients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      (client.clientNumber && client.clientNumber.toLowerCase().includes(search))
    );
  });

  const handleToggleClient = (clientId: string) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClientIds.length === filteredClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(filteredClients.map(c => c.id));
    }
  };

  const handleAssignClients = async () => {
    if (selectedClientIds.length === 0) {
      toast.error('Please select at least one client');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update each selected client
      for (const clientId of selectedClientIds) {
        await updateClient(clientId, { institutionId: institution.id });
      }

      toast.success(
        `✅ Successfully assigned ${selectedClientIds.length} client(s) to ${institution.name}`
      );
      onClose();
    } catch (error: any) {
      console.error('Error assigning clients:', error);
      toast.error(`Failed to assign clients: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-between flex-shrink-0`}
        >
          <div>
            <h2
              className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Add Clients to {institution.name}
            </h2>
            <p
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mt-1`}
            >
              Select clients to assign to this institution
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email, or client number..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>
        </div>

        {/* Info Banner */}
        <div
          className={`mx-6 mb-4 p-3 rounded-lg border flex items-start gap-3 ${
            isDark
              ? 'bg-blue-900/20 border-blue-500/30'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <AlertCircle
            className={`size-5 flex-shrink-0 mt-0.5 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm ${
                isDark ? 'text-blue-300' : 'text-blue-900'
              }`}
            >
              {availableClients.length === 0
                ? 'All clients have been assigned to institutions.'
                : `${availableClients.length} client(s) available. ${selectedClientIds.length} selected.`}
            </p>
          </div>
        </div>

        {/* Clients List */}
        <div className="flex-1 overflow-y-auto px-6">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users
                className={`size-12 mx-auto mb-3 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}
              />
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {searchTerm
                  ? 'No clients found matching your search'
                  : 'No available clients to assign'}
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              {filteredClients.length > 0 && (
                <div
                  className={`mb-3 pb-3 border-b ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedClientIds.length === filteredClients.length &&
                        filteredClients.length > 0
                      }
                      onChange={handleSelectAll}
                      className="size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Select All ({filteredClients.length})
                    </span>
                  </label>
                </div>
              )}

              {/* Column Headers */}
              <div className={`grid grid-cols-[auto_200px_140px_1fr_140px_100px] gap-3 px-3 py-2 mb-2 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div></div> {/* Checkbox column */}
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Client Name
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Phone
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Employer
                </div>
                <div className={`text-xs font-medium text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Client #
                </div>
              </div>

              {/* Client List */}
              <div className="space-y-1.5">
                {filteredClients.map(client => {
                  const isSelected = selectedClientIds.includes(client.id);
                  return (
                    <label
                      key={client.id}
                      className={`grid grid-cols-[auto_200px_140px_1fr_140px_100px] gap-3 items-center px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-emerald-900/20 border-emerald-500/50'
                            : 'bg-emerald-50 border-emerald-300'
                          : isDark
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleClient(client.id)}
                        className="size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0"
                      />
                      
                      {/* Client Name */}
                      <div className="truncate">
                        <p
                          className={`font-medium truncate text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {client.name}
                        </p>
                      </div>

                      {/* Phone */}
                      <div className="truncate">
                        <p
                          className={`text-sm truncate ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {client.phone}
                        </p>
                      </div>

                      {/* Email */}
                      <div className="truncate">
                        <p
                          className={`text-sm truncate ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {client.email || '—'}
                        </p>
                      </div>

                      {/* Employer */}
                      <div className="truncate">
                        <p
                          className={`text-sm truncate ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                          }`}
                        >
                          {client.employer || '—'}
                        </p>
                      </div>

                      {/* Client Number */}
                      <div className="flex justify-end">
                        {client.clientNumber && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {client.clientNumber}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}</div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-between flex-shrink-0`}
        >
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {selectedClientIds.length} client(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignClients}
              disabled={selectedClientIds.length === 0 || isSubmitting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedClientIds.length === 0 || isSubmitting
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <UserCheck className="size-4" />
              {isSubmitting
                ? 'Assigning...'
                : `Assign ${selectedClientIds.length || ''} Client${
                    selectedClientIds.length !== 1 ? 's' : ''
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}