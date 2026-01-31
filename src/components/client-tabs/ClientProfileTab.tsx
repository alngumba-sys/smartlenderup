import { User, Phone, Mail, MapPin, Building2, Shield, Bell, HelpCircle } from 'lucide-react';
import { clients } from '../../data/dummyData';

interface ClientProfileTabProps {
  clientId: string;
}

export function ClientProfileTab({ clientId }: ClientProfileTabProps) {
  const client = clients.find(c => c.id === clientId);

  if (!client) return <div className="p-6">Client not found</div>;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Profile & Settings</h2>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl overflow-hidden">
              {client.photo ? (
                <img src={client.photo} alt={client.name} className="size-full object-cover" />
              ) : (
                client.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <div>
              <h3 className="text-gray-900">{client.name}</h3>
              <p className="text-gray-600">Client ID: {client.id}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                client.status.toLowerCase().trim() === 'good standing' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                client.status.toLowerCase().trim() === 'in arrears' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                'bg-blue-100 text-blue-800'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
        </div>

        {/* Credit Score */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Credit Score</span>
            <span className="text-gray-900 text-xl">{client.creditScore || 300}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                client.creditScore >= 80 ? 'bg-emerald-600' :
                client.creditScore >= 60 ? 'bg-amber-600' : 'bg-red-600'
              }`}
              style={{ width: `${client.creditScore}%` }}
            />
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {client.creditScore >= 80 ? 'Excellent - You qualify for premium loan products' :
             client.creditScore >= 60 ? 'Good - You qualify for standard loan products' :
             'Fair - Continue making on-time payments to improve'}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="size-5 text-blue-600" />
            <h3 className="text-gray-900">Personal Information</h3>
          </div>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm">
            Request Update
          </button>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Full Name</label>
              <div className="flex items-center gap-2 text-gray-900">
                <User className="size-4 text-gray-400" />
                {client.name}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">National ID Number</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Shield className="size-4 text-gray-400" />
                {client.nationalId}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Phone Number</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Phone className="size-4 text-gray-400" />
                {client.phone}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Business Type</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Building2 className="size-4 text-gray-400" />
                {client.businessType}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Branch</label>
              <div className="flex items-center gap-2 text-gray-900">
                <MapPin className="size-4 text-gray-400" />
                {client.branch}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Member Since</label>
              <div className="flex items-center gap-2 text-gray-900">
                <MapPin className="size-4 text-gray-400" />
                {client.joinDate}
              </div>
            </div>
          </div>

          {client.groupAffiliation && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-gray-600 text-sm mb-1">Group Affiliation</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Users className="size-4 text-gray-400" />
                {client.groupAffiliation}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-gray-600 text-sm mb-1">GPS Location</label>
            <div className="flex items-center gap-2 text-gray-900">
              <MapPin className="size-4 text-gray-400" />
              {client.gpsLocation.lat.toFixed(4)}, {client.gpsLocation.lng.toFixed(4)}
            </div>
            <p className="text-gray-600 text-xs mt-1">
              Verified business/home location for loan assessment
            </p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Shield className="size-5 text-purple-600" />
          <h3 className="text-gray-900">Security</h3>
        </div>
        <div className="p-4 md:p-6 space-y-3">
          <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left flex items-center justify-between">
            <span>Change Password/PIN</span>
            <span className="text-emerald-600 text-sm">Update</span>
          </button>
          <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left flex items-center justify-between">
            <span>Two-Factor Authentication</span>
            <span className="text-gray-600 text-sm">Not Enabled</span>
          </button>
          <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left flex items-center justify-between">
            <span>Login History</span>
            <span className="text-gray-600 text-sm">View</span>
          </button>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Bell className="size-5 text-amber-600" />
          <h3 className="text-gray-900">Communication Preferences</h3>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">SMS Notifications</p>
              <p className="text-gray-600 text-sm">Receive payment reminders via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">Email Notifications</p>
              <p className="text-gray-600 text-sm">Receive statements and updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">Marketing Communications</p>
              <p className="text-gray-600 text-sm">Receive promotional offers and news</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-gray-700 mb-2 text-sm">Preferred Contact Method</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>SMS (Primary)</option>
              <option>Email</option>
              <option>Phone Call</option>
              <option>WhatsApp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <HelpCircle className="size-5 text-blue-600" />
          <h3 className="text-gray-900">Help & Support</h3>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="size-5 text-emerald-600 mt-1" />
            <div>
              <p className="text-gray-900">Customer Service Helpline</p>
              <p className="text-emerald-700">0800 123 456</p>
              <p className="text-gray-600 text-sm">Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="size-5 text-blue-600 mt-1" />
            <div>
              <p className="text-gray-900">Email Support</p>
              <p className="text-blue-700">support@abcmicrofinance.co.ke</p>
              <p className="text-gray-600 text-sm">Response within 24 hours</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="size-5 text-purple-600 mt-1" />
            <div>
              <p className="text-gray-900">Your Branch</p>
              <p className="text-purple-700">{client.branch}</p>
              <p className="text-gray-600 text-sm">Visit us for in-person assistance</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left">
              Frequently Asked Questions (FAQ)
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left mt-2">
              Submit a Support Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-gray-900 mb-2">Data & Privacy</h4>
        <p className="text-gray-600 text-sm mb-3">
          Your personal information is secure with SmartLenderUp. We comply with Kenya&apos;s 
          Data Protection Act and never share your information without consent.
        </p>
        <div className="flex gap-2">
          <button className="text-emerald-600 hover:text-emerald-700 text-sm">
            Privacy Policy
          </button>
          <span className="text-gray-400">|</span>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm">
            Terms of Service
          </button>
          <span className="text-gray-400">|</span>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm">
            Download My Data
          </button>
        </div>
      </div>
    </div>
  );
}

function Users(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}