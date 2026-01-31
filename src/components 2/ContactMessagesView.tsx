import { useState, useEffect } from 'react';
import { Mail, MailOpen, Phone, Calendar, Clock, RefreshCw, Trash2, CheckCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}

export function ContactMessagesView() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setRefreshing(true);
      console.log('📧 Loading contact messages from Supabase...');

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading contact messages:', error);
        toast.error('Failed to load messages');
        return;
      }

      console.log('✅ Loaded contact messages:', data?.length || 0);
      setMessages(data || []);
    } catch (err) {
      console.error('❌ Exception loading contact messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Error marking message as read:', error);
        return;
      }

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } catch (err) {
      console.error('❌ Exception marking message as read:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Error deleting message:', error);
        toast.error('Failed to delete message');
        return;
      }

      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted');
    } catch (err) {
      console.error('❌ Exception deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return msg.status === 'unread';
    if (filter === 'read') return msg.status === 'read';
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(msg => msg.status === 'unread').length,
    read: messages.filter(msg => msg.status === 'read').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-2" style={{ color: '#3b82f6' }} />
          <p style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl flex items-center gap-2" style={{ color: '#e8d1c9' }}>
            <Mail className="size-6" style={{ color: '#3b82f6' }} />
            Contact Messages
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
            Messages from visitors and potential customers
          </p>
        </div>
        
        <button
          onClick={loadMessages}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6'
          }}
        >
          <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={{
          backgroundColor: '#020838',
          border: '1px solid rgba(232, 209, 201, 0.1)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Total Messages</span>
            <Mail className="size-5" style={{ color: '#3b82f6' }} />
          </div>
          <p className="text-3xl" style={{ color: '#e8d1c9' }}>{stats.total}</p>
        </div>

        <div className="rounded-xl p-4" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Unread</span>
            <Mail className="size-5" style={{ color: '#ef4444' }} />
          </div>
          <p className="text-3xl" style={{ color: '#ef4444' }}>{stats.unread}</p>
        </div>

        <div className="rounded-xl p-4" style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Read</span>
            <MailOpen className="size-5" style={{ color: '#10b981' }} />
          </div>
          <p className="text-3xl" style={{ color: '#10b981' }}>{stats.read}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: filter === 'all' ? 'rgba(59, 130, 246, 0.2)' : '#020838',
            border: filter === 'all' ? '1px solid #3b82f6' : '1px solid rgba(232, 209, 201, 0.1)',
            color: filter === 'all' ? '#3b82f6' : 'rgba(232, 209, 201, 0.7)'
          }}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: filter === 'unread' ? 'rgba(239, 68, 68, 0.2)' : '#020838',
            border: filter === 'unread' ? '1px solid #ef4444' : '1px solid rgba(232, 209, 201, 0.1)',
            color: filter === 'unread' ? '#ef4444' : 'rgba(232, 209, 201, 0.7)'
          }}
        >
          Unread ({stats.unread})
        </button>
        <button
          onClick={() => setFilter('read')}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: filter === 'read' ? 'rgba(16, 185, 129, 0.2)' : '#020838',
            border: filter === 'read' ? '1px solid #10b981' : '1px solid rgba(232, 209, 201, 0.1)',
            color: filter === 'read' ? '#10b981' : 'rgba(232, 209, 201, 0.7)'
          }}
        >
          Read ({stats.read})
        </button>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 rounded-xl" style={{
              backgroundColor: '#020838',
              border: '1px solid rgba(232, 209, 201, 0.1)'
            }}>
              <Mail className="size-12 mx-auto mb-3" style={{ color: 'rgba(232, 209, 201, 0.3)' }} />
              <p style={{ color: 'rgba(232, 209, 201, 0.5)' }}>No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{
                  backgroundColor: selectedMessage?.id === message.id 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : message.status === 'unread'
                    ? 'rgba(239, 68, 68, 0.05)'
                    : '#020838',
                  border: selectedMessage?.id === message.id
                    ? '1px solid #3b82f6'
                    : message.status === 'unread'
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(232, 209, 201, 0.1)'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="size-4" style={{ color: '#3b82f6' }} />
                    <span className="font-medium" style={{ color: '#e8d1c9' }}>
                      {message.name}
                    </span>
                    {message.status === 'unread' && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444'
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  {message.status === 'unread' ? (
                    <Mail className="size-4" style={{ color: '#ef4444' }} />
                  ) : (
                    <MailOpen className="size-4" style={{ color: '#10b981' }} />
                  )}
                </div>

                <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                  {message.email}
                </p>

                <p className="text-sm line-clamp-2 mb-2" style={{ color: 'rgba(232, 209, 201, 0.8)' }}>
                  {message.message}
                </p>

                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  <Clock className="size-3" />
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="rounded-xl p-6 sticky top-0" style={{
          backgroundColor: '#020838',
          border: '1px solid rgba(232, 209, 201, 0.1)',
          minHeight: '400px'
        }}>
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl mb-1" style={{ color: '#e8d1c9' }}>
                    {selectedMessage.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
                    <Calendar className="size-4" />
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 rounded-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444'
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                      Email
                    </label>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="text-sm flex items-center gap-2 hover:opacity-80"
                      style={{ color: '#3b82f6' }}
                    >
                      <Mail className="size-4" />
                      {selectedMessage.email}
                    </a>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <label className="text-xs block mb-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                        Phone
                      </label>
                      <a 
                        href={`tel:${selectedMessage.phone}`}
                        className="text-sm flex items-center gap-2 hover:opacity-80"
                        style={{ color: '#3b82f6' }}
                      >
                        <Phone className="size-4" />
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                      Status
                    </label>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{
                      backgroundColor: selectedMessage.status === 'unread' 
                        ? 'rgba(239, 68, 68, 0.15)' 
                        : 'rgba(16, 185, 129, 0.15)',
                      color: selectedMessage.status === 'unread' ? '#ef4444' : '#10b981'
                    }}>
                      {selectedMessage.status === 'unread' ? <Mail className="size-4" /> : <CheckCircle className="size-4" />}
                      {selectedMessage.status === 'unread' ? 'Unread' : 'Read'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                <label className="text-xs block mb-2" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  Message
                </label>
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'rgba(232, 209, 201, 0.05)',
                  border: '1px solid rgba(232, 209, 201, 0.1)'
                }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#e8d1c9' }}>
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Your message to SmartLenderUp`}
                  className="flex-1 px-4 py-2 rounded-lg text-center transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    color: '#ffffff'
                  }}
                >
                  Reply via Email
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="px-4 py-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3b82f6'
                    }}
                  >
                    Call
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Mail className="size-16 mb-4" style={{ color: 'rgba(232, 209, 201, 0.2)' }} />
              <p className="text-lg" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                Select a message to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      {stats.unread > 0 && (
        <div className="rounded-lg p-4" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <p className="text-sm" style={{ color: '#ef4444' }}>
            <strong>⚠️ Attention:</strong> You have {stats.unread} unread message{stats.unread > 1 ? 's' : ''} waiting for your response.
          </p>
        </div>
      )}
    </div>
  );
}
