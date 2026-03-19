import React, { useState, useEffect } from 'react';
import api from '../api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

const Products = ({ user, addToCart }) => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // Owner specific state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('दाल');
  const [newProductType, setNewProductType] = useState('family');
  const [newProductImage, setNewProductImage] = useState('');
  
  const [whatsappNumber, setWhatsappNumber] = useState('9822111304');

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings');
      if (res.data.whatsappNumber) setWhatsappNumber(res.data.whatsappNumber);
    } catch (err) {
      console.error('Error fetching settings', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();

    // Socket.IO for real-time updates
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Socket.IO connected to:', SOCKET_URL, 'ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });

    socket.on('products_updated', () => {
      console.log('Real-time update received: Refreshing products...');
      fetchProducts();
    });

    socket.on('settings_updated', (newSettings) => {
      console.log('Real-time settings update received:', newSettings);
      if (newSettings && newSettings.whatsappNumber) {
        setWhatsappNumber(newSettings.whatsappNumber);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateWhatsAppNumber = async () => {
    if (!/^\d{10}$/.test(whatsappNumber)) {
      alert('कृपया 10 अंकों का सही मोबाइल नंबर डालें!');
      return;
    }
    
    try {
      await api.post('/api/settings', { whatsappNumber });
      alert('✅ व्हाट्सएप नंबर सफलतापूर्वक अपडेट हो गया! अब सभी ऑर्डर इसी नंबर पर जाएंगे।');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error updating settings';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName || !newProductPrice || !newProductWeight) {
      alert('कृपया उत्पाद का नाम, कीमत और वजन भरें!');
      return;
    }
    
    // Simulate finding a unique ID for frontend mock DB style
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    
    const newProduct = {
      id: maxId + 1,
      name: newProductName,
      price: Number(newProductPrice),
      weight: newProductWeight,
      category: newProductCategory,
      type: newProductType,
      img: newProductImage || 'https://via.placeholder.com/150?text=No+Image'
    };

    try {
      await api.post('/api/products', newProduct);
      alert('✅ नया उत्पाद जुड़ गया!');
      setNewProductName('');
      setNewProductPrice('');
      setNewProductWeight('');
      setNewProductImage('');
      fetchProducts(); // Refresh list from DB
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error adding product';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleUpdateProduct = async (id) => {
    const newPrice = document.getElementById(`price-edit-${id}`).value;
    const newImg = document.getElementById(`img-edit-${id}`).value;
    
    if(!newPrice || isNaN(newPrice)) {
      alert('कृपया सही कीमत डालें!');
      return;
    }
    
    try {
      await api.put(`/api/products/${id}`, { 
        price: Number(newPrice),
        img: newImg
      });
      alert('✅ उत्पाद सफलतापूर्वक अपडेट हो गया!');
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error updating product';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('क्या आप सच में इसे हटाना चाहते हैं?')) {
      try {
        await api.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Error deleting product';
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  // UI Rendering Helpers
  /**
   * Renders a single product card with dynamic image and owner controls
   */
  const renderProductCard = (product) => {
    // Determine the source URL: remote URL or local public path
    const imgSrc = product.img.startsWith('http') ? product.img : `/${product.img}`;
    
    return (
      <div className="product-card" key={product.id}>
        {user?.role === 'owner' && (
          <button 
            className="delete-product-btn" 
            title="उत्पाद हटाएं" 
            onClick={() => handleDeleteProduct(product.id)}
          >
            ×
          </button>
        )}
        
        {product.type === 'budget' && <span className="budget-badge">बजट पैक</span>}
        
        <img 
          src={imgSrc} 
          alt={product.name} 
          className="product-img"
          onError={(e) => { e.target.src = '/images/general.png'; }} // Robust fallback
        />
        
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-weight">{product.weight}</p>
          <p className="product-price">₹{product.price}</p>
          
          {user?.role === 'owner' ? (
            <div className="price-edit" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="number" 
                defaultValue={product.price} 
                id={`price-edit-${product.id}`}
                placeholder="नई कीमत"
                className="edit-input"
              />
              <input 
                type="text" 
                defaultValue={product.img} 
                id={`img-edit-${product.id}`}
                placeholder="इमेज पाथ (eg: images/kaju.jpg)"
                className="edit-input"
              />
              <button 
                className="update-btn"
                onClick={() => handleUpdateProduct(product.id)}
              >
                अपडेट करें
              </button>
            </div>
          ) : (
            <button 
              className="add-to-cart" 
              onClick={() => addToCart(product)}
            >
              कार्ट में डालें ++
            </button>
          )}
        </div>
      </div>
    );
  };

  const familyProducts = products.filter(p => p.type === 'family' && (filter === 'all' || p.category === filter));
  const budgetProducts = products.filter(p => p.type === 'budget' && (filter === 'all' || p.category === filter));

  const categories = ['all', 'दाल', 'मसाले', 'आटा', 'तेल', 'बिस्कुट ', 'अन्य', 'सूखे मेवे', 'बजट'];

  return (
    <section id="products" className="page active-page">
      <h2 style={{ fontSize: '2.5rem', textAlign: 'center' }}>हमारे उत्पाद</h2>

      {user?.role === 'owner' && (
        <>
          <div className="owner-settings">
            <h3>📱 व्हाट्सएप सेटिंग्स</h3>
            <div className="whatsapp-settings">
              <div className="form-group">
                <label>व्हाट्सएप नंबर अपडेट करें (भारत के लिए बिना +91 के)</label>
                <input 
                  type="text" 
                  value={whatsappNumber} 
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="जैसे: 9822111304" 
                />
                <small style={{ color: '#666' }}>यही नंबर ग्राहकों के ऑर्डर भेजने के लिए उपयोग होगा</small>
              </div>
              <button onClick={updateWhatsAppNumber}><i className="fab fa-whatsapp"></i> नंबर अपडेट करें</button>
            </div>
          </div>

          <div className="owner-controls owner-settings" style={{ border: '2px solid #2874f0', background: '#f5f9ff' }}>
            <h3 style={{ color: '#2874f0' }}>✨ नया उत्पाद जोड़ें</h3>
            <div className="add-product-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>उत्पाद का नाम</label>
                <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="जैसे: चावल" />
              </div>
              <div className="form-group">
                <label>कीमत (₹)</label>
                <input type="number" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} placeholder="जैसे: 100" min="1" />
              </div>
              <div className="form-group">
                <label>वजन / मात्रा</label>
                <input type="text" value={newProductWeight} onChange={e => setNewProductWeight(e.target.value)} placeholder="जैसे: 1kg, 500gm" />
              </div>
              <div className="form-group">
                <label>कैटेगरी</label>
                <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)}>
                  {categories.filter(c => c !== 'all' && c !== 'बजट').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>सेक्शन</label>
                <select value={newProductType} onChange={e => setNewProductType(e.target.value)}>
                  <option value="family">परिवारिक पैक (1kg)</option>
                  <option value="budget">छोटा खर्च (बजट)</option>
                </select>
              </div>
              <div className="form-group">
                <label>इमेज URL (optional)</label>
                <input type="text" value={newProductImage} onChange={e => setNewProductImage(e.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <button className="add-to-cart-btn" style={{ gridColumn: '1 / -1', marginTop: '1rem' }} onClick={handleAddProduct}>
                ➕ उत्पाद जोड़ें
              </button>
            </div>
          </div>
        </>
      )}

      <div className="category-filter">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'सभी' : cat === 'बजट' ? 'छोटा खर्च' : cat}
          </button>
        ))}
      </div>

      <div className="section-header">
        <i className="fas fa-box"></i>
        <h3>परिवारिक पैक (1kg)</h3>
        <i className="fas fa-box"></i>
      </div>
      <p className="section-tagline">पूरे परिवार के लिए एक साथ खरीदारी</p>
      <div className="product-grid">
        {familyProducts.length > 0 ? familyProducts.map(renderProductCard) : <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>कोई उत्पाद नहीं मिला</p>}
      </div>

      <div className="section-header">
        <i className="fas fa-coins"></i>
        <h3>छोटा खर्च, बड़ी खुशी</h3>
        <i className="fas fa-coins"></i>
      </div>
      <p className="section-tagline">₹5, ₹10, ₹20 में छोटी-छोटी चीज़ें - हर आम आदमी के लिए</p>
      <div className="product-grid">
        {budgetProducts.length > 0 ? budgetProducts.map(renderProductCard) : <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>कोई उत्पाद नहीं मिला</p>}
      </div>
    </section>
  );
};

export default Products;
