import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import { Users, Building2, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function StatCard({ icon: Icon, label, value, color, bg, subtitle }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 22px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.stats()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)' }}>
      {error}
    </div>
  );

  const attendance_rate = stats.total_employees > 0
    ? Math.round(((stats.today_present) / stats.total_employees) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Overview</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date(stats.today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/employees')}>Manage Employees</Button>
          <Button size="sm" onClick={() => navigate('/attendance')}>Mark Attendance</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard icon={Users} label="Total Employees" value={stats.total_employees} color="var(--accent)" bg="rgba(88,166,255,0.1)" />
        <StatCard icon={Building2} label="Departments" value={stats.total_departments} color="var(--purple)" bg="rgba(188,140,255,0.1)" />
        <StatCard icon={UserCheck} label="Present Today" value={stats.today_present}
          subtitle={`${attendance_rate}% attendance rate`}
          color="var(--green)" bg="var(--green-bg)" />
        <StatCard icon={UserX} label="Absent Today" value={stats.today_absent} color="var(--red)" bg="var(--red-bg)" />
      </div>

      {/* Department Breakdown */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Department Breakdown</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stats.department_breakdown.length} departments</span>
        </div>
        {stats.department_breakdown.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No employees yet. <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 }} onClick={() => navigate('/employees')}>Add employees</button>
          </div>
        ) : (
          <div style={{ padding: '8px 20px 16px' }}>
            {stats.department_breakdown
              .sort((a, b) => b.count - a.count)
              .map(({ department, count }) => {
                const pct = Math.round((count / stats.total_employees) * 100);
                return (
                  <div key={department} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{department}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: 'linear-gradient(90deg, var(--accent), var(--purple))',
                        borderRadius: 4, transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
