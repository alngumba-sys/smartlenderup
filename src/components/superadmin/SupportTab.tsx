import { useState } from 'react';
import { Mail, MessageSquare, CheckCircle, Clock, X, Eye, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface SupportTicket {
  id: string;
  type: 'contact_form' | 'support_ticket';
  from: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  user_type: 'lender' | 'borrower';
}

export function SupportTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');

  const filteredTickets = tickets.filter(ticket => 
    statusFilter === 'all' || ticket.status === statusFilter
  );

  const updateTicketStatus = (ticketId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleSendReply = () => {
    if (replyMessage.trim() && selectedTicket) {
      // In real app, this would send email/notification
      alert(`Reply sent to ${selectedTicket.email}:\n\n${replyMessage}`);
      updateTicketStatus(selectedTicket.id, 'resolved');
      setReplyMessage('');
      setSelectedTicket(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Support Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Manage contact forms and support tickets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="size-4" style={{ color: '#f59e0b' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>New</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
            {tickets.filter(t => t.status === 'new').length}
          </p>
        </div>
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4" style={{ color: '#3b82f6' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>In Progress</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
            {tickets.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4" style={{ color: '#10b981' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Resolved</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
            {tickets.filter(t => t.status === 'resolved').length}
          </p>
        </div>
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="size-4" style={{ color: '#ec7347' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
            {tickets.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: '#032b43',
            border: '1px solid rgba(232, 209, 201, 0.2)',
            color: '#e8d1c9'
          }}
        >
          <option value="all">All Tickets</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#154F73' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Ticket ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>From</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  No tickets found
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket, index) => (
                <tr 
                  key={ticket.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-medium" style={{ color: '#e8d1c9' }}>{ticket.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{ticket.from}</p>
                      <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{ticket.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#e8d1c9' }}>{ticket.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ 
                      backgroundColor: ticket.type === 'contact_form' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 115, 71, 0.1)',
                      color: ticket.type === 'contact_form' ? '#3b82f6' : '#ec7347'
                    }}>
                      {ticket.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getPriorityColor(ticket.priority) }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(ticket.status) }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: '#3b82f6' }}
                        title="View & Reply"
                      >
                        <Eye className="size-4" />
                      </button>
                      {ticket.status !== 'resolved' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#10b981' }}
                          title="Mark Resolved"
                        >
                          <CheckCircle className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(2, 8, 56, 0.95)' }}>
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.3)' }}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#154F73', borderBottom: '1px solid rgba(236, 115, 71, 0.2)' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Support Ticket Details</h3>
              <button onClick={() => setSelectedTicket(null)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#e8d1c9' }}>
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Ticket ID</p>
                  <p className="text-sm font-mono" style={{ color: '#e8d1c9' }}>{selectedTicket.id}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Status</p>
                  <span className="text-sm font-medium capitalize" style={{ color: getStatusColor(selectedTicket.status) }}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>From</p>
                  <p className="text-sm" style={{ color: '#e8d1c9' }}>{selectedTicket.from}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Email</p>
                  <p className="text-sm" style={{ color: '#e8d1c9' }}>{selectedTicket.email}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Priority</p>
                  <span className="text-sm font-medium capitalize" style={{ color: getPriorityColor(selectedTicket.priority) }}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Created</p>
                  <p className="text-sm" style={{ color: '#e8d1c9' }}>
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Subject</p>
                <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{selectedTicket.subject}</p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Message</p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#e8d1c9' }}>{selectedTicket.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#ec7347' }}>Send Reply</p>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{
                    backgroundColor: '#020838',
                    border: '1px solid rgba(232, 209, 201, 0.2)',
                    color: '#e8d1c9'
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-opacity"
                  style={{ 
                    backgroundColor: '#ec7347', 
                    color: '#ffffff',
                    opacity: !replyMessage.trim() ? 0.5 : 1,
                    cursor: !replyMessage.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send className="size-4" />
                  Send Reply & Mark Resolved
                </button>
                {selectedTicket.status === 'new' && (
                  <button
                    onClick={() => {
                      updateTicketStatus(selectedTicket.id, 'in_progress');
                    }}
                    className="px-6 py-2.5 rounded-lg font-medium"
                    style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  >
                    Mark In Progress
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}