'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Package,
  ShoppingBag,
  FolderTree,
  Ticket,
  Star,
  Image as ImageIcon,
  Settings,
  LayoutDashboard,
  CheckSquare,
  Square
} from 'lucide-react';
import { employeeService, Employee, ADMIN_SECTIONS, SectionDefinition } from '../../../lib/services/employeeService';
import { authService } from '../../../lib/services/authService';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function EmployeesManagementPage() {
  const router = useRouter();
  const isBoss = authService.isBoss();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeTitle, setEmployeeTitle] = useState('Staff Specialist');
  const [phone, setPhone] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Protect page: Only Boss can view
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    if (!isBoss) {
      router.push(authService.getFirstAllowedRoute());
      return;
    }
    loadEmployees();
  }, [router, isBoss]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setToastMsg(`Error loading employees: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPassword('');
    setEmployeeTitle('Staff Member');
    setPhone('');
    setSelectedPermissions(['products']); // default safe preset
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPassword(''); // leave blank to keep unchanged
    setEmployeeTitle(emp.employeeTitle || 'Staff Member');
    setPhone(emp.phone || '');
    setSelectedPermissions(Array.isArray(emp.permissions) ? emp.permissions : []);
    setFormError('');
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Quick Preset Handlers
  const applyPreset = (presetName: 'products' | 'orders' | 'catalog' | 'all' | 'clear') => {
    switch (presetName) {
      case 'products':
        setSelectedPermissions(['products', 'categories']);
        setEmployeeTitle('Products & Inventory Specialist');
        break;
      case 'orders':
        setSelectedPermissions(['orders']);
        setEmployeeTitle('Order Dispatcher & Fulfillment');
        break;
      case 'catalog':
        setSelectedPermissions(['products', 'categories', 'coupons', 'banners']);
        setEmployeeTitle('Catalog & Marketing Manager');
        break;
      case 'all':
        setSelectedPermissions(ADMIN_SECTIONS.map((s) => s.id));
        setEmployeeTitle('Senior Store Associate');
        break;
      case 'clear':
        setSelectedPermissions([]);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('Name and email are required');
      return;
    }

    if (!editingEmployee && (!password || password.length < 6)) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (editingEmployee && password && password.trim().length < 6) {
      setFormError('New password must be at least 6 characters long');
      return;
    }

    if (selectedPermissions.length === 0) {
      setFormError('Please select at least 1 section that this employee is allowed to access.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, {
          name: name.trim(),
          email: email.trim(),
          employeeTitle: employeeTitle.trim(),
          permissions: selectedPermissions,
          phone: phone.trim(),
          ...(password ? { password: password.trim() } : {}),
        });
        setToastMsg(`Employee "${name}" updated successfully!`);
      } else {
        await employeeService.createEmployee({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          employeeTitle: employeeTitle.trim(),
          permissions: selectedPermissions,
          phone: phone.trim(),
        });
        setToastMsg(`Employee "${name}" created with assigned section access!`);
      }

      setIsModalOpen(false);
      await loadEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Action failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await employeeService.updateEmployee(emp.id, { status: nextStatus });
      setToastMsg(`Employee "${emp.name}" is now ${nextStatus}`);
      await loadEmployees();
    } catch (err: any) {
      setToastMsg(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await employeeService.deleteEmployee(deleteTarget.id);
      setToastMsg(`Employee "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await loadEmployees();
    } catch (err: any) {
      setToastMsg(`Failed to delete employee: ${err.message}`);
    }
  };

  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const suspendedCount = employees.filter((e) => e.status !== 'Active').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast notifications */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
                Employees
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Create employee logins and select which specific sections each employee can see and manage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadEmployees}
            disabled={isLoading}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl border border-zinc-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold">TOTAL EMPLOYEES</span>
          <div className="text-2xl font-serif font-black text-white">{employees.length}</div>
          <span className="text-[10px] text-zinc-400">Team members with delegated access</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-mono uppercase text-emerald-400/90 font-bold">ACTIVE EMPLOYEES</span>
          <div className="text-2xl font-serif font-black text-emerald-400">{activeCount}</div>
          <span className="text-[10px] text-zinc-400">Currently granted access to admin portal</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">SECTION GRANULARITY</span>
          <div className="text-2xl font-serif font-black text-amber-400">9 Sections</div>
          <span className="text-[10px] text-zinc-400">Independent permissions available</span>
        </div>
      </div>

      {/* Employees Grid Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Active Employee Roster</h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {employees.length} {employees.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-5 font-bold">Employee</th>
                <th className="py-4 px-4 font-bold">Designated Role</th>
                <th className="py-4 px-5 font-bold">Allowed Admin Sections</th>
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs">
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Loading team permissions...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <Users className="w-10 h-10 text-zinc-700 mx-auto" />
                      <div className="font-bold text-white text-sm">No Employees Created Yet</div>
                      <p className="text-xs text-zinc-400">
                        Add an employee (e.g. for Products only or Orders only) to restrict their view and delegate store operations safely.
                      </p>
                      <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase"
                      >
                        Create First Employee
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const perms = Array.isArray(emp.permissions) ? emp.permissions : [];
                  const isActive = emp.status === 'Active';

                  return (
                    <tr key={emp.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 uppercase">
                            {emp.name.substring(0, 2)}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-white">{emp.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-zinc-500" />
                              <span>{emp.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-white text-xs font-bold">
                          {emp.employeeTitle || 'Staff Member'}
                        </span>
                      </td>

                      {/* Allowed Sections Pill Badges */}
                      <td className="py-4 px-5 max-w-md">
                        {perms.length === 0 ? (
                          <span className="text-[11px] text-amber-400/80 font-mono italic">
                            ⚠️ No sections assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {perms.map((p) => {
                              const sec = ADMIN_SECTIONS.find((s) => s.id === p);
                              return (
                                <span
                                  key={p}
                                  className="inline-block px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-zinc-200"
                                >
                                  {sec?.label.split(' ')[0] || p}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                          }`}
                          title="Click to toggle Active / Suspended status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span>{isActive ? 'Active' : 'Suspended'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl transition-colors cursor-pointer"
                            title="Edit Permissions & Title"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(emp)}
                            className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
                  <span>{editingEmployee ? 'Edit Employee Permissions' : 'Add New Employee'}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Choose which sections of the store this employee can see and work on.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Basic Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5 uppercase">
                    Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@jerseyjunction.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5 uppercase">
                    {editingEmployee ? 'New Password (Optional)' : 'Login Password *'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingEmployee ? 'Leave empty to keep current password' : 'Min 6 characters'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5 uppercase">
                    Job Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Orders Manager or Catalog Associate"
                    value={employeeTitle}
                    onChange={(e) => setEmployeeTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Quick Presets Toolbar */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Role Presets</span>
                  <span className="text-[10px] text-zinc-500">Click to apply common role templates</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('products')}
                    className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    📦 Only Products
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('orders')}
                    className="px-3 py-1.5 bg-sky-400/10 hover:bg-sky-400/20 text-sky-400 border border-sky-400/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    🛍️ Only Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('catalog')}
                    className="px-3 py-1.5 bg-purple-400/10 hover:bg-purple-400/20 text-purple-400 border border-purple-400/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    🏷️ Catalog &amp; Marketing
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="px-3 py-1.5 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    ⚡ Full Store Access
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-xs font-bold cursor-pointer transition-colors ml-auto"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Interactive Section Checkboxes Grid */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-300 uppercase tracking-wider block">
                    Assigned Admin Sections ({selectedPermissions.length} selected)
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {selectedPermissions.length === 0 ? '⚠️ No section selected' : 'Permissions configured'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADMIN_SECTIONS.map((sec) => {
                    const isChecked = selectedPermissions.includes(sec.id);
                    return (
                      <div
                        key={sec.id}
                        onClick={() => togglePermission(sec.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-amber-400/10 border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Square className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className={`font-bold text-xs ${isChecked ? 'text-amber-300' : 'text-zinc-200'}`}>
                            <span>{sec.label}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-snug">
                            {sec.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingEmployee ? 'Update Permissions' : 'Create Employee Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Employee Account"
          message={`Are you sure you want to remove employee "${deleteTarget.name}"? They will instantly lose all access to the admin portal.`}
          confirmText="Yes, Delete Account"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
