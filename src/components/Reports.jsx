import React, { useState } from 'react';
import { Calendar, AlertTriangle, Download, TrendingUp, Award } from 'lucide-react';

export default function Reports({ medicines, sales, reportType = 'sales', setReportType, user }) {
  
  // Date range filters for sales reports
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Expiry filters
  const [expiryFilter, setExpiryFilter] = useState('all'); // 'all', 'expired', 'near90', 'near30'

  // ---- 1. Sales Report calculations ----
  const filteredSales = sales.filter(s => {
    return s.date >= startDate && s.date <= endDate;
  });

  const totalSalesVal = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalDiscountVal = filteredSales.reduce((acc, s) => acc + s.discount, 0);
  const transactionCount = filteredSales.length;

  // Most Selling Products calculation (filtered by date range)
  const rangeProductSales = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      const key = item.name;
      if (rangeProductSales[key]) {
        rangeProductSales[key].qty += item.qty;
      } else {
        rangeProductSales[key] = {
          name: item.name,
          category: item.category || 'Tablets',
          qty: item.qty,
          unitPrice: item.salesPrice || 0
        };
      }
    });
  });

  const topSellingInRange = Object.values(rangeProductSales)
    .sort((a, b) => b.qty - a.qty);

  // ---- 2. Expiry Report calculations ----
  const today = new Date();
  const getExpiryReportData = () => {
    return medicines.filter(m => {
      const exp = new Date(m.expiryDate);
      const diffTime = exp - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (expiryFilter === 'expired') {
        return diffDays < 0;
      } else if (expiryFilter === 'near30') {
        return diffDays >= 0 && diffDays <= 30;
      } else if (expiryFilter === 'near90') {
        return diffDays >= 0 && diffDays <= 90;
      }
      return true; // 'all'
    });
  };

  const expiryReportData = getExpiryReportData();

  // ---- 3. Stock Level calculations ----
  const lowStockData = medicines.filter(m => m.stock <= (m.minStock || 10));

  // Format stock representation based on category type
  const formatStockText = (stockCount, categoryName) => {
    const cat = categoryName || 'Tablets';
    if (cat === 'Tablets') {
      const packs = Math.floor(stockCount / 10);
      const tabs = stockCount % 10;
      return `${packs} Packs ${tabs > 0 ? `+ ${tabs} Tabs` : ''} (${stockCount} Tabs)`;
    } else if (cat === 'Liquids') {
      return `${stockCount} Bottles/Tubes`;
    } else {
      return `${stockCount} Units`;
    }
  };

  // Excel CSV Exporter via AJAX Fetch (Avoids browser navigation blocks)
  const exportToExcel = async (type) => {
    const API_BASE = 'http://localhost:4000';
    let url = '';
    let filename = '';

    if (type === 'sales') {
      url = `${API_BASE}/sales/export-csv?startDate=${startDate}&endDate=${endDate}`;
      filename = `Sales_Report_${startDate}_to_${endDate}.csv`;
    } else if (type === 'expiry') {
      url = `${API_BASE}/medicines/export-csv?type=expiry`;
      filename = `Expiry_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'stock') {
      url = `${API_BASE}/medicines/export-csv?type=stock`;
      filename = `Low_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`;
    }

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user ? user.token : ''}` }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup to free memory
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err) {
      console.error('Failed to export CSV report:', err);
      alert('Failed to download report. Please check backend connection.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Report tabs navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button 
          className={`btn ${reportType === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('sales')}
        >
          <TrendingUp size={16} /> Sales & Revenue Report
        </button>
        <button 
          className={`btn ${reportType === 'expiry' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('expiry')}
        >
          <Calendar size={16} /> Medicine Expiry Report
        </button>
        <button 
          className={`btn ${reportType === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('stock')}
        >
          <AlertTriangle size={16} /> Stock Status & Alerts
        </button>
      </div>

      {/* -------------------- SALES REPORT VIEW -------------------- */}
      {reportType === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filters */}
          <div className="filters-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" className="custom-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" className="custom-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => exportToExcel('sales')}>
                <Download size={16} /> Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Widgets */}
          <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="glass-card">
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Net Revenue</h5>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>
                ₹{totalSalesVal.toFixed(2)}
              </div>
            </div>
            <div className="glass-card">
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Discounts Given</h5>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-warning)' }}>
                ₹{totalDiscountVal.toFixed(2)}
              </div>
            </div>
            <div className="glass-card">
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Transactions</h5>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {transactionCount}
              </div>
            </div>
          </div>

          {/* Card: Most Selling Products Breakdown */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} style={{ color: 'var(--accent-cyan)' }} />
              Most Selling Medicines (Date Range Selection)
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th>Rank</th>
                    <th>Medicine Description</th>
                    <th>Product Category</th>
                    <th style={{ textAlign: 'right' }}>Billing Unit Price</th>
                    <th style={{ textAlign: 'center' }}>Total Quantity Sold</th>
                    <th style={{ textAlign: 'right' }}>Total Gross Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingInRange.length > 0 ? (
                    topSellingInRange.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 750, color: 'var(--accent-cyan)' }}>#{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{item.name}</td>
                        <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{item.category}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.qty} units</td>
                        <td style={{ textAlign: 'right', fontWeight: 750, color: 'var(--accent-teal)' }}>₹{(item.qty * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No transactions registered inside this date range to calculate product ranks.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Transaction Log</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Invoice ID</th>
                    <th>Customer Name</th>
                    <th>Items</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>Discount</th>
                    <th style={{ textAlign: 'right' }}>Grand Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.date} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({sale.time})</span></td>
                        <td style={{ fontFamily: 'monospace' }}>{sale.id}</td>
                        <td>{sale.customerName}</td>
                        <td>
                          {sale.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {it.name} (x{it.qty})
                            </div>
                          ))}
                        </td>
                        <td style={{ textAlign: 'right' }}>₹{sale.subtotal.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-warning)' }}>₹{sale.discount.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 750, color: 'var(--accent-cyan)' }}>₹{sale.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No transactions found for the selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- EXPIRY REPORT VIEW -------------------- */}
      {reportType === 'expiry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filters */}
          <div className="filters-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group">
              <label>Expiry Category</label>
              <select className="custom-select" value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
                <option value="all">All Medicines</option>
                <option value="expired">Already Expired</option>
                <option value="near30">Expiring in 30 Days</option>
                <option value="near90">Expiring in 90 Days</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => exportToExcel('expiry')}>
                <Download size={16} /> Export to Excel
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Expiry Log Sheet</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Generic Name</th>
                    <th>Batch No.</th>
                    <th>Expiry Date</th>
                    <th>Current Stock</th>
                    <th>Estimated Loss (at Cost)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryReportData.length > 0 ? (
                    expiryReportData.map((med) => {
                      const exp = new Date(med.expiryDate);
                      const isExpired = exp < today;
                      const estLoss = isExpired ? (med.stock * med.purchasePrice) : 0;
                      
                      return (
                        <tr key={med.id}>
                          <td style={{ fontWeight: 650 }}>{med.name}</td>
                          <td>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px',
                              background: med.category === 'Tablets' ? 'rgba(13,148,136,0.1)' : (med.category === 'Liquids' ? 'rgba(8,145,178,0.1)' : 'rgba(37,99,235,0.1)'),
                              color: med.category === 'Tablets' ? 'var(--accent-cyan)' : (med.category === 'Liquids' ? 'var(--accent-teal)' : 'var(--color-info)'),
                              fontWeight: 700
                            }}>
                              {med.category || 'Tablets'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{med.genericName || '-'}</td>
                          <td style={{ fontFamily: 'monospace' }}>{med.batchNo}</td>
                          <td>{new Date(med.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td style={{ fontWeight: 600 }}>{formatStockText(med.stock, med.category)}</td>
                          <td style={{ color: estLoss > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: estLoss > 0 ? 700 : 'normal' }}>
                            {estLoss > 0 ? `₹${estLoss.toFixed(2)}` : '-'}
                          </td>
                          <td>
                            {isExpired ? (
                              <span className="badge danger">Expired</span>
                            ) : (
                              <span className="badge warning">Expiring Soon</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No medicines match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- STOCK REPORT VIEW -------------------- */}
      {reportType === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="filters-panel" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing items with stock at or below minimum threshold levels.
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => exportToExcel('stock')}>
                <Download size={16} /> Export to Excel
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Restock Order List</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Generic Name</th>
                    <th>Batch No.</th>
                    <th style={{ textAlign: 'right' }}>Current Stock</th>
                    <th style={{ textAlign: 'right' }}>Safety Stock Threshold</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockData.length > 0 ? (
                    lowStockData.map((med) => (
                      <tr key={med.id}>
                        <td style={{ fontWeight: 650 }}>{med.name}</td>
                        <td>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px',
                            background: med.category === 'Tablets' ? 'rgba(13,148,136,0.1)' : (med.category === 'Liquids' ? 'rgba(8,145,178,0.1)' : 'rgba(37,99,235,0.1)'),
                            color: med.category === 'Tablets' ? 'var(--accent-cyan)' : (med.category === 'Liquids' ? 'var(--accent-teal)' : 'var(--color-info)'),
                            fontWeight: 700
                          }}>
                            {med.category || 'Tablets'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{med.genericName || '-'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{med.batchNo}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: med.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                          {formatStockText(med.stock, med.category)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{med.minStock || 10} Units</td>
                        <td style={{ textAlign: 'right' }}>₹{med.purchasePrice.toFixed(2)}</td>
                        <td>
                          {med.stock === 0 ? (
                            <span className="badge danger">Out of Stock</span>
                          ) : (
                            <span className="badge warning">Low Stock</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        All stock levels are safe! No restocking required right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
