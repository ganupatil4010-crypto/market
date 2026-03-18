import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import './index.css';

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null); // { name, phone, role }

  // Check login status on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Load user specific cart
      const savedCart = localStorage.getItem(
        parsedUser.role === 'owner' ? 'cart' : `cart_${parsedUser.phone}`
      );
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  const saveCart = (newCart, currentUser) => {
    setCart(newCart);
    if (currentUser && currentUser.role !== 'owner') {
      localStorage.setItem(`cart_${currentUser.phone}`, JSON.stringify(newCart));
    } else {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

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
    // Load their cart
    const savedCart = localStorage.getItem(
      userData.role === 'owner' ? 'cart' : `cart_${userData.phone}`
    );
    setCart(savedCart ? JSON.parse(savedCart) : []);
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
              <Route path="/contact" element={<Contact />} />
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
