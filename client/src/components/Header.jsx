import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, cartCount, toggleCart, onLogout }) => {
  const location = useLocation();

  return (
    <header id="mainHeader">
      <div className="logo">
        <h1>गाँव किराना</h1>
        <span>हर चीज़ घर द्वार</span>
      </div>
      <nav>
        <ul>
          <li><Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>होम</Link></li>
          <li><Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>उत्पाद</Link></li>
          <li><Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>हमारे बारे</Link></li>
        </ul>
      </nav>
      <div className="user-controls">
        <div className="cart-icon" id="cartToggle" onClick={toggleCart}>
          <i className="fas fa-shopping-cart"></i> <span id="cartCount">{cartCount}</span>
        </div>
        
        {user.role === 'owner' ? (
          <>
            <span className="owner-badge">👑 ओनर</span>
            <button type="button" className="logout-btn" style={{ background: '#ff6f00' }} onClick={onLogout}>लॉगआउट</button>
          </>
        ) : (
          <>
            <span className="user-greeting">👤 {user.name}</span>
            <button type="button" className="logout-btn" style={{ background: '#25a244' }} onClick={onLogout}>लॉगआउट</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
