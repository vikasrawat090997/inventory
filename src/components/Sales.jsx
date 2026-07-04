import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, Search } from 'lucide-react';

export default function Sales({ medicines, sales, createSale }) {
  const [cart, setCart] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  
  // Search query to select medicines
  const [searchFilter, setSearchFilter] = useState('');

  // Invoice Print state reference
  const [lastInvoice, setLastInvoice] = useState(null);

  // 1. Get selectable medicines (must have stock > 0, and not expired)
  const today = new Date();
  const availableMedicines = medicines.filter(med => {
    const isNotExpired = new Date(med.expiryDate) >= today;
    const matchesSearch = med.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          (med.category && med.category.toLowerCase().includes(searchFilter.toLowerCase())) ||
                          (med.genericName && med.genericName.toLowerCase().includes(searchFilter.toLowerCase()));
    return isNotExpired && matchesSearch;
  });

  const selectedMed = medicines.find(m => m.id === selectedMedId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedMedId) return;

    const med = medicines.find(m => m.id === selectedMedId);
    if (!med) return;

    // Check stock limits (include quantity already in cart)
    const existingInCart = cart.find(item => item.id === med.id);
    const totalQtyNeeded = Number(quantity) + (existingInCart ? existingInCart.qty : 0);

    if (totalQtyNeeded > med.stock) {
      alert(`Insufficient stock! Only ${med.stock} units available.`);
      return;
    }

    if (existingInCart) {
      setCart(cart.map(item => 
        item.id === med.id ? { ...item, qty: totalQtyNeeded } : item
      ));
    } else {
      setCart([...cart, {
        id: med.id,
        name: med.name,
        batchNo: med.batchNo,
        expiryDate: med.expiryDate,
        category: med.category || 'Tablets',
        salesPrice: med.purchasePrice, // Map billing price directly to unit cost
        qty: Number(quantity)
      }]);
    }

    setQuantity(1);
    setSelectedMedId('');
    setSearchFilter('');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.salesPrice * item.qty), 0);
  const discountVal = (subtotal * Number(discountPercent)) / 100;
  const total = subtotal - discountVal;

  const handleCheckoutAndPrint = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Create new transaction structure
    const invoiceId = `ICR${Date.now().toString().slice(-5)}`;
    const saleData = {
      id: invoiceId,
      customerName: customerName || 'Sareena Kumar V',
      doctorName: doctorName || 'Dr. Self / Dr. Sharma',
      items: cart,
      subtotal,
      discount: discountVal,
      total,
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Save record to database
    createSale(saleData);

    // Store in print reference
    setLastInvoice(saleData);

    // Call browser Print Dialog asynchronously
    setTimeout(() => {
      window.print();
      // Clear out billing form
      setCart([]);
      setCustomerName('');
      setDoctorName('');
      setDiscountPercent(0);
    }, 300);
  };

  // Helper function to convert number to words for Apollo Style invoice
  const amountToWords = (amount) => {
    const a = ['','ONE ','TWO ','THREE ','FOUR ','FIVE ','SIX ','SEVEN ','EIGHT ','NINE ','TEN ','ELEVEN ','TWELVE ','THIRTEEN ','FOURTEEN ','FIFTEEN ','SIXTEEN ','SEVENTEEN ','EIGHTEEN ','NINETEEN '];
    const b = ['', '', 'TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
    
    const numToWords = (num) => {
      if ((num = num.toString()).length > 9) return 'OVERFLOW';
      let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return ''; 
      let str = '';
      str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
      str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
      str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
      str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
      str += (Number(n[5]) != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'ONLY' : '';
      return str.replace(/\s+/g, ' ');
    };

    const main = Math.floor(amount);
    const paise = Math.round((amount - main) * 100);
    let result = numToWords(main);
    if (paise > 0) {
      result = result.replace('ONLY', '') + 'AND ' + numToWords(paise).replace('ONLY', '') + 'PAISE ONLY';
    }
    return result.trim();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. POS WORKSPACE LAYOUT (HIDDEN ON PRINT) */}
      <div className="billing-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 1.25fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Invoice Cart & Product Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card A: Cart Controls & Product Search */}
          <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} style={{ color: 'var(--accent-cyan)' }} />
              Active POS Invoice Station
            </h3>
            
            <form onSubmit={handleAddToCart} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Customer Name (Patient)</label>
                  <input 
                    type="text" 
                    className="custom-input" 
                    placeholder="e.g. Rahul Kumar (Leave blank for Walk-in)" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Consultant Doctor Name</label>
                  <input 
                    type="text" 
                    className="custom-input" 
                    placeholder="e.g. Dr. A. K. Sharma" 
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Search Medicine</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="custom-input" 
                      style={{ paddingLeft: '2.2rem' }}
                      placeholder="Type to filter..." 
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Choose Medicine *</label>
                  <select 
                    className="custom-select" 
                    required 
                    value={selectedMedId} 
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">-- Select Product --</option>
                    {availableMedicines.map(m => (
                      <option key={m.id} value={m.id} style={{ color: m.stock === 0 ? 'var(--color-danger)' : 'inherit' }}>
                        [{m.category || 'Tablets'}] {m.name} (Batch: {m.batchNo} | Stock: {m.stock === 0 ? 'OUT OF STOCK' : (m.category === 'Tablets' ? `${Math.floor(m.stock/10)} Packs` : `${m.stock} Units`)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Quantity *</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    className="custom-input" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={selectedMed && selectedMed.stock === 0}
                  />
                </div>

              </div>

              {selectedMed && selectedMed.stock > 0 && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--info-bg)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', color: 'var(--color-info)' }}>
                  <span>📦 <strong>Available Stock:</strong> {selectedMed.stock} basic units</span>
                  <span>💵 <strong>Unit Price:</strong> ₹{selectedMed.purchasePrice.toFixed(2)}</span>
                </div>
              )}

              {selectedMed && selectedMed.stock === 0 && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                  <span>❌ <strong>Out of Stock!</strong> Cannot add this item to the billing cart until replenished.</span>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!selectedMedId || (selectedMed && selectedMed.stock === 0)}
                style={{ alignSelf: 'flex-end', padding: '0.6rem 1.5rem', fontWeight: 700 }}
              >
                <Plus size={16} /> Add Product to Cart
              </button>
            </form>
          </div>

          {/* Card B: Cart Ledger Table */}
          <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 750, marginBottom: '1rem', color: 'var(--text-primary)' }}>Items added to Invoice</h4>
            
            <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th>Medicine Description</th>
                    <th>Batch</th>
                    <th style={{ textAlign: 'right' }}>Billing Rate</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total Price</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{item.name}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.batchNo}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.salesPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)' }}>₹{(item.salesPrice * item.qty).toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-danger" 
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.75rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              border: '1px solid rgba(220,38,38,0.2)',
                              background: 'rgba(220,38,38,0.05)',
                              color: 'var(--color-danger)'
                            }} 
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No items added to invoice cart yet. Select products above to populate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Ledger Billing Summary */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0 }}>Invoice Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span style={{ fontWeight: 700 }}>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="form-group" style={{ margin: '0.5rem 0' }}>
              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Discount (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                className="custom-input" 
                value={discountPercent} 
                onChange={(e) => setDiscountPercent(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
              <span>Discount Amt:</span>
              <span style={{ fontWeight: 700 }}>- ₹{discountVal.toFixed(2)}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
              <strong>Grand Total:</strong>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary" 
            disabled={cart.length === 0}
            onClick={handleCheckoutAndPrint}
            style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 800, display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
          >
            <Printer size={18} /> Checkout & Print PDF
          </button>
        </div>

      </div>

      {/* 2. REAL APOLLO HOSPITAL STYLE PDF INVOICE TEMPLATE (HIDDEN UNTIL PRINT DIALOG) */}
      {lastInvoice && (
        <div id="print-invoice" style={{ display: 'none', fontFamily: 'Arial, sans-serif', padding: '1.5rem', color: '#000000' }}>
          
          {/* Apollo Hospitals Outer Border Header Container */}
          <div style={{ border: '1px solid #000000', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Apollo Logo Icon style */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #0d9488', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0d9488', lineHeight: 1 }}>✚</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#0d9488', letterSpacing: '0.5px', marginTop: '2px' }}>RxKeep</span>
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#003366', margin: 0, letterSpacing: '0.5px' }}>APOLLO HOSPITALS</h1>
                <p style={{ fontSize: '0.65rem', margin: '0.1rem 0 0 0', fontWeight: 'bold', color: '#334155' }}>
                  Opposite IIMB, 154/11, Amalodbhavi Nagar, Panduranga Nagar,
                </p>
                <p style={{ fontSize: '0.65rem', margin: 0, color: '#334155' }}>
                  Bangalore - 560076 (India) Tel.: +(91)-80-26304050 / 26304051 Fax: +(91)-80-41463151
                </p>
              </div>
            </div>
            
            {/* Red Emergency Box */}
            <div style={{ background: '#dc2626', color: '#ffffff', padding: '0.5rem 1rem', textAlign: 'center', borderRadius: '2px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Emergency</span>
              <span style={{ fontSize: '1rem', fontWeight: 900 }}>✚ 1066</span>
            </div>
          </div>

          {/* Subtitle */}
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <div style={{ borderTop: '1px double #000', borderBottom: '1px double #000', padding: '0.2rem 0', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', display: 'inline-block', width: '100%' }}>
              INPATIENT BILL
            </div>
          </div>

          {/* Patient Details Outer Outlined Box (Exactly like Apollo Template) */}
          <div style={{ border: '1px solid #000000', display: 'grid', gridTemplateColumns: '1.25fr 1fr', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
            
            {/* Left Box Column */}
            <div style={{ padding: '0.75rem', borderRight: '1px solid #000000' }}>
              <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
                Patient Details
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{lastInvoice.customerName}</div>
              <div style={{ color: '#475569', lineHeight: 1.3 }}>
                A2 Nagesan Nagar, Vadalur,<br />
                Cuddalore Taluk, Bangalore District,<br />
                Karnataka - 560076 (India)
              </div>
            </div>

            {/* Right Box Column */}
            <div style={{ padding: '0.75rem', display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', rowGap: '0.3rem', alignContent: 'start' }}>
              <span><strong>IP No. :</strong> 97103</span>
              <span><strong>ID No. :</strong> 0000246611</span>
              <span><strong>Bill No. :</strong> {lastInvoice.id}</span>
              <span><strong>Doctor :</strong> {lastInvoice.doctorName}</span>
              <span style={{ gridColumn: 'span 2' }}><strong>Bill Dt/Time:</strong> {lastInvoice.date} {lastInvoice.time}</span>
              <span style={{ gridColumn: 'span 2' }}><strong>Admission Dt/Time:</strong> {lastInvoice.date} 10:00 AM</span>
              <span style={{ gridColumn: 'span 2' }}><strong>Discharge Dt/Time:</strong> {lastInvoice.date} 04:30 PM</span>
            </div>
          </div>

          {/* Details header */}
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '0.2rem 0', fontWeight: 'bold', fontSize: '0.8rem', width: '100%' }}>
              DETAILS
            </div>
          </div>

          {/* Details Table */}
          <table className="print-table" style={{ fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000000' }}>
                <th style={{ background: 'none !important', borderBottom: '1px solid #000000 !important', padding: '0.3rem', width: '50px' }}>S.No</th>
                <th style={{ background: 'none !important', borderBottom: '1px solid #000000 !important', padding: '0.3rem' }}>Service Name / Particulars</th>
                <th style={{ background: 'none !important', borderBottom: '1px solid #000000 !important', padding: '0.3rem', width: '120px' }}>Batch Code</th>
                <th style={{ background: 'none !important', borderBottom: '1px solid #000000 !important', padding: '0.3rem', width: '100px' }}>Category</th>
                <th style={{ background: 'none !important', borderBottom: '1px solid #000000 !important', padding: '0.3rem', textAlign: 'center', width: '60px' }}>Qty</th>
                <th style={{ background: 'none !important', borderBottom: '1px solid #000000 !important', padding: '0.3rem', textAlign: 'right', width: '120px' }}>Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {lastInvoice.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '0.3rem' }}>{idx + 1}</td>
                  <td style={{ padding: '0.3rem' }}>{item.name.toUpperCase()}</td>
                  <td style={{ padding: '0.3rem', fontFamily: 'monospace' }}>{item.batchNo}</td>
                  <td style={{ padding: '0.3rem' }}>{item.category.toUpperCase()}</td>
                  <td style={{ padding: '0.3rem', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '0.3rem', textAlign: 'right' }}>{item.salesPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing calculations */}
          <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '0.5rem 0', display: 'flex', justifyContent: 'flex-end', fontSize: '0.85rem', marginTop: '1rem' }}>
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bill Subtotal:</span>
                <span>{lastInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Discount Allowed:</span>
                <span>- {lastInvoice.discount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px double #000', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
                <span>Bill Amount :</span>
                <span>{lastInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* In Words representation */}
          <div style={{ fontSize: '0.8rem', marginTop: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <strong>In Words :</strong><br />
            {amountToWords(lastInvoice.total)}
          </div>

          {/* Regulatory texts */}
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '1.5rem', lineHeight: 1.4 }}>
            <p style={{ margin: '0.2rem 0' }}><strong>Refundable Deposit As On {lastInvoice.date} {lastInvoice.time} Rs.5000</strong></p>
            <p style={{ margin: '0.2rem 0' }}>* This is a computer generated statement and requires no signature.</p>
            <p style={{ margin: '0.2rem 0' }}>* This Receipt is valid for an employer or insurer, who is contractually obligated to reimburse the medical expenses covered by MediSave and/or MedShield.</p>
            <p style={{ margin: '0.2rem 0' }}>* For billing and general enquiries, please mail customercare_bangalore@apollohospitals.com</p>
            <p style={{ margin: '1rem 0 0 0', textAlign: 'center' }}>© Apollo Hospitals, Bangalore 2013, All Rights reserved</p>
          </div>

        </div>
      )}

    </div>
  );
}
