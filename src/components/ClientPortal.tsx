import { useState } from 'react';
import { Home, CreditCard, FileText, User, ArrowLeft } from 'lucide-react';
import { ClientDashboardTab } from './client-tabs/ClientDashboardTab';
import { ClientMyLoansTab } from './client-tabs/ClientMyLoansTab';
import { ClientApplyTab } from './client-tabs/ClientApplyTab';
import { ClientProfileTab } from './client-tabs/ClientProfileTab';

interface ClientPortalProps {
  clientId: string;
  onBackToAdmin?: () => void;
}

export function ClientPortal({ clientId, onBackToAdmin }: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'loans', label: 'My Loans', icon: CreditCard },
    { id: 'apply', label: 'Apply for Loan', icon: FileText },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClientDashboardTab clientId={clientId} />;
      case 'loans':
        return <ClientMyLoansTab clientId={clientId} />;
      case 'apply':
        return <ClientApplyTab clientId={clientId} />;
      case 'profile':
        return <ClientProfileTab clientId={clientId} />;
      default:
        return <ClientDashboardTab clientId={clientId} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-89px)] lg:flex-row">
      {/* Mobile-friendly Navigation */}
      <div className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 overflow-x-auto lg:overflow-y-auto">
        <nav className="p-4">
          <div className="flex lg:flex-col gap-1 lg:space-y-1 min-w-max lg:min-w-0">
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="size-5 flex-shrink-0" />
                <span>Back to Admin</span>
              </button>
            )}
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="size-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}