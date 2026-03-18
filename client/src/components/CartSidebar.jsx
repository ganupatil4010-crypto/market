import React from 'react';

const CartSidebar = ({ isOpen, onClose, cart, updateQty, removeItem }) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const whatsappNumber = localStorage.getItem('whatsappNumber') || '9876543210';

  const handleWhatsappOrder = () => {
    if (cart.length === 0) {
      alert('आपका कार्ट खाली है!');
      return;
    }
    
    let message = 'नमस्ते, मैं यह सामान ऑर्डर करना चाहता हूँ:%0A';
    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      message += `• ${item.name} (${item.weight}) - ${item.qty} x ₹${item.price} = ₹${itemTotal}%0A`;
    });
    message += `%0Aकुल राशि: ₹${total}%0A%0Aधन्यवाद!`;
    
    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`} id="cartSidebar">
      <div className="cart-header">
        <h2>आपका कार्ट</h2>
        <span className="close-cart" onClick={onClose}>&times;</span>
      </div>
      <div id="cartItemsContainer">
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>कार्ट खाली है</p>
        ) : (
          cart.map(item => (
            <div className="cart-item" key={item.id}>
              <img src={item.img || 'https://via.placeholder.com/60?text=No+Image'} className="cart-item-img" alt={item.name} />
              <div className="cart-item-details">
                <div className="cart-item-title">{item.name}</div>
                <div className="cart-item-weight">{item.weight}</div>
                <div className="cart-item-price">₹{item.price} x {item.qty}</div>
                <div className="cart-item-qty">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  <button className="remove-item-btn" onClick={() => removeItem(item.id)} title="हटाएं">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-total" id="cartTotal">₹{total}</div>
      <button className="whatsapp-order" onClick={handleWhatsappOrder}>
        <i className="fab fa-whatsapp"></i> व्हाट्सएप ऑर्डर
      </button>
    </div>
  );
};

export default CartSidebar;
