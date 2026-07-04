import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  DollarSign,
  Calendar,
  AlertOctagon,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function Dashboard({ medicines, sales, setTab, setReportsSubTab }) {
  // 1. Calculate stats
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySales = sales.filter(s => s.date === todayStr);
  const todaySalesVal = todaySales.reduce((acc, s) => acc + s.total, 0);
  const todaySalesCount = todaySales.length;

  const totalMedicines = medicines.length;

  // Expiry alerts
  const today = new Date();
  const expiredMedicines = medicines.filter(m => new Date(m.expiryDate) < today);
  const nearExpiryMedicines = medicines.filter(m => {
    const expiry = new Date(m.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90; // expiring in next 90 days
  });

  const lowStockMedicines = medicines.filter(m => m.stock <= (m.minStock || 10));

  // 2. Calculate Top Selling Medicines (All time sales volume)
  const medicineSalesAllTime = {};
  sales.forEach(s => {
    s.items.forEach(item => {
      if (medicineSalesAllTime[item.name]) {
        medicineSalesAllTime[item.name] += item.qty;
      } else {
        medicineSalesAllTime[item.name] = item.qty;
      }
    });
  });

  const topSellingAllTime = Object.entries(medicineSalesAllTime)
    .map(([name, qty]) => {
      const med = medicines.find(m => m.name === name);
      return {
        name,
        qty,
        category: med ? med.category : 'Tablets'
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 3. Sales graph data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const daySales = sales.filter(s => s.date === dateStr);
    const revenue = daySales.reduce((acc, s) => acc + s.total, 0);
    // Format date for chart (e.g. "04 Jul")
    const dateObj = new Date(dateStr);
    const label = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return { date: label, Sales: revenue };
  });

  const handleCardClick = (targetTab, subTab) => {
    setTab(targetTab);
    if (setReportsSubTab && subTab) {
      setReportsSubTab(subTab);
    }
  };

  const maxSalesQty = topSellingAllTime.length > 0 ? Math.max(...topSellingAllTime.map(t => t.qty)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Metrics Row */}
      <div className="metrics-grid">

        {/* Metric 1: Today's Revenue */}
        <div
          className="glass-card metric-card"
          onClick={() => handleCardClick('reports', 'sales')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div className="metric-info">
            <h4>Today's Revenue</h4>
            <div className="value">₹{todaySalesVal.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <TrendingUp size={12} /> {todaySalesCount} sales transaction(s)
            </div>
          </div>
          <div className="metric-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--color-success)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Metric 2: Expired Stock */}
        <div
          className="glass-card metric-card"
          onClick={() => handleCardClick('reports', 'expiry')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div className="metric-info">
            <h4>Expired Stock</h4>
            <div className="value" style={{ color: expiredMedicines.length > 0 ? 'var(--color-danger)' : 'inherit' }}>
              {expiredMedicines.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Needs immediate disposal
            </div>
          </div>
          <div className="metric-icon-wrapper" style={{ background: 'var(--danger-bg)', color: 'var(--color-danger)' }}>
            <AlertOctagon size={24} />
          </div>
        </div>

        {/* Metric 3: Expiring Soon */}
        <div
          className="glass-card metric-card"
          onClick={() => handleCardClick('reports', 'expiry')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div className="metric-info">
            <h4>Expiring Soon (90d)</h4>
            <div className="value" style={{ color: nearExpiryMedicines.length > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {nearExpiryMedicines.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Requires clearance sales
            </div>
          </div>
          <div className="metric-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--color-warning)' }}>
            <Calendar size={24} />
          </div>
        </div>

        {/* Metric 4: Low Stock Items */}
        <div
          className="glass-card metric-card"
          onClick={() => handleCardClick('reports', 'stock')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div className="metric-info">
            <h4>Low Stock Items</h4>
            <div className="value" style={{ color: lowStockMedicines.length > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {lowStockMedicines.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Refill recommended
            </div>
          </div>
          <div className="metric-icon-wrapper" style={{ background: 'var(--info-bg)', color: 'var(--color-info)' }}>
            <Package size={24} />
          </div>
        </div>

      </div>

      {/* Main Grid: Graph & Alerts */}
      <div className="dashboard-grid">
        {/* Sales Graph */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Sales Performance</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 7 Days</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1321',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="Sales" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiry / Stock Action Items */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Critical Actions Needed</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {expiredMedicines.length > 0 && (
              <div
                className="alert-box danger"
                onClick={() => handleCardClick('reports', 'expiry')}
                style={{ cursor: 'pointer' }}
              >
                <AlertOctagon size={20} style={{ flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontWeight: 650, fontSize: '0.875rem' }}>Expired stock detected!</h5>
                  <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.15rem' }}>
                    {expiredMedicines.length} medicine(s) are expired. Discard immediately to prevent sale.
                  </p>
                </div>
              </div>
            )}

            {nearExpiryMedicines.length > 0 && (
              <div
                className="alert-box warning"
                onClick={() => handleCardClick('reports', 'expiry')}
                style={{ cursor: 'pointer' }}
              >
                <Calendar size={20} style={{ flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontWeight: 650, fontSize: '0.875rem' }}>Near expiry warning</h5>
                  <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.15rem' }}>
                    {nearExpiryMedicines.length} items will expire in the next 90 days.
                  </p>
                </div>
              </div>
            )}

            {lowStockMedicines.length > 0 && (
              <div
                className="alert-box warning"
                style={{ background: 'var(--info-bg)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', cursor: 'pointer' }}
                onClick={() => handleCardClick('reports', 'stock')}
              >
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontWeight: 650, fontSize: '0.875rem' }}>Stock running low</h5>
                  <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.15rem' }}>
                    {lowStockMedicines.length} product(s) below safety stock limit.
                  </p>
                </div>
              </div>
            )}

            {expiredMedicines.length === 0 && nearExpiryMedicines.length === 0 && lowStockMedicines.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.9rem' }}>All systems nominal! No urgent actions required.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* NEW ROW: Top Selling Products */}
      <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} style={{ color: 'var(--accent-cyan)' }} />
          Most Selling Products (All-Time Volume)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {topSellingAllTime.length > 0 ? (
            topSellingAllTime.map((item, idx) => {
              const percentage = (item.qty / maxSalesQty) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div>
                      <strong>{idx + 1}. {item.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', textTransform: 'uppercase' }}>
                        ({item.category})
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.qty} units sold</span>
                  </div>
                  {/* Progress bar represent share */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-teal))', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
              No transactions recorded yet. Complete sales checkout to log performance.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
