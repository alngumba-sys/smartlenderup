import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  TrendingUp,
  Mail,
  MessageSquare,
  Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientNotificationsTabProps {
  clientId: string;
}

interface Notification {
  id: string;
  type: 'payment_reminder' | 'payment_received' | 'overdue_warning' | 'rate_change' | 'account_update' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function ClientNotificationsTab({ clientId }: ClientNotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [clientId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch client's active loans to generate notifications
      const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('client_id', clientId)
        .in('status', ['Active', 'In Arrears']);

      // Generate sample notifications based on loan data
      const sampleNotifications: Notification[] = [];

      loans?.forEach((loan, index) => {
        if (loan.days_in_arrears > 0) {
          sampleNotifications.push({
            id: `overdue-${loan.id}`,
            type: 'overdue_warning',
            title: 'Payment Overdue',
            message: `Your payment for loan ${loan.loan_number} is ${loan.days_in_arrears} days overdue. Please make a payment as soon as possible to avoid late fees.`,
            date: new Date(Date.now() - loan.days_in_arrears * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: 'high'
          });
        } else {
          sampleNotifications.push({
            id: `reminder-${loan.id}`,
            type: 'payment_reminder',
            title: 'Payment Due Soon',
            message: `Your next payment for loan ${loan.loan_number} is due in 7 days. Amount due: KES ${Math.round(loan.total_repayable / loan.term).toLocaleString()}`,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: index > 0,
            priority: 'medium'
          });
        }
      });

      // Add some general notifications
      sampleNotifications.push({
        id: 'welcome',
        type: 'account_update',
        title: 'Welcome to BV Funguo Client Portal',
        message: 'Welcome to your new client portal! You can now view your loans, make payments, and manage your account online 24/7.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low'
      });

      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return <Calendar className="size-5 text-blue-600" />;
      case 'payment_received':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'overdue_warning':
        return <AlertTriangle className="size-5 text-red-600" />;
      case 'rate_change':
        return <TrendingUp className="size-5 text-orange-600" />;
      case 'account_update':
        return <Info className="size-5 text-purple-600" />;
      default:
        return <Bell className="size-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-white border-gray-200';
    
    switch (type) {
      case 'overdue_warning':
        return 'bg-red-50 border-red-200';
      case 'payment_reminder':
        return 'bg-blue-50 border-blue-200';
      case 'payment_received':
        return 'bg-green-50 border-green-200';
      case 'rate_change':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'important') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#FFF5E1] min-h-full">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[#111120] text-2xl mb-2">Notifications & Alerts</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? (
                <>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</>
              ) : (
                <>You're all caught up!</>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'important'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Important ({notifications.filter(n => n.priority === 'high').length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Bell className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-[#111120] mb-2">No Notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You've read all your notifications" 
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && markAsRead(notification.id)}
              className={`bg-white rounded-xl border shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                getNotificationBgColor(notification.type, notification.read)
              }`}
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-lg ${
                  notification.read ? 'bg-gray-100' : 'bg-white'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-[#111120] font-medium ${
                      !notification.read ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="size-2 bg-emerald-600 rounded-full ml-2 mt-2"></div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(notification.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {notification.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        High Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="size-6 text-gray-600" />
          <h2 className="text-[#111120] text-lg">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-blue-600" />
              <div>
                <p className="text-[#111120] font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="size-5 text-green-600" />
              <div>
                <p className="text-[#111120] font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> You'll always receive important notifications about payment due dates and account security via both email and SMS, regardless of your preferences.
          </p>
        </div>
      </div>

      {/* Notification Types Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-[#111120] font-medium mb-4">What notifications will I receive?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <Calendar className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111120] font-medium text-sm">Payment Reminders</p>
              <p className="text-gray-600 text-xs">Sent 7 days before payment is due</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111120] font-medium text-sm">Overdue Notices</p>
              <p className="text-gray-600 text-xs">Sent when payment is overdue</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111120] font-medium text-sm">Payment Confirmations</p>
              <p className="text-gray-600 text-xs">Sent when payment is received</p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingUp className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111120] font-medium text-sm">Rate Changes</p>
              <p className="text-gray-600 text-xs">Sent when interest rates change</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Info className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111120] font-medium text-sm">Account Updates</p>
              <p className="text-gray-600 text-xs">Important account information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Bell className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111120] font-medium text-sm">System Notifications</p>
              <p className="text-gray-600 text-xs">Platform updates and maintenance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
