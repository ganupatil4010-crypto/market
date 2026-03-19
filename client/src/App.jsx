import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Login from './pages/Login';
import api from './api';
import './index.css';

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null); // { name, phone, role }

  // Add a function to sync cart with backend
  const syncCartWithBackend = async (newCart, currentUser) => {
    if (currentUser && currentUser.phone) {
      try {
        await api.post('/api/cart', { phone: currentUser.phone, cart: newCart });
      } catch (err) {
        console.error('Error syncing cart with backend', err);
      }
    }
  };

  const saveCart = (newCart, currentUser) => {
    setCart(newCart);
    if (currentUser && currentUser.role !== 'owner') {
      localStorage.setItem(`cart_${currentUser.phone}`, JSON.stringify(newCart));
      syncCartWithBackend(newCart, currentUser);
    } else {
      localStorage.setItem('cart', JSON.stringify(newCart));
      if (currentUser?.role === 'owner') syncCartWithBackend(newCart, currentUser);
    }
  };

  const fetchAndMergeCart = async (currentUser) => {
    try {
      // 1. Get cart from backend
      const res = await api.get(`/api/cart?phone=${currentUser.phone}`);
      const backendCart = res.data;

      // 2. Get cart from localStorage
      const localCartKey = currentUser.role === 'owner' ? 'cart' : `cart_${currentUser.phone}`;
      const localCart = JSON.parse(localStorage.getItem(localCartKey) || '[]');

      // 3. Merge: Simple merge based on ID (backend takes precedence for quantity if conflict, or combine)
      const mergedCart = [...backendCart];
      localCart.forEach(localItem => {
        const existing = mergedCart.find(item => item.id === localItem.id);
        if (!existing) {
          mergedCart.push(localItem);
        } else {
          // If exists in both, maybe take max quantity or local? 
          // Let's take the higher one or sum them. Summing is safer for not losing items.
          existing.qty = Math.max(existing.qty, localItem.qty);
        }
      });

      setCart(mergedCart);
      // Sync merged back to both
      localStorage.setItem(localCartKey, JSON.stringify(mergedCart));
      syncCartWithBackend(mergedCart, currentUser);

    } catch (err) {
      console.error('Error fetching/merging cart', err);
    }
  };

  // Check login status on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchAndMergeCart(parsedUser);
    }
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    saveCart(newCart, user);
  };

  const updateCartItemQty = (id, change) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, qty: item.qty + change };
      }
      return item;
    }).filter(item => item.qty > 0);
    saveCart(newCart, user);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart, user);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    fetchAndMergeCart(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('loggedInUser');
  };

  return (
    <Router>
      <div className="App">
        {user && (
          <Header 
            user={user} 
            cartCount={cart.reduce((acc, item) => acc + item.qty, 0)} 
            toggleCart={() => setIsCartOpen(true)}
            onLogout={handleLogout}
          />
        )}
        
        <main>
          {/* Main content routes change here */}
          {!user ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products user={user} addToCart={addToCart} />} />
              <Route path="/about" element={<About />} />
            </Routes>
          )}
        </main>
        
        {user && <Footer />}

        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          updateQty={updateCartItemQty}
          removeItem={removeFromCart}
        />
        {isCartOpen && <div className="overlay show" onClick={() => setIsCartOpen(false)}></div>}
      </div>
    </Router>
  );
}

export default App;
