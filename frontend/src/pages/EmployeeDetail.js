import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import Badge from '../components/Badge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { ArrowLeft, CalendarCheck, UserCheck, UserX, Percent } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (statusFilter) params.status = statusFilter;
    Promise.all([
      employeeAPI.get(id),
      employeeAPI.getAttendance(id, params),
    ]).then(([empRes, attRes]) => {
      setEmployee(empRes.data);
      setAttendance(attRes.data);
    }).catch(() => navigate('/employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <PageLoader />;
  if (!employee) return null;

  const { summary, records } = attendance;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
      {/* Back */}
      <button onClick={() => navigate('/employees')} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: 13, width: 'fit-content',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={15} /> Back to Employees
      </button>

      {/* Employee card */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 24,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {employee.full_name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{employee.full_name}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{employee.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', background: 'rgba(88,166,255,0.08)', padding: '4px 10px', borderRadius: 6 }}>
            {employee.employee_id}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-3)', padding: '4px 10px', borderRadius: 20 }}>
            {employee.department}
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { icon: CalendarCheck, label: 'Total Days', value: summary.total, color: 'var(--accent)' },
          { icon: UserCheck, label: 'Present', value: summary.present, color: 'var(--green)' },
          { icon: UserX, label: 'Absent', value: summary.absent, color: 'var(--red)' },
          { icon: Percent, label: 'Attendance Rate', value: `${summary.attendance_rate}%`, color: 'var(--purple)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <Icon size={18} color={color} />
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Attendance Records */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Attendance History</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12 }} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12 }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer' }}>
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            <Button size="sm" variant="secondary" onClick={fetchData}>Filter</Button>
          </div>
        </div>

        {records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" description="No attendance has been marked yet." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Day', 'Status', 'Note'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
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
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                      {format(new Date(rec.date), 'MMM dd, yyyy')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {format(new Date(rec.date), 'EEEE')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={rec.status}>{rec.status}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontStyle: rec.note ? 'normal' : 'italic' }}>
                      {rec.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
