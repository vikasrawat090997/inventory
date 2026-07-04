import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Save, ArrowLeft, Box, Layers, Coins, FileText, RotateCcw } from 'lucide-react';

export default function Inventory({ medicines, addMedicine, updateMedicine, deleteMedicine, onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingMed, setEditingMed] = useState(null);

  // Search Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Single Edit Form Fields (Edit Mode)
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [minStock, setMinStock] = useState(10);
  const [category, setCategory] = useState('Tablets'); // 'Tablets' | 'Liquids' | 'Equipments'

  // Input states for single edit (adapted by category)
  const [boxes, setBoxes] = useState(0);
  const [packsPerBox, setPacksPerBox] = useState(10);
  const [tabletsPerPack, setTabletsPerPack] = useState(10);
  const [packPurchasePrice, setPackPurchasePrice] = useState(0);

  // Bulk Entry Form State (Add Mode)
  const [bulkItems, setBulkItems] = useState([
    { id: 1, category: 'Tablets', name: '', genericName: '', batchNo: '', expiryDate: '', boxes: 0, packsPerBox: 10, tabletsPerPack: 10, packPurchasePrice: 0, minStock: 10 }
  ]);

  const changeView = (newView) => {
    setView(newView);
    if (onViewChange) onViewChange(newView);
  };

  const resetSingleForm = () => {
    setName('');
    setGenericName('');
    setBatchNo('');
    setExpiryDate('');
    setMinStock(10);
    setCategory('Tablets');
    setBoxes(0);
    setPacksPerBox(10);
    setTabletsPerPack(10);
    setPackPurchasePrice(0);
    setEditingMed(null);
  };

  const clearSearchFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenAdd = () => {
    resetSingleForm();
    setBulkItems([
      { id: Date.now(), category: 'Tablets', name: '', genericName: '', batchNo: '', expiryDate: '', boxes: 0, packsPerBox: 10, tabletsPerPack: 10, packPurchasePrice: 0, minStock: 10 }
    ]);
    changeView('add');
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setName(med.name);
    setGenericName(med.genericName || '');
    setBatchNo(med.batchNo);
    setExpiryDate(med.expiryDate);
    setMinStock(med.minStock || 10);
    const medCat = med.category || 'Tablets';
    setCategory(medCat);
    
    if (medCat === 'Tablets') {
      const tPerPack = 10;
      const pPerBox = 10;
      setTabletsPerPack(tPerPack);
      setPacksPerBox(pPerBox);
      setBoxes(Math.ceil(med.stock / (tPerPack * pPerBox)));
      setPackPurchasePrice(med.purchasePrice * tPerPack);
    } else if (medCat === 'Liquids') {
      setPacksPerBox(10);
      setBoxes(Math.ceil(med.stock / 10));
      setPackPurchasePrice(med.purchasePrice);
    } else {
      setBoxes(med.stock);
      setPackPurchasePrice(med.purchasePrice);
    }
    
    changeView('edit');
  };

  const handleAddBulkRow = () => {
    setBulkItems([
      ...bulkItems,
      { id: Date.now(), category: 'Tablets', name: '', genericName: '', batchNo: '', expiryDate: '', boxes: 0, packsPerBox: 10, tabletsPerPack: 10, packPurchasePrice: 0, minStock: 10 }
    ]);
  };

  const handleDeleteBulkRow = (id) => {
    if (bulkItems.length === 1) return;
    setBulkItems(bulkItems.filter(item => item.id !== id));
  };

  const handleBulkChange = (id, field, value) => {
    setBulkItems(bulkItems.map(item => {
      if (item.id === id) {
        // Reset defaults when category changes
        if (field === 'category') {
          return { 
            ...item, 
            category: value,
            boxes: 0,
            packsPerBox: value === 'Tablets' ? 10 : (value === 'Liquids' ? 1 : 1),
            tabletsPerPack: value === 'Tablets' ? 10 : 1,
            packPurchasePrice: 0
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (view === 'edit') {
      let computedStock = 0;
      let computedPurchasePrice = 0;

      if (category === 'Tablets') {
        const totalPacks = Number(boxes) * Number(packsPerBox);
        computedStock = totalPacks * Number(tabletsPerPack);
        computedPurchasePrice = Number(tabletsPerPack) > 0 ? (Number(packPurchasePrice) / Number(tabletsPerPack)) : 0;
      } else if (category === 'Liquids') {
        computedStock = Number(boxes) * Number(packsPerBox);
        computedPurchasePrice = Number(packPurchasePrice);
      } else {
        computedStock = Number(boxes);
        computedPurchasePrice = Number(packPurchasePrice);
      }

      const data = {
        name,
        genericName: category === 'Tablets' ? genericName : '', 
        batchNo,
        expiryDate,
        stock: Number(computedStock),
        minStock: Number(minStock),
        purchasePrice: Number(computedPurchasePrice),
        category
      };

      await updateMedicine(editingMed.id, data);
    } else if (view === 'add') {
      for (const item of bulkItems) {
        if (!item.name || !item.batchNo || !item.expiryDate) continue;

        let computedStock = 0;
        let computedPurchasePrice = 0;

        if (item.category === 'Tablets') {
          const totalPacks = Number(item.boxes) * Number(item.packsPerBox);
          computedStock = totalPacks * Number(item.tabletsPerPack);
          computedPurchasePrice = Number(item.tabletsPerPack) > 0 ? (Number(item.packPurchasePrice) / Number(item.tabletsPerPack)) : 0;
        } else if (item.category === 'Liquids') {
          computedStock = Number(item.boxes) * Number(item.packsPerBox);
          computedPurchasePrice = Number(item.packPurchasePrice);
        } else {
          computedStock = Number(item.boxes);
          computedPurchasePrice = Number(item.packPurchasePrice);
        }

        const data = {
          name: item.name,
          genericName: item.category === 'Tablets' ? item.genericName : '',
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          stock: Number(computedStock),
          minStock: Number(item.minStock),
          purchasePrice: Number(computedPurchasePrice),
          category: item.category
        };

        await addMedicine(data);
      }
    }

    changeView('list');
    resetSingleForm();
  };

  const getExpiryCategory = (expiryDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDateStr);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 90) return 'expiring';
    return 'active';
  };

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (med.genericName && med.genericName.toLowerCase().includes(searchTerm.toLowerCase()));

    const expCategory = getExpiryCategory(med.expiryDate);
    const matchesStatus = statusFilter === 'all' || expCategory === statusFilter;

    const matchesCategory = categoryFilter === 'all' || (med.category || 'Tablets') === categoryFilter;

    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = matchesDateRange && (med.expiryDate >= startDate);
    }
    if (endDate) {
      matchesDateRange = matchesDateRange && (med.expiryDate <= endDate);
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
  });

  const getExpiryBadge = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(dateStr);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="badge danger">Expired</span>;
    } else if (diffDays <= 90) {
      return <span className="badge warning">Expiring Soon ({diffDays}d)</span>;
    } else {
      return <span className="badge safe">Active</span>;
    }
  };

  // Helper to format stock representation in list table based on category
  const formatStock = (med) => {
    const cat = med.category || 'Tablets';
    if (cat === 'Tablets') {
      const packs = Math.floor(med.stock / 10);
      const tabs = med.stock % 10;
      return (
        <>
          <span style={{ fontWeight: 700, color: med.stock <= (med.minStock || 10) ? 'var(--color-danger)' : 'inherit' }}>
            {packs} Packs {tabs > 0 ? `+ ${tabs} Tabs` : ''}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({med.stock} Tablets)</div>
        </>
      );
    } else if (cat === 'Liquids') {
      return (
        <>
          <span style={{ fontWeight: 700, color: med.stock <= (med.minStock || 5) ? 'var(--color-danger)' : 'inherit' }}>
            {med.stock} Bottles/Tubes
          </span>
        </>
      );
    } else {
      return (
        <>
          <span style={{ fontWeight: 700, color: med.stock <= (med.minStock || 2) ? 'var(--color-danger)' : 'inherit' }}>
            {med.stock} Units
          </span>
        </>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {view === 'list' && (
        /* STANDARD LIST VIEW WITH DIRECTORY & FILTERS */
        <>
          {/* Search and Advanced Filters Control row */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name, salt, batch..." 
                  className="custom-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                <Plus size={18} /> Bulk Add Stock
              </button>
            </div>

            {/* Filters Box */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              
              <div className="form-group" style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Product Category</label>
                <select className="custom-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '100%' }}>
                  <option value="all">All Categories</option>
                  <option value="Tablets">Tablets / Capsules</option>
                  <option value="Liquids">Syrups / Liquids / Creams</option>
                  <option value="Equipments">Surgicals / Equipments / General</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Expiry Status</label>
                <select className="custom-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%' }}>
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Safe)</option>
                  <option value="expiring">Expiring Soon (&lt; 90 days)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Expiry From</label>
                <input type="date" className="custom-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div className="form-group" style={{ flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Expiry To</label>
                <input type="date" className="custom-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%' }} />
              </div>

              <button className="btn btn-secondary" onClick={clearSearchFilters} style={{ height: '42px', padding: '0 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <RotateCcw size={14} /> Clear
              </button>
            </div>
          </div>

          {/* Inventory Table Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Stock & Medicine Directory</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Generic / Salt</th>
                    <th>Batch No.</th>
                    <th>Expiry Date</th>
                    <th>Expiry Status</th>
                    <th style={{ textAlign: 'right' }}>Stock Level</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost Price</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((med) => (
                      <tr key={med.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{med.name}</div>
                        </td>
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
                        <td>{new Date(med.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>{getExpiryBadge(med.expiryDate)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {formatStock(med)}
                          {med.stock <= (med.minStock || 10) && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>Low Stock</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 650, color: 'var(--accent-cyan)' }}>₹{med.purchasePrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleOpenEdit(med)}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', border: 'none' }} onClick={() => deleteMedicine(med.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No medicines found matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view !== 'list' && (
        /* FULL SCREEN DATA ENTRY VIEW - STRICT ERP WORKSPACE LAYOUT (NO SCROLL LEAKS) */
        <div className="glass-card" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', 
          padding: 0, 
          overflow: 'hidden', 
          borderRadius: '0',
          border: 'none',
          boxShadow: 'none'
        }}>
          
          {/* STATIC TOP HEADER BAR */}
          <div style={{ 
            background: '#ffffff',
            borderBottom: '2px solid var(--border-color)',
            padding: '1.25rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => changeView('list')}>
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--text-primary)' }}>
                  {view === 'edit' ? 'Modify Medicine Entry Record' : 'Bulk Inventory Entry Ledger'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  {view === 'edit' ? 'Edit specifications, category fields, and limits for this stock item.' : 'Add multiple medicines concurrently using responsive form card components (No horizontal scrolling).'}
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => changeView('list')}>
              Cancel & Exit
            </button>
          </div>

          {/* MAIN SCROLLABLE FORM BODY CONTAINER */}
          <form onSubmit={handleSubmit} style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden'
          }}>
            
            {/* Scrollable inputs panel */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem' 
            }}>
              {view === 'edit' ? (
                /* SINGLE EDIT MODE FORM CARDS */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* SECTION A: Product Identity */}
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                      <FileText size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>A. Product Registry</span>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Product Category *</label>
                      <select className="custom-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
                        <option value="Tablets">Tablets / Capsules</option>
                        <option value="Liquids">Syrups / Liquids / Creams</option>
                        <option value="Equipments">Surgicals / Equipments / General</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Medicine Name *</label>
                      <input type="text" className="custom-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paracetamol 650" />
                    </div>

                    {category === 'Tablets' && (
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label>Generic Name / Salt composition</label>
                        <input type="text" className="custom-input" value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="e.g. Paracetamol IP" />
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Batch Number *</label>
                      <input type="text" className="custom-input" required value={batchNo} onChange={(e) => setBatchNo(e.target.value)} placeholder="e.g. BATCH8920" />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input type="date" className="custom-input" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                    </div>
                  </div>

                  {/* SECTION B: Packaging Specifications (Differentiated by Category) */}
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                      <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>B. Packaging Specifications</span>
                    </div>

                    {category === 'Tablets' && (
                      <>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Boxes Count (Cartons) *</label>
                            <input type="number" min="0" className="custom-input" required value={boxes} onChange={(e) => setBoxes(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Packs per Box *</label>
                            <input type="number" min="1" className="custom-input" required value={packsPerBox} onChange={(e) => setPacksPerBox(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <label>Tablets count per Pack *</label>
                          <input type="number" min="1" className="custom-input" required value={tabletsPerPack} onChange={(e) => setTabletsPerPack(e.target.value)} />
                        </div>
                      </>
                    )}

                    {category === 'Liquids' && (
                      <>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Boxes Count (Cartons) *</label>
                            <input type="number" min="0" className="custom-input" required value={boxes} onChange={(e) => setBoxes(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Bottles per Box *</label>
                            <input type="number" min="1" className="custom-input" required value={packsPerBox} onChange={(e) => setPacksPerBox(e.target.value)} />
                          </div>
                        </div>
                      </>
                    )}

                    {category === 'Equipments' && (
                      <div className="form-group">
                        <label>Total Units Count (Pieces) *</label>
                        <input type="number" min="1" className="custom-input" required value={boxes} onChange={(e) => setBoxes(e.target.value)} />
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label>Safety Threshold Limit (Units)</label>
                      <input type="number" min="1" className="custom-input" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
                    </div>
                  </div>

                  {/* SECTION C: Valuation & Costing */}
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                      <Coins size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>C. Valuation & Costing</span>
                    </div>
                    
                    <div className="form-group">
                      <label>
                        {category === 'Tablets' && 'Purchase Cost Price per Pack *'}
                        {category === 'Liquids' && 'Purchase Cost Price per Bottle *'}
                        {category === 'Equipments' && 'Purchase Cost Price per Unit *'}
                      </label>
                      <input type="number" step="0.01" min="0" className="custom-input" required value={packPurchasePrice} onChange={(e) => setPackPurchasePrice(e.target.value)} placeholder="₹ Cost per unit" />
                    </div>

                    {/* ERP Summary Calculation */}
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 850, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Calculated Ledger Values:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                        {category === 'Tablets' && (
                          <>
                            <div><strong>Total Packs:</strong> {Number(boxes) * Number(packsPerBox)}</div>
                            <div><strong>Total Tablets:</strong> {Number(boxes) * Number(packsPerBox) * Number(tabletsPerPack)} Units</div>
                            <div><strong>Unit Cost:</strong> ₹{(Number(tabletsPerPack) > 0 ? (Number(packPurchasePrice) / Number(tabletsPerPack)) : 0).toFixed(2)} / Tablet</div>
                          </>
                        )}
                        {category === 'Liquids' && (
                          <>
                            <div><strong>Total Bottles:</strong> {Number(boxes) * Number(packsPerBox)} Units</div>
                            <div><strong>Unit Bottle Cost:</strong> ₹{Number(packPurchasePrice).toFixed(2)}</div>
                          </>
                        )}
                        {category === 'Equipments' && (
                          <>
                            <div><strong>Total Quantity:</strong> {Number(boxes)} Units</div>
                            <div><strong>Unit Device Cost:</strong> ₹{Number(packPurchasePrice).toFixed(2)}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* RESPONSIVE STACKED CARD BULK ADD SHEET */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {bulkItems.map((item, idx) => (
                    <div key={item.id} className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative', boxShadow: 'var(--shadow-sm)' }}>
                      
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', fontSize: '0.75rem' }}>
                            {idx + 1}
                          </span>
                          Product Card Entry ({item.category})
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select 
                            className="custom-select" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: '30px' }}
                            value={item.category} 
                            onChange={(e) => handleBulkChange(item.id, 'category', e.target.value)}
                          >
                            <option value="Tablets">Tablets / Capsules</option>
                            <option value="Liquids">Liquids / Bottles / Syrups</option>
                            <option value="Equipments">Surgicals / Equipments / General</option>
                          </select>
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            style={{ padding: '0.3rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: 'none' }}
                            disabled={bulkItems.length === 1}
                            onClick={() => handleDeleteBulkRow(item.id)}
                          >
                            <Trash2 size={14} /> Remove Card
                          </button>
                        </div>
                      </div>

                      {/* Inputs Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Medicine/Item Name *</label>
                          <input 
                            type="text" 
                            required 
                            className="custom-input" 
                            placeholder={item.category === 'Equipments' ? 'e.g. Syringe 5ml / BP Machine' : 'e.g. Paracetamol'}
                            value={item.name} 
                            onChange={(e) => handleBulkChange(item.id, 'name', e.target.value)} 
                          />
                        </div>

                        {item.category === 'Tablets' && (
                          <div className="form-group">
                            <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Generic Name / Salt</label>
                            <input 
                              type="text" 
                              className="custom-input" 
                              placeholder="e.g. Paracetamol IP"
                              value={item.genericName} 
                              onChange={(e) => handleBulkChange(item.id, 'genericName', e.target.value)} 
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Batch No. *</label>
                          <input 
                            type="text" 
                            required 
                            className="custom-input" 
                            style={{ fontFamily: 'monospace' }}
                            placeholder="BATCH123"
                            value={item.batchNo} 
                            onChange={(e) => handleBulkChange(item.id, 'batchNo', e.target.value)} 
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Expiry Date *</label>
                          <input 
                            type="date" 
                            required 
                            className="custom-input" 
                            value={item.expiryDate} 
                            onChange={(e) => handleBulkChange(item.id, 'expiryDate', e.target.value)} 
                          />
                        </div>

                        {item.category === 'Tablets' && (
                          <>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Boxes Count *</label>
                              <input 
                                type="number" 
                                min="0" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.boxes} 
                                onChange={(e) => handleBulkChange(item.id, 'boxes', e.target.value)} 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Packs per Box *</label>
                              <input 
                                type="number" 
                                min="1" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.packsPerBox} 
                                onChange={(e) => handleBulkChange(item.id, 'packsPerBox', e.target.value)} 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Tablets per Pack *</label>
                              <input 
                                type="number" 
                                min="1" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.tabletsPerPack} 
                                onChange={(e) => handleBulkChange(item.id, 'tabletsPerPack', e.target.value)} 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Cost per Pack *</label>
                              <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.packPurchasePrice} 
                                onChange={(e) => handleBulkChange(item.id, 'packPurchasePrice', e.target.value)} 
                              />
                            </div>
                          </>
                        )}

                        {item.category === 'Liquids' && (
                          <>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Boxes Count *</label>
                              <input 
                                type="number" 
                                min="0" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.boxes} 
                                onChange={(e) => handleBulkChange(item.id, 'boxes', e.target.value)} 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Bottles per Box *</label>
                              <input 
                                type="number" 
                                min="1" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.packsPerBox} 
                                onChange={(e) => handleBulkChange(item.id, 'packsPerBox', e.target.value)} 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Cost per Bottle *</label>
                              <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.packPurchasePrice} 
                                onChange={(e) => handleBulkChange(item.id, 'packPurchasePrice', e.target.value)} 
                              />
                            </div>
                          </>
                        )}

                        {item.category === 'Equipments' && (
                          <>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Units Count *</label>
                              <input 
                                type="number" 
                                min="1" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.boxes} 
                                onChange={(e) => handleBulkChange(item.id, 'boxes', e.target.value)} 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Cost per Unit *</label>
                              <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                required 
                                className="custom-input" 
                                style={{ textAlign: 'right' }}
                                value={item.packPurchasePrice} 
                                onChange={(e) => handleBulkChange(item.id, 'packPurchasePrice', e.target.value)} 
                              />
                            </div>
                          </>
                        )}

                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Min Alert threshold</label>
                          <input 
                            type="number" 
                            min="1" 
                            className="custom-input" 
                            style={{ textAlign: 'right' }}
                            value={item.minStock} 
                            onChange={(e) => handleBulkChange(item.id, 'minStock', e.target.value)} 
                          />
                        </div>
                      </div>

                      {/* Mini Cost calculations */}
                      <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '6px', marginTop: '1rem', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {item.category === 'Tablets' && (
                          <>
                            <div>📦 <strong>Calculated Packs:</strong> {Number(item.boxes) * Number(item.packsPerBox)}</div>
                            <div>💊 <strong>Total Tablets:</strong> {Number(item.boxes) * Number(item.packsPerBox) * Number(item.tabletsPerPack)} Units</div>
                            <div>💵 <strong>Unit Tablet Cost:</strong> ₹{(Number(item.tabletsPerPack) > 0 ? (Number(item.packPurchasePrice) / Number(item.tabletsPerPack)) : 0).toFixed(2)}</div>
                          </>
                        )}
                        {item.category === 'Liquids' && (
                          <>
                            <div>📦 <strong>Calculated Bottles:</strong> {Number(item.boxes) * Number(item.packsPerBox)} Units</div>
                            <div>💵 <strong>Cost per Bottle:</strong> ₹{Number(item.packPurchasePrice).toFixed(2)}</div>
                          </>
                        )}
                        {item.category === 'Equipments' && (
                          <>
                            <div>🛠️ <strong>Total Units:</strong> {Number(item.boxes)} Units</div>
                            <div>💵 <strong>Cost per Unit:</strong> ₹{Number(item.packPurchasePrice).toFixed(2)}</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ alignSelf: 'flex-start', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                    onClick={handleAddBulkRow}
                  >
                    <Plus size={14} /> Add Another Product Card
                  </button>
                </div>
              )}
            </div>

            {/* STATIC BOTTOM ACTIONS BAR */}
            <div style={{ 
              background: '#ffffff', 
              borderTop: '2px solid var(--border-color)', 
              padding: '1.25rem 2rem', 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '1rem', 
              borderRadius: '0',
              boxShadow: '0 -4px 10px -4px rgba(0, 0, 0, 0.08)'
            }}>
              <button type="button" className="btn btn-secondary" onClick={() => changeView('list')}>Cancel & Return</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 700 }}>
                <Save size={16} /> {view === 'edit' ? 'Save Changes' : `Confirm & Save (${bulkItems.length} Products)`}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
