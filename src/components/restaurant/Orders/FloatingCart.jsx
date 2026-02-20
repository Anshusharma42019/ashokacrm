import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCart = ({ orderItems, updateItemQuantity, removeItem, calculateTotal, onCheckout, loading }) => {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50"
      >
        <FiShoppingCart size={24} />
        {orderItems.length > 0 && (
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {orderItems.length}
          </span>
        )}
      </motion.button>

      {/* Cart Modal */}
      {isOpen && ReactDOM.createPortal(
        <AnimatePresence>
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 999998,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)'
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              style={{ 
                position: 'fixed', 
                top: 0, 
                right: 0, 
                bottom: 0, 
                height: '100vh',
                zIndex: 999999,
                backgroundColor: 'white',
                overflowY: 'auto'
              }}
              className="w-full sm:w-96 md:w-[28rem] lg:w-[32rem] shadow-2xl"
            >
              <div className="p-4 sm:p-6 pt-12 sm:pt-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">🛒 Your Cart</h2>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-900 flex-shrink-0 ml-2"
                  >
                    <FiX size={24} className="text-gray-900" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <div key={item.key} className="bg-gray-100 rounded-xl p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">{item.variation.name} - ₹{item.price}</p>
                            {item.addons.length > 0 && (
                              <p className="text-xs text-gray-500 truncate">+ {item.addons.map(a => a.name).join(', ')}</p>
                            )}
                          </div>
                          <button type="button" onClick={() => removeItem(item.key)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                            <FiX size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900 text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>Your cart is empty</p>
                    </div>
                  )}
                </div>

                {/* Total & Checkout */}
                {orderItems.length > 0 && (
                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCheckout();
                        setIsOpen(false);
                      }}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default FloatingCart;
