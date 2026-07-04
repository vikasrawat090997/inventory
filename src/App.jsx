import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  RefreshCw,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Auth from './components/Auth';

const API_BASE = 'http://localhost:4000';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rx_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [tab, setTab] = useState('dashboard');
  const [reportsSubTab, setReportsSubTab] = useState('sales');
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideSidebar, setHideSidebar] = useState(false);

  // Fetch initial data from NestJS MySQL API (only when logged in)
  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [medsRes, salesRes] = await Promise.all([
        fetch(`${API_BASE}/medicines`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        fetch(`${API_BASE}/sales`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
      ]);

      if (!medsRes.ok || !salesRes.ok) {
        throw new Error('Failed to retrieve inventory or sales data from server.');
      }

      const medsData = await medsRes.json();
      const salesData = await salesRes.json();

      const formattedMeds = medsData.map(m => ({
        ...m,
        stock: Number(m.stock),
        minStock: Number(m.minStock),
        purchasePrice: Number(m.purchasePrice),
        salesPrice: Number(m.purchasePrice) // Map to purchasePrice since retail column was removed
      }));

      const formattedSales = salesData.map(s => ({
        ...s,
        subtotal: Number(s.subtotal),
        discount: Number(s.discount),
        total: Number(s.total),
        items: s.items.map(it => ({
          ...it,
          salesPrice: Number(it.salesPrice),
          qty: Number(it.qty)
        }))
      }));

      setMedicines(formattedMeds);
      setSales(formattedSales);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not connect to NestJS MySQL API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Login Success Handler
  const handleLoginSuccess = (userData) => {
    localStorage.setItem('rx_user_session', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('rx_user_session');
    setUser(null);
    setMedicines([]);
    setSales([]);
  };

  // CRUD handlers - Medicine Database
  const addMedicine = async (newMed) => {
    try {
      const res = await fetch(`${API_BASE}/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newMed)
      });
      if (!res.ok) throw new Error('Could not add medicine.');
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateMedicine = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) throw new Error('Could not update medicine.');
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteMedicine = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        const res = await fetch(`${API_BASE}/medicines/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (!res.ok) throw new Error('Could not delete medicine.');
        fetchAllData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Log sale transaction
  const createSale = async (saleData) => {
    try {
      const backendDto = {
        customerName: saleData.customerName,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        total: saleData.total,
        items: saleData.items.map(item => ({
          medicineId: item.id,
          name: item.name,
          batchNo: item.batchNo,
          salesPrice: item.salesPrice,
          qty: item.qty
        }))
      };

      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(backendDto)
      });

      if (!res.ok) {
        const errDetails = await res.json();
        throw new Error(errDetails.message || 'Transaction checkout failed.');
      }

      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Guard: If not logged in, render Auth screen
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation (Hidden when full-screen data sheets are active) */}
      {!hideSidebar && (
        <aside className="sidebar">
          <div className="logo-section">
            <div className="logo-icon">💊</div>
            <div>
              <div className="logo-text">RxKeep</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {user.pharmacyName}
              </div>
            </div>
          </div>

          {/* User Info Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <UserIcon size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              @{user.username}
            </span>
          </div>

          <nav style={{ flex: 1 }}>
            <ul className="nav-links">
              <li className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`}>
                <button onClick={() => setTab('dashboard')}>
                  <LayoutDashboard size={18} /> Dashboard
                </button>
              </li>
              <li className={`nav-item ${tab === 'inventory' ? 'active' : ''}`}>
                <button onClick={() => setTab('inventory')}>
                  <Package size={18} /> Inventory Stock
                </button>
              </li>
              <li className={`nav-item ${tab === 'sales' ? 'active' : ''}`}>
                <button onClick={() => setTab('sales')}>
                  <ShoppingCart size={18} /> New Bill / Sale
                </button>
              </li>
              <li className={`nav-item ${tab === 'reports' ? 'active' : ''}`}>
                <button onClick={() => setTab('reports')}>
                  <FileText size={18} /> Advanced Reports
                </button>
              </li>
            </ul>
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-danger" style={{ fontSize: '0.8rem', width: '100%', justifyContent: 'flex-start', background: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)', border: 'none' }} onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="main-content" style={{ padding: hideSidebar ? '0' : '2rem', height: hideSidebar ? '100vh' : 'auto' }}>

        {/* Main Header bar (Hidden when full-screen data sheets are active) */}
        {!hideSidebar && (
          <header className="header-bar">
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {tab === 'dashboard' && 'Pharmacy Analytics Panel'}
                {tab === 'inventory' && 'Stock Directory'}
                {tab === 'sales' && 'Point of Sale / Billing'}
                {tab === 'reports' && 'Business Intelligence Reports'}
              </h1>
              <p className="title-desc">
                {tab === 'dashboard' && 'Real-time overview of your store health, sales trends, and expiry metrics.'}
                {tab === 'inventory' && 'Manage medicines database, view batch sheets, and track safety stock thresholds.'}
                {tab === 'sales' && 'Quick bill generation, customer receipt logs, and automated inventory sync.'}
                {tab === 'reports' && 'Custom analytical sheets for revenue loss, low stock restocking, and expiry monitoring.'}
              </p>
            </div>
          </header>
        )}

        {loading ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            Connecting to XAMPP MySQL database...
          </div>
        ) : error ? (
          <div className="alert-box danger" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ fontWeight: 750 }}>Database Connection Error</h3>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchAllData}>Retry Connection</button>
          </div>
        ) : (
          <>
            {/* Dynamic Tab Rendering */}
            {tab === 'dashboard' && (
              <Dashboard
                medicines={medicines}
                sales={sales}
                setTab={setTab}
                setReportsSubTab={setReportsSubTab}
              />
            )}

            {tab === 'inventory' && (
              <Inventory
                medicines={medicines}
                addMedicine={addMedicine}
                updateMedicine={updateMedicine}
                deleteMedicine={deleteMedicine}
                onViewChange={(currentView) => setHideSidebar(currentView === 'add' || currentView === 'edit')}
              />
            )}

            {tab === 'sales' && (
              <Sales medicines={medicines} sales={sales} createSale={createSale} />
            )}

            {tab === 'reports' && (
              <Reports medicines={medicines} sales={sales} reportType={reportsSubTab} setReportType={setReportsSubTab} user={user} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
