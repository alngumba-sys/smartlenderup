import { Headphones, Plus, Filter, Phone, Mail, MessageSquare, User as UserIcon, Clock, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

export function TicketsTab() {
  const { isDark } = useTheme();
  const { tickets, clients } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    clientId: '',
    category: 'Other',
    priority: 'Medium',
    channel: 'Phone'
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesStatus && matchesCategory && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-amber-100 text-amber-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Resolved: 'bg-emerald-100 text-emerald-800',
      Closed: 'bg-gray-100 text-gray-800',
      Escalated: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Loan Inquiry': 'bg-purple-100 text-purple-800',
      'Payment Issue': 'bg-red-100 text-red-800',
      'Account Query': 'bg-blue-100 text-blue-800',
      Complaint: 'bg-orange-100 text-orange-800',
      'Technical Issue': 'bg-cyan-100 text-cyan-800',
      'Document Request': 'bg-pink-100 text-pink-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Phone':
        return <Phone className="size-4" />;
      case 'Email':
        return <Mail className="size-4" />;
      case 'SMS':
        return <MessageSquare className="size-4" />;
      case 'Walk-in':
        return <UserIcon className="size-4" />;
      case 'Web Portal':
        return <MessageSquare className="size-4" />;
      default:
        return <MessageSquare className="size-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Customer Service Tickets</h2>
          <p className="text-gray-600">Manage client support requests and inquiries</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Plus className="size-4" />
          Create Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tickets</p>
              <p className="text-gray-900 text-2xl">{tickets.length}</p>
            </div>
            <Headphones className="size-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Open</p>
              <p className="text-gray-900 text-2xl">{tickets.filter(t => t.status === 'Open').length}</p>
            </div>
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {tickets.filter(t => t.status === 'Open').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-gray-900 text-2xl">{tickets.filter(t => t.status === 'In Progress').length}</p>
            </div>
            <Clock className="size-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-gray-900 text-2xl">{tickets.filter(t => t.status === 'Resolved').length}</p>
            </div>
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-900 text-sm">Escalated</p>
              <p className="text-red-900 text-2xl">{tickets.filter(t => t.status === 'Escalated').length}</p>
            </div>
            <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              {tickets.filter(t => t.status === 'Escalated').length}
            </div>
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
            <span className="text-gray-600 text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Escalated">Escalated</option>
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
              <option value="Loan Inquiry">Loan Inquiry</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Account Query">Account Query</option>
              <option value="Complaint">Complaint</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Document Request">Document Request</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-600 ${
              selectedTicket === ticket.id ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 text-sm">{ticket.id}</span>
                    <h3 className="text-gray-900">{ticket.subject}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1 text-gray-600">
                      <UserIcon className="size-4" />
                      <span>{ticket.clientName} ({ticket.clientId})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadge(ticket.category)}`}>
                        {ticket.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      {getChannelIcon(ticket.channel)}
                      <span>{ticket.channel}</span>
                    </div>
                    {ticket.assignedTo && (
                      <div className="text-gray-600">
                        <span className="text-xs">Assigned to: {ticket.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Resolve ticket');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>

              {selectedTicket === ticket.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 text-gray-900">{ticket.createdDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 text-gray-900">{ticket.updatedDate}</span>
                    </div>
                    {ticket.resolvedDate && (
                      <div>
                        <span className="text-gray-600">Resolved:</span>
                        <span className="ml-2 text-gray-900">{ticket.resolvedDate}</span>
                      </div>
                    )}
                    {ticket.resolutionNotes && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Resolution Notes:</span>
                        <p className="mt-1 text-gray-900 bg-emerald-50 p-3 rounded border border-emerald-200">
                          {ticket.resolutionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Headphones className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No tickets match your filters</p>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-gray-100">Create New Ticket</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Client</label>
                <select
                  value={newTicket.clientId}
                  onChange={(e) => setNewTicket({ ...newTicket, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select a client</option>
                  {clients.slice(0, 10).map(client => (
                    <option key={client.id} value={client.id}>{client.name} ({client.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="Loan Inquiry">Loan Inquiry</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Account Query">Account Query</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Document Request">Document Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Channel</label>
                <select
                  value={newTicket.channel}
                  onChange={(e) => setNewTicket({ ...newTicket, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Web Portal">Web Portal</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Ticket created: ${newTicket.subject}`);
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}