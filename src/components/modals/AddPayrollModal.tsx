import { X, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData, PayrollEmployee } from '../../contexts/DataContext';
import { getCurrencyCode, getMobileMoneyProviders } from '../../utils/currencyUtils';
import { toast } from 'sonner';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
import { AddPayeeModal } from './AddPayeeModal';

interface AddPayrollModalProps {
  onClose: () => void;
}

export function AddPayrollModal({ onClose }: AddPayrollModalProps) {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const mobileMoneyProviders = getMobileMoneyProviders();
  const { payees, addPayrollRun } = useData();
  
  const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
  const userName = currentUser.name || 'System User';

  // Get employee payees
  const employeePayees = payees.filter(p => (p.type === 'Employee' || p.category === 'Employee') && p.status === 'Active');

  const [period, setPeriod] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showAddPayeeModal, setShowAddPayeeModal] = useState(false);

  const addEmployee = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    const payee = employeePayees.find(p => p.id === selectedEmployee);
    if (!payee) return;

    // Check if employee already added
    if (employees.find(e => e.payeeId === selectedEmployee)) {
      toast.error('Employee already added to this payroll');
      return;
    }

    const newEmployee: PayrollEmployee = {
      id: `PEMP${Date.now()}`,
      payeeId: payee.id,
      employeeName: payee.name,
      position: '',
      baseSalary: 0,
      allowances: [],
      deductions: [],
      grossPay: 0,
      totalDeductions: 0,
      netPay: 0,
      paymentMethod: mobileMoneyProviders.length > 0 ? mobileMoneyProviders[0] : 'Bank Transfer',
      status: 'Pending'
    };

    setEmployees([...employees, newEmployee]);
    setSelectedEmployee('');
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const updateEmployee = (id: string, updates: Partial<PayrollEmployee>) => {
    setEmployees(employees.map(e => {
      if (e.id === id) {
        const updatedEmployee = { ...e, ...updates };
        
        // Recalculate totals
        const totalAllowances = updatedEmployee.allowances.reduce((sum, a) => sum + a.amount, 0);
        const totalDeductions = updatedEmployee.deductions.reduce((sum, d) => sum + d.amount, 0);
        const grossPay = updatedEmployee.baseSalary + totalAllowances;
        const netPay = grossPay - totalDeductions;

        return {
          ...updatedEmployee,
          grossPay,
          totalDeductions,
          netPay
        };
      }
      return e;
    }));
  };

  const addAllowance = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      updateEmployee(employeeId, {
        allowances: [...employee.allowances, { name: 'Allowance', amount: 0 }]
      });
    }
  };

  const updateAllowance = (employeeId: string, index: number, name: string, amount: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const newAllowances = [...employee.allowances];
      newAllowances[index] = { name, amount };
      updateEmployee(employeeId, { allowances: newAllowances });
    }
  };

  const removeAllowance = (employeeId: string, index: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const newAllowances = employee.allowances.filter((_, i) => i !== index);
      updateEmployee(employeeId, { allowances: newAllowances });
    }
  };

  const addDeduction = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      updateEmployee(employeeId, {
        deductions: [...employee.deductions, { name: 'NSSF', amount: 0, type: 'NSSF' }]
      });
    }
  };

  const updateDeduction = (employeeId: string, index: number, name: string, amount: number, type: 'NSSF' | 'NHIF' | 'PAYE' | 'Loan' | 'Advance' | 'Other') => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const newDeductions = [...employee.deductions];
      newDeductions[index] = { name, amount, type };
      updateEmployee(employeeId, { deductions: newDeductions });
    }
  };

  const removeDeduction = (employeeId: string, index: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const newDeductions = employee.deductions.filter((_, i) => i !== index);
      updateEmployee(employeeId, { deductions: newDeductions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('create payroll');
    if (!isConnected) {
      return; // Block the operation if offline
    }

    if (employees.length === 0) {
      toast.error('Please add at least one employee');
      return;
    }

    if (!period) {
      toast.error('Please enter a payroll period');
      return;
    }

    const totalGrossPay = employees.reduce((sum, e) => sum + e.grossPay, 0);
    const totalDeductions = employees.reduce((sum, e) => sum + e.totalDeductions, 0);
    const totalNetPay = employees.reduce((sum, e) => sum + e.netPay, 0);

    try {
      await addPayrollRun({
        period,
        payDate,
        employees,
        totalGrossPay,
        totalDeductions,
        totalNetPay,
        status: 'Draft',
        createdBy: userName,
        notes: ''
      });

      toast.success('Payroll run created successfully!');
      onClose();
    } catch (error) {
      // Error already handled in addPayrollRun
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 dark:text-white">Create New Payroll Run</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Payroll Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Payroll Period <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                placeholder="e.g., December 2024"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                required
              />
            </div>
          </div>

          {/* Add Employee */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-gray-900 dark:text-white">Add Employees</h4>
              <button
                type="button"
                onClick={() => setShowAddPayeeModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus className="size-4" />
                Create New Employee
              </button>
            </div>
            <div className="flex gap-3 mb-4">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              >
                <option value="">Select employee...</option>
                {employeePayees.map(payee => (
                  <option key={payee.id} value={payee.id}>{payee.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="size-4" />
                Add Employee
              </button>
            </div>

            {employeePayees.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  No employees found. Click "Create New Employee" above to add your first employee.
                </p>
              </div>
            )}
          </div>

          {/* Employee List */}
          {employees.length > 0 && (
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <div key={employee.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="text-gray-900 dark:text-white">{employee.employeeName}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Employee #{index + 1}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEmployee(employee.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Position</label>
                      <input
                        type="text"
                        value={employee.position}
                        onChange={(e) => updateEmployee(employee.id, { position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                        placeholder="e.g., Loan Officer"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Base Salary</label>
                      <input
                        type="number"
                        value={employee.baseSalary}
                        onChange={(e) => updateEmployee(employee.id, { baseSalary: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Payment Method</label>
                      <select
                        value={employee.paymentMethod}
                        onChange={(e) => updateEmployee(employee.id, { paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      >
                        {mobileMoneyProviders.map(provider => (
                          <option key={provider} value={provider}>{provider}</option>
                        ))}
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  {/* Allowances */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm">Allowances</label>
                      <button
                        type="button"
                        onClick={() => addAllowance(employee.id)}
                        className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                      >
                        + Add Allowance
                      </button>
                    </div>
                    {employee.allowances.map((allowance, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={allowance.name}
                          onChange={(e) => updateAllowance(employee.id, i, e.target.value, allowance.amount)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          placeholder="Allowance name"
                        />
                        <input
                          type="number"
                          value={allowance.amount}
                          onChange={(e) => updateAllowance(employee.id, i, allowance.name, parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => removeAllowance(employee.id, i)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Deductions */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm">Deductions</label>
                      <button
                        type="button"
                        onClick={() => addDeduction(employee.id)}
                        className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                      >
                        + Add Deduction
                      </button>
                    </div>
                    {employee.deductions.map((deduction, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <select
                          value={deduction.type}
                          onChange={(e) => updateDeduction(employee.id, i, deduction.name, deduction.amount, e.target.value as any)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                        >
                          <option value="NSSF">NSSF</option>
                          <option value="NHIF">NHIF</option>
                          <option value="PAYE">PAYE</option>
                          <option value="Loan">Loan</option>
                          <option value="Advance">Advance</option>
                          <option value="Other">Other</option>
                        </select>
                        <input
                          type="text"
                          value={deduction.name}
                          onChange={(e) => updateDeduction(employee.id, i, e.target.value, deduction.amount, deduction.type)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          placeholder="Deduction name"
                        />
                        <input
                          type="number"
                          value={deduction.amount}
                          onChange={(e) => updateDeduction(employee.id, i, deduction.name, parseFloat(e.target.value) || 0, deduction.type)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => removeDeduction(employee.id, i)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gross Pay</p>
                      <p className="text-sm text-gray-900 dark:text-white">{currencyCode} {employee.grossPay.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Deductions</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">{currencyCode} {employee.totalDeductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Pay</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">{currencyCode} {employee.netPay.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Summary */}
          {employees.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="text-gray-900 dark:text-white mb-3">Payroll Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gross Pay</p>
                  <p className="text-lg text-gray-900 dark:text-white">{currencyCode} {employees.reduce((sum, e) => sum + e.grossPay, 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Deductions</p>
                  <p className="text-lg text-orange-600 dark:text-orange-400">{currencyCode} {employees.reduce((sum, e) => sum + e.totalDeductions, 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Net Pay</p>
                  <p className="text-lg text-emerald-600 dark:text-emerald-400">{currencyCode} {employees.reduce((sum, e) => sum + e.netPay, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Save className="size-4" />
            Create Payroll Run
          </button>
        </div>
      </div>

      {/* Add Payee Modal */}
      {showAddPayeeModal && (
        <AddPayeeModal 
          onClose={() => setShowAddPayeeModal(false)}
          defaultCategory="Employee"
        />
      )}
    </div>
  );
}