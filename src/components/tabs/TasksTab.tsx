import { CheckSquare, Plus, Filter, Calendar, User, Tag, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

export function TasksTab() {
  const { isDark } = useTheme();
  const { tasks } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    category: 'Other',
    dueDate: ''
  });

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;
    return matchesStatus && matchesPriority && matchesAssignee;
  });

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignedTo)));

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-amber-100 text-amber-800',
      Urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Completed: 'bg-emerald-100 text-emerald-800',
      Cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Completed' || status === 'Cancelled') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  const handleCreateTask = () => {
    // Add new task to the tasks array
    const newTaskWithId = {
      ...newTask,
      id: `task-${tasks.length + 1}`,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      assignedBy: 'Admin'
    };
    tasks.push(newTaskWithId);
    setShowCreateModal(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'Medium',
      category: 'Other',
      dueDate: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">Task Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage team tasks and assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Plus className="size-4" />
          Create Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tasks</p>
              <p className="text-gray-900 dark:text-white text-2xl">{tasks.length}</p>
            </div>
            <CheckSquare className="size-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Open</p>
              <p className="text-gray-900 dark:text-white text-2xl">{tasks.filter(t => t.status === 'Open').length}</p>
            </div>
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {tasks.filter(t => t.status === 'Open').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">In Progress</p>
              <p className="text-gray-900 dark:text-white text-2xl">{tasks.filter(t => t.status === 'In Progress').length}</p>
            </div>
            <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              {tasks.filter(t => t.status === 'In Progress').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <p className="text-gray-900 dark:text-white text-2xl">{tasks.filter(t => t.status === 'Completed').length}</p>
            </div>
            <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              {tasks.filter(t => t.status === 'Completed').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-900 text-sm">Overdue</p>
              <p className="text-red-900 text-2xl">
                {tasks.filter(t => isOverdue(t.dueDate, t.status)).length}
              </p>
            </div>
            <Clock className="size-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Assigned To:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Staff</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const overdue = isOverdue(task.dueDate, task.status);
          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task.id === selectedTask ? null : task.id)}
              className={`bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-all ${
                overdue ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
              } ${selectedTask === task.id ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900 dark:text-white">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                      {overdue && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <User className="size-4" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="size-4" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="size-4 text-gray-600 dark:text-gray-400" />
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadge(task.category)}`}>
                          {task.category}
                        </span>
                      </div>
                      {task.relatedEntityType && (
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="text-xs">Related: {task.relatedEntityType} {task.relatedEntityId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Mark as completed');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>

                {selectedTask === task.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{task.createdDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Assigned By:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{task.assignedBy}</span>
                      </div>
                      {task.completedDate && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{task.completedDate}</span>
                        </div>
                      )}
                      {task.notes && (
                        <div className="col-span-2">
                          <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{task.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <CheckSquare className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No tasks match your filters</p>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 dark:text-white font-bold">Create New Task</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Enter task information to create a new task</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="size-6" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">Select a staff member</option>
                    {uniqueAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Loan Processing">Loan Processing</option>
                    <option value="Collection">Collection</option>
                    <option value="Client Visit">Client Visit</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <User className="size-4" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}