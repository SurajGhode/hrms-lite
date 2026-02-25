import React, { useEffect, useState, useCallback } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormField, { selectStyle, inputStyle } from '../components/FormField';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { CalendarCheck, Plus, Trash2, RefreshCw, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function SearchableEmployeeSelect({ employees, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = React.useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  const selected = employees.find(e => String(e.id) === String(value));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle(error),
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none',
          borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)',
        }}
      >
        {selected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {selected.full_name[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {selected.full_name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {selected.employee_id} · {selected.department}
              </div>
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select employee...</span>
        )}
        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', zIndex: 200,
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* Search box inside dropdown */}
          <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, ID or department..."
                style={{
                  ...inputStyle(),
                  paddingLeft: 30, fontSize: 13,
                  background: 'var(--bg-3)',
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No employees found
              </div>
            ) : (
              filtered.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => { onChange(emp.id); setOpen(false); setSearch(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', cursor: 'pointer',
                    background: String(emp.id) === String(value) ? 'rgba(88,166,255,0.08)' : 'transparent',
                    borderLeft: String(emp.id) === String(value) ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (String(emp.id) !== String(value)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (String(emp.id) !== String(value)) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}>
                    {emp.full_name[0]}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {emp.full_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {emp.employee_id} · {emp.department}
                    </div>
                  </div>
                  {/* Selected checkmark */}
                  {String(emp.id) === String(value) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer count */}
          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
            {filtered.length} of {employees.length} employees
          </div>
        </div>
      )}
    </div>
  );
}

function MarkAttendanceForm({ onSubmit, loading, errors }) {
  const [employees, setEmployees] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ employee: '', date: today, status: 'Present', note: '' });

  useEffect(() => {
    employeeAPI.list({ page_size: 1000 }).then(r => setEmployees(r.data.results)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <FormField label="Employee" required error={errors?.employee?.[0] || errors?.non_field_errors?.[0]}>
        <SearchableEmployeeSelect
          employees={employees}
          value={form.employee}
          onChange={v => set('employee', v)}
          error={!!errors?.employee || !!errors?.non_field_errors}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Date" required error={errors?.date?.[0]}>
          <input type="date" style={inputStyle(!!errors?.date)} value={form.date}
            onChange={e => set('date', e.target.value)} max={today}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = errors?.date ? 'var(--red)' : 'var(--border)'}
          />
        </FormField>
        <FormField label="Status" required error={errors?.status?.[0]}>
          <select style={selectStyle(!!errors?.status)} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </FormField>
      </div>

      <FormField label="Note (optional)">
        <input style={inputStyle()} value={form.note} onChange={e => set('note', e.target.value)}
          placeholder="Optional note..."
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </FormField>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <Button type="submit" loading={loading}>Mark Attendance</Button>
      </div>
    </form>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMark, setShowMark] = useState(false);
  const [markLoading, setMarkLoading] = useState(false);
  const [markErrors, setMarkErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(today);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRecords = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filterDate) params.date = filterDate;
    else {
      if (filterDateFrom) params.date_from = filterDateFrom;
      if (filterDateTo) params.date_to = filterDateTo;
    }
    if (filterStatus) params.status = filterStatus;
    attendanceAPI.list(params)
      .then(r => setRecords(r.data.results))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [filterDate, filterDateFrom, filterDateTo, filterStatus]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleMark = async (data) => {
    setMarkLoading(true); setMarkErrors({});
    try {
      await attendanceAPI.create(data);
      toast.success('Attendance marked successfully');
      setShowMark(false);
      fetchRecords();
    } catch (err) {
      if (err.errors) setMarkErrors(err.errors);
      else toast.error(err.friendlyMessage || 'Failed to mark attendance');
    } finally {
      setMarkLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await attendanceAPI.delete(deleteTarget.id);
      toast.success('Record deleted');
      setDeleteTarget(null);
      fetchRecords();
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterDate(today);
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterStatus('');
  };

  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Attendance</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {records.length} records · <span style={{ color: 'var(--green)' }}>{present} present</span> · <span style={{ color: 'var(--red)' }}>{absent} absent</span>
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowMark(true)}>Mark Attendance</Button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '14px 16px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <Filter size={14} color="var(--text-muted)" />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginRight: 4 }}>Filter by:</span>

        <input type="date" value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setFilterDateFrom(''); setFilterDateTo(''); }}
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12 }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or range:</span>
        <input type="date" value={filterDateFrom}
          onChange={e => { setFilterDateFrom(e.target.value); setFilterDate(''); }}
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12 }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→</span>
        <input type="date" value={filterDateTo}
          onChange={e => { setFilterDateTo(e.target.value); setFilterDate(''); }}
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} onClick={fetchRecords}>Apply</Button>
        <Button size="sm" variant="ghost" onClick={clearFilters}>Clear</Button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <PageLoader /> : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description="No attendance found for the selected filters."
            action={<Button icon={<Plus size={16} />} onClick={() => setShowMark(true)}>Mark Attendance</Button>}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Employee', 'ID', 'Department', 'Date', 'Status', 'Note', ''].map((h, i) => (
                    <th key={i} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={rec.id}
                    style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{rec.employee_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', background: 'rgba(88,166,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                        {rec.employee_id}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-3)', padding: '2px 9px', borderRadius: 20 }}>
                        {rec.department}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {format(new Date(rec.date), 'MMM dd, yyyy')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={rec.status}>{rec.status}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontStyle: rec.note ? 'normal' : 'italic' }}>
                      {rec.note || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Button variant="ghost" size="sm" icon={<Trash2 size={13} />}
                        style={{ color: 'var(--red)' }}
                        onClick={() => setDeleteTarget(rec)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showMark && (
        <Modal title="Mark Attendance" onClose={() => { setShowMark(false); setMarkErrors({}); }}>
          <MarkAttendanceForm onSubmit={handleMark} loading={markLoading} errors={markErrors} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Attendance Record"
          message={`Delete attendance record for "${deleteTarget.employee_name}" on ${format(new Date(deleteTarget.date), 'MMM dd, yyyy')}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}