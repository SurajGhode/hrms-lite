import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormField, { inputStyle, selectStyle } from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { Users, Plus, Search, Trash2, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering','Marketing','Sales','HR','Finance','Operations','Design','Product','Legal','Other'];

const initialForm = { employee_id: '', full_name: '', email: '', department: '' };

function EmployeeForm({ onSubmit, loading, errors }) {
  const [form, setForm] = useState(initialForm);
  const [loadingNextId, setLoadingNextId] = useState(true);

  useEffect(() => {
    setLoadingNextId(true);
    employeeAPI.getNextId()
      .then(r => {
        setForm(p => ({ ...p, employee_id: r.data.next_id }));
      })
      .catch(() => {}) // silently fail, user can type manually
      .finally(() => setLoadingNextId(false));
  }, []);


  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

   return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <FormField label="Employee ID" required error={errors?.employee_id?.[0]}>
          <div style={{ position: 'relative' }}>
            <input
              style={{
                ...inputStyle(!!errors?.employee_id),
                paddingRight: 80,
                opacity: loadingNextId ? 0.6 : 1,
              }}
              value={form.employee_id}
              onChange={e => set('employee_id', e.target.value)}
              placeholder="e.g. EMP-001"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors?.employee_id ? 'var(--red)' : 'var(--border)'}
            />
            {/* Suggested badge shown inside input */}
            {loadingNextId ? (
              <span style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 11, color: 'var(--text-muted)',
              }}>
                loading...
              </span>
            ) : (
              <span style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10, color: 'var(--green)',
                background: 'var(--green-bg)',
                padding: '2px 6px', borderRadius: 4,
                fontWeight: 600, pointerEvents: 'none',
              }}>
                suggested
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Auto-suggested · you can edit it
          </span>
        </FormField>

        <FormField label="Department" required error={errors?.department?.[0]}>
          <select
            style={selectStyle(!!errors?.department)}
            value={form.department}
            onChange={e => set('department', e.target.value)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Full Name" required error={errors?.full_name?.[0]}>
        <input
          style={inputStyle(!!errors?.full_name)}
          value={form.full_name}
          onChange={e => set('full_name', e.target.value)}
          placeholder="John Doe"
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = errors?.full_name ? 'var(--red)' : 'var(--border)'}
        />
      </FormField>

      <FormField label="Email Address" required error={errors?.email?.[0]}>
        <input
          type="email"
          style={inputStyle(!!errors?.email)}
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="john.doe@company.com"
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = errors?.email ? 'var(--red)' : 'var(--border)'}
        />
      </FormField>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <Button type="submit" loading={loading}>Add Employee</Button>
      </div>
    </form>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (dept) params.department = dept;
    employeeAPI.list(params)
      .then(r => setEmployees(r.data.results))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  }, [search, dept]);

  useEffect(() => {
    const t = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(t);
  }, [fetchEmployees]);

  const handleAdd = async (data) => {
    setAddLoading(true); setAddErrors({});
    try {
      await employeeAPI.create(data);
      toast.success('Employee added successfully');
      setShowAdd(false);
      fetchEmployees();
    } catch (err) {
      if (err.errors) setAddErrors(err.errors);
      else toast.error(err.friendlyMessage || 'Failed to add employee');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await employeeAPI.delete(deleteTarget.id);
      toast.success(`${deleteTarget.full_name} deleted`);
      setDeleteTarget(null);
      fetchEmployees();
    } catch {
      toast.error('Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Employees</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{employees.length} total</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Employee</Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            style={{ ...inputStyle(), paddingLeft: 34 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or email..."
          />
        </div>
        <select style={{ ...selectStyle(), width: 180, flex: '0 0 auto' }}
          value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={fetchEmployees}>Refresh</Button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <PageLoader /> : employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description={search || dept ? "Try adjusting your search or filters." : "Add your first employee to get started."}
            action={!search && !dept && (
              <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Employee</Button>
            )}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Employee ID', 'Name', 'Email', 'Department', 'Present Days', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                      color: 'var(--text-muted)', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp.id}
                    style={{
                      borderBottom: i < employees.length - 1 ? '1px solid var(--border-light)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', background: 'rgba(88,166,255,0.08)', padding: '2px 7px', borderRadius: 4 }}>
                        {emp.employee_id}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{emp.full_name}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>{emp.email}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-3)', padding: '2px 9px', borderRadius: 20 }}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green)' }}>
                      {emp.total_present}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}
                          onClick={() => navigate(`/employees/${emp.id}`)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}
                          style={{ color: 'var(--red)' }}
                          onClick={() => setDeleteTarget(emp)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add New Employee" onClose={() => { setShowAdd(false); setAddErrors({}); }}>
          <EmployeeForm onSubmit={handleAdd} loading={addLoading} errors={addErrors} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to delete "${deleteTarget.full_name}"? All attendance records will also be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
