import { Bell, AlertTriangle, CheckCircle, Info, Clock, Filter, Mail, MessageSquare, DollarSign, Users } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  category: 'loan' | 'payment' | 'client' | 'system' | 'compliance';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  relatedId?: string;
}

export function NotificationsTab() {
  const { isDark } = useTheme();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesRead = !showUnreadOnly || !notification.read;
    return matchesType && matchesCategory && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="size-5 text-red-600" />;
      case 'warning':
        return <Clock className="size-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="size-5 text-emerald-600" />;
      case 'info':
      default:
        return <Info className="size-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      alert: 'bg-red-100 text-red-800',
      warning: 'bg-amber-100 text-amber-800',
      success: 'bg-emerald-100 text-emerald-800',
      info: 'bg-blue-100 text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loan':
        return <DollarSign className="size-4" />;
      case 'payment':
        return <CheckCircle className="size-4" />;
      case 'client':
        return <Users className="size-4" />;
      case 'compliance':
        return <AlertTriangle className="size-4" />;
      case 'system':
      default:
        return <Info className="size-4" />;
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Notifications Center</h2>
          <p className="text-gray-600">Stay updated on all platform activities and alerts</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
        >
          Mark All as Read
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Notifications</p>
              <p className="text-gray-900 text-2xl">{notifications.length}</p>
            </div>
            <Bell className="size-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-900 text-sm">Unread</p>
              <p className="text-red-900 text-2xl">{unreadCount}</p>
            </div>
            <Mail className="size-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-900 text-sm">Action Required</p>
              <p className="text-amber-900 text-2xl">{actionRequiredCount}</p>
            </div>
            <AlertTriangle className="size-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today</p>
              <p className="text-gray-900 text-2xl">
                {notifications.filter(n => n.timestamp.startsWith('2024-12-08')).length}
              </p>
            </div>
            <Clock className="size-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-600" />
            <span className="text-gray-700 text-sm">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="warning">Warnings</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Categories</option>
              <option value="loan">Loans</option>
              <option value="payment">Payments</option>
              <option value="client">Clients</option>
              <option value="compliance">Compliance</option>
              <option value="system">System</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700 text-sm">Unread only</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg border transition-all ${
              !notification.read 
                ? 'border-emerald-300 shadow-sm' 
                : 'border-gray-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="size-2 rounded-full bg-emerald-600"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadge(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 flex items-center gap-1">
                        {getCategoryIcon(notification.category)}
                        {notification.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {notification.timestamp}
                      </div>
                      {notification.relatedId && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {notification.relatedId}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {notification.actionRequired && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                          Action Required
                        </span>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Bell className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No notifications match your filters</p>
        </div>
      )}
    </div>
  );
}