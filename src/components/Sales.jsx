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

      {/* 2. PHARMACY CASH MEMO / INVOICE (PRINT ONLY) */}
      {lastInvoice && (
        <div id="print-invoice" style={{ display: 'none', fontFamily: '"Arial", sans-serif', color: '#000', fontSize: '12px' }}>
          
          {/* Header: Store Info */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>NETRA PHARMACY</div>
            <div style={{ fontSize: '11px', marginTop: '3px' }}>Netra Pharmacy Hall, Main Road, Bangalore - 560076</div>
            <div style={{ fontSize: '11px' }}>Phone: +91-9876543210 | GSTIN: 29ABCDE1234F1Z5 | DL No.: KA-BLR-2024-001</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '8px', letterSpacing: '2px', textTransform: 'uppercase', borderTop: '1px dashed #000', paddingTop: '6px' }}>
              CASH MEMO / RETAIL INVOICE
            </div>
          </div>

          {/* Bill Meta: Invoice No & Date + Patient & Doctor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', border: '1px solid #999', padding: '8px', marginBottom: '10px', fontSize: '12px' }}>
            <div><strong>Invoice No.:</strong> {lastInvoice.id}</div>
            <div><strong>Date &amp; Time:</strong> {lastInvoice.date} | {lastInvoice.time}</div>
            <div><strong>Patient Name:</strong> {lastInvoice.customerName || 'Walk-in Customer'}</div>
            <div><strong>Doctor Name:</strong> {lastInvoice.doctorName || 'Self'}</div>
          </div>

          {/* Medicines Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '8px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                <th style={{ padding: '5px 4px', textAlign: 'left', width: '30px' }}>S.No</th>
                <th style={{ padding: '5px 4px', textAlign: 'left' }}>Medicine Name</th>
                <th style={{ padding: '5px 4px', textAlign: 'left', width: '90px' }}>Batch No.</th>
                <th style={{ padding: '5px 4px', textAlign: 'left', width: '90px' }}>Exp. Date</th>
                <th style={{ padding: '5px 4px', textAlign: 'center', width: '45px' }}>Qty</th>
                <th style={{ padding: '5px 4px', textAlign: 'right', width: '80px' }}>Unit Price</th>
                <th style={{ padding: '5px 4px', textAlign: 'right', width: '85px' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {lastInvoice.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px dashed #ccc' }}>
                  <td style={{ padding: '5px 4px' }}>{idx + 1}</td>
                  <td style={{ padding: '5px 4px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '10px', color: '#555' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '5px 4px', fontFamily: 'monospace' }}>{item.batchNo}</td>
                  <td style={{ padding: '5px 4px' }}>{new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '5px 4px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right' }}>₹{item.salesPrice.toFixed(2)}</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 'bold' }}>₹{(item.salesPrice * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <div style={{ width: '260px', border: '1px solid #999', padding: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal:</span>
                <span>₹{lastInvoice.subtotal.toFixed(2)}</span>
              </div>
              {lastInvoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#c00' }}>
                  <span>Discount:</span>
                  <span>- ₹{lastInvoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #000', paddingTop: '6px', marginTop: '4px' }}>
                <span>TOTAL:</span>
                <span>₹{lastInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div style={{ borderTop: '1px dashed #999', paddingTop: '6px', marginBottom: '14px', fontSize: '11px' }}>
            <strong>Amount in Words:</strong> {amountToWords(lastInvoice.total)} RUPEES ONLY
          </div>

          {/* Footer */}
          <div style={{ borderTop: '2px solid #000', paddingTop: '8px', fontSize: '10px', color: '#444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Terms & Conditions:</div>
                <div>1. Goods once sold cannot be returned/exchanged.</div>
                <div>2. Kindly verify medicines before leaving the counter.</div>
                <div>3. This is a computer generated invoice.</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '30px' }}>Authorised Signatory</div>
                <div style={{ borderTop: '1px solid #000', paddingTop: '4px', minWidth: '130px' }}>NETRA PHARMACY</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', borderTop: '1px dashed #999', paddingTop: '6px' }}>
              Thank you for choosing Netra Pharmacy! | For queries: netra@yopmail.com
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

