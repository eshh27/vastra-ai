import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      // Find if exact item already exists
      const existing = prev.find(i => 
        i.id === item.id && 
        i.size === item.size && 
        i.isCustom === item.isCustom &&
        i.color === item.color
      );
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, cartId: Date.now().toString() + Math.random().toString() }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.cartId === cartId) {
        const newQ = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQ };
      }
      return i;
    }));
  };

  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
