import { X, CheckSquare, User, Calendar, Tag, Clock, FileText, MessageSquare } from 'lucide-react';
import { tasks, clients, loans } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface TaskDetailsModalProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetailsModal({ taskId, onClose }: TaskDetailsModalProps) {
  const { isDark } = useTheme();
  const task = tasks.find(t => t.id === taskId);
  
  // Get related entity details
  const relatedClient = task?.relatedEntityType === 'Client' 
    ? clients.find(c => c.id === task.relatedEntityId)
    : null;
  
  const relatedLoan = task?.relatedEntityType === 'Loan'
    ? loans.find(l => l.id === task.relatedEntityId)
    : null;

  if (!task) {
    return null;
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800 border-gray-200',
      Medium: 'bg-blue-100 text-blue-800 border-blue-200',
      High: 'bg-amber-100 text-amber-800 border-amber-200',
      Urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
      Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Loan Processing': 'bg-purple-100 text-purple-800',
      Collection: 'bg-red-100 text-red-800',
      'Client Visit': 'bg-blue-100 text-blue-800',
      Documentation: 'bg-cyan-100 text-cyan-800',
      Compliance: 'bg-amber-100 text-amber-800',
      'Follow-up': 'bg-pink-100 text-pink-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = () => {
    if (task.status === 'Completed' || task.status === 'Cancelled') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    return due < today;
  };

  const daysUntilDue = () => {
    const due = new Date(task.dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysDiff = daysUntilDue();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CheckSquare className="size-6 text-blue-600" />
            <div>
              <h2 className="text-gray-900">{task.title}</h2>
              <p className="text-gray-600 text-sm">{task.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1.5 rounded-lg border ${getStatusBadge(task.status)}`}>
              {task.status}
            </span>
            <span className={`px-3 py-1.5 rounded-lg border ${getPriorityBadge(task.priority)}`}>
              {task.priority} Priority
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadge(task.category)}`}>
              {task.category}
            </span>
            {isOverdue() && (
              <span className="px-3 py-1.5 rounded-lg border bg-red-100 text-red-800 border-red-200">
                Overdue by {Math.abs(daysDiff)} days
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Task Details */}
          <div>
            <h3 className="text-gray-900 mb-3">Task Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="size-4 text-gray-600" />
                  <p className="text-gray-600 text-sm">Assigned To</p>
                </div>
                <p className="text-gray-900">{task.assignedTo}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="size-4 text-gray-600" />
                  <p className="text-gray-600 text-sm">Assigned By</p>
                </div>
                <p className="text-gray-900">{task.assignedBy}</p>
              </div>

              <div className={`p-4 rounded-lg border ${
                isOverdue() ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-gray-600" />
                  <p className="text-gray-600 text-sm">Due Date</p>
                </div>
                <p className={isOverdue() ? 'text-red-900' : 'text-gray-900'}>
                  {task.dueDate}
                </p>
                {!isOverdue() && daysDiff >= 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {daysDiff === 0 ? 'Due today' : `${daysDiff} days remaining`}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-gray-600" />
                  <p className="text-gray-600 text-sm">Created Date</p>
                </div>
                <p className="text-gray-900">{task.createdDate}</p>
              </div>

              {task.completedDate && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="size-4 text-emerald-600" />
                    <p className="text-emerald-700 text-sm">Completed Date</p>
                  </div>
                  <p className="text-emerald-900">{task.completedDate}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Entity */}
          {task.relatedEntityType && (
            <div>
              <h3 className="text-gray-900 mb-3">Related {task.relatedEntityType}</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-blue-600" />
                    <span className="text-blue-900">
                      {task.relatedEntityType}: {task.relatedEntityId}
                    </span>
                  </div>
                  
                  {relatedClient && (
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Name: {relatedClient.name}</p>
                      <p>Phone: {relatedClient.phone}</p>
                      <p>Business: {relatedClient.businessType}</p>
                      <p>Branch: {relatedClient.branch}</p>
                    </div>
                  )}

                  {relatedLoan && (
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Principal: KES {relatedLoan.principalAmount.toLocaleString()}</p>
                      <p>Outstanding: KES {relatedLoan.outstandingBalance.toLocaleString()}</p>
                      <p>Status: {relatedLoan.status}</p>
                      <p>Days in Arrears: {relatedLoan.daysInArrears}</p>
                    </div>
                  )}
                </div>
                <button className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  View {task.relatedEntityType} Details
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h3 className="text-gray-900 mb-3">Notes</h3>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <FileText className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-900 text-sm leading-relaxed">{task.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div>
            <h3 className="text-gray-900 mb-3">Activity Log</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                  {task.assignedBy.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 text-sm">{task.assignedBy} created this task</span>
                  </div>
                  <div className="text-xs text-gray-600">{task.createdDate}</div>
                </div>
              </div>

              {task.status !== 'Open' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="size-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                    {task.assignedTo.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 text-sm">
                        {task.assignedTo} changed status to {task.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {task.completedDate || task.createdDate}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-gray-900 mb-3">Comments</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                    SM
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 text-sm">Sarah Mutua</span>
                      <span className="text-gray-500 text-xs">2 days ago</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      I will handle this task today. Planning to visit the client in the afternoon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                    VM
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 text-sm">Victor Muthama</span>
                      <span className="text-gray-500 text-xs">2 days ago</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      I will handle this task today. Planning to visit the client in the afternoon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <MessageSquare className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            Close
          </button>
          <div className="flex gap-2">
            {task.status !== 'Completed' && task.status !== 'Cancelled' && (
              <>
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">
                  Reassign Task
                </button>
                {task.status !== 'In Progress' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Start Working
                  </button>
                )}
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
                  Mark as Complete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}