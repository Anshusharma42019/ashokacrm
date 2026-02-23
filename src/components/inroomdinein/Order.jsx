import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrderManagement } from '../../hooks/useOrderManagement';
import { useAuth } from '../../context/AuthContext';

// Add CSS animations
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeInUp { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
  .animate-slideInLeft { opacity: 0; animation: slideInLeft 0.4s ease-out forwards; }
  .animate-scaleIn { opacity: 0; animation: scaleIn 0.3s ease-out forwards; }
  .animate-delay-100 { animation-delay: 0.1s; }
  .animate-delay-200 { animation-delay: 0.2s; }
  .animate-delay-300 { animation-delay: 0.3s; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [isConnected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nonChargeable, setNonChargeable] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  const {
    menuItems,
    categories,
    staff,
    tables,
    allBookings,
    cartItems,
    isCartOpen,
    isPlacingOrder,
    searchQuery,
    bookingFilter,
    orderData,
    filteredMenu,
    gstRates,
    setIsCartOpen,
    setSearchQuery,
    setBookingFilter,
    setOrderData,
    setCartItems,
    setGstRates,
    handleAddToCart,
    handleRemoveItem,
    handleQuantityChange,
    handleClearCart,
    getSubtotal,
    getTotalAmount,
    getGstAmounts,
    handlePlaceOrder
  } = useOrderManagement(location);

  // Set loading state based on menu items
  useEffect(() => {
    setIsMenuLoading(menuItems.length === 0);
  }, [menuItems]);

  const categoryFilteredMenu = filteredMenu.filter(item => 
    selectedCategory === '' || item.category === selectedCategory
  );



  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-[#1f2937] rounded-2xl p-6 mb-6 shadow-lg border border-[#c2ab65]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Order</h2>
            <p className="text-sm text-gray-400 mt-1">In-Room Dining Service</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#c2ab65] animate-pulse"></div>
            <span className="text-xs font-medium text-[#c2ab65]">System Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Room Number *</label>
            <select 
              value={orderData.tableNo}
              onChange={(e) => {
                const selectedRoom = tables.find(room => room.tableNumber === e.target.value);
                setOrderData({
                  ...orderData, 
                  tableNo: e.target.value,
                  customerName: selectedRoom?.guestName || ''
                });
              }}
              className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300"
            >
              <option value="">Select Room</option>
              {tables.map(room => (
                <option key={room._id} value={room.tableNumber}>
                  Room {room.tableNumber} - {room.guestName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name</label>
            <input
              type="text"
              value={orderData.customerName}
              onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
              className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300 placeholder-gray-500"
              placeholder="Customer Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SGST Rate (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={gstRates.sgstRate}
              onChange={(e) => setGstRates({
                ...gstRates,
                sgstRate: parseFloat(e.target.value) || 0,
                gstRate: (parseFloat(e.target.value) || 0) + gstRates.cgstRate
              })}
              className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300 placeholder-gray-500"
              placeholder="2.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">CGST Rate (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={gstRates.cgstRate}
              onChange={(e) => setGstRates({
                ...gstRates,
                cgstRate: parseFloat(e.target.value) || 0,
                gstRate: gstRates.sgstRate + (parseFloat(e.target.value) || 0)
              })}
              className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300 placeholder-gray-500"
              placeholder="2.5"
            />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-[#1f2937] rounded-2xl p-6 mb-6 shadow-lg border border-[#c2ab65]">
        <h3 className="text-lg font-semibold text-white mb-4">Search Menu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#374151] border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300 placeholder-gray-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isMenuLoading ? (
          // Loading skeleton for menu items
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-[#374151] rounded-2xl p-4 shadow-lg border border-gray-600 animate-pulse">
              <div className="h-5 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded mb-3 w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded mb-3 w-1/2"></div>
              <div className="h-9 bg-gray-600 rounded"></div>
            </div>
          ))
        ) : categoryFilteredMenu.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#374151] rounded-2xl shadow-lg border border-gray-600">
            <div className="text-gray-500 text-4xl mb-2">🍽️</div>
            <div className="text-gray-400">No menu items found</div>
          </div>
        ) : (
          categoryFilteredMenu.map((item, index) => {
            let displayPrice = item.Price || 0;
            if (item.variations && item.variations.length > 0) {
              const validPrices = item.variations.filter(v => v.price > 0).map(v => v.price);
              if (validPrices.length > 0) {
                displayPrice = Math.min(...validPrices);
              }
            }
            return (
          <div key={item._id} className="bg-[#374151] rounded-2xl p-4 shadow-lg border border-gray-600 hover:border-[#c2ab65] transition-all duration-200">
            <h3 className="text-base font-semibold text-white mb-1 truncate">{item.name}</h3>
            <p className="text-xs text-gray-400 mb-2">{item.foodType}</p>
            {item.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>}
            <p className="mb-3 font-bold text-lg text-[#c2ab65]">₹{displayPrice.toFixed(2)}</p>

            {cartItems.some(i => i._id === item._id) ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-gray-600 text-gray-300 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors text-sm"
                    onClick={() => {
                      const cartItem = cartItems.find(i => i._id === item._id);
                      if (cartItem) handleQuantityChange(cartItem.cartKey, -1);
                    }}
                  >
                    -
                  </button>
                  <span className="font-bold text-white text-sm min-w-[20px] text-center">
                    {cartItems.find(i => i._id === item._id)?.quantity}
                  </span>
                  <button
                    className="bg-[#c2ab65] text-[#1f2937] w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#d4bc7a] transition-colors text-sm font-bold"
                    onClick={() => {
                      const cartItem = cartItems.find(i => i._id === item._id);
                      if (cartItem) handleQuantityChange(cartItem.cartKey, 1);
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-red-600 hover:text-red-700 transition-colors text-xs font-medium"
                  onClick={() => {
                    const cartItem = cartItems.find(i => i._id === item._id);
                    if (cartItem) handleRemoveItem(item._id, cartItem.cartKey);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                className="w-full bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] py-2 rounded-xl font-semibold transition-colors text-sm shadow-lg"
                onClick={() => {
                  const hasMultipleVariations = item.variations?.length > 1;
                  const hasAddons = item.addons?.length > 0;
                  
                  if (hasMultipleVariations || hasAddons) {
                    setSelectedItem(item);
                    setSelectedVariation(item.variations?.[0] || null);
                    setSelectedAddons([]);
                  } else if (item.variations?.length === 1) {
                    // Auto-add with single variation
                    const itemToAdd = {
                      ...item,
                      selectedVariation: item.variations[0],
                      selectedAddons: [],
                      Price: Number(item.variations[0].price || 0)
                    };
                    handleAddToCart(itemToAdd);
                  } else {
                    handleAddToCart(item);
                  }
                }}
              >
                Add to Order
              </button>
            )}
          </div>
        );}
        ))
        }
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <button
            className="p-4 rounded-full shadow-lg bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] transition-all duration-200"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.298.503 1.298H19.5a1 1 0 00.993-.883l.988-7.893z" />
            </svg>
          </button>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#c2ab65] text-[#1f2937] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg">
              {cartItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Variation/Addon Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">{selectedItem.name}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => {
                    setSelectedItem(null);
                    setSelectedVariation(null);
                    setSelectedAddons([]);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedItem.variations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Select Variation</h3>
                  <div className="space-y-2">
                    {selectedItem.variations.map(variation => (
                      <label key={variation._id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?._id === variation._id}
                            onChange={() => setSelectedVariation(variation)}
                            className="h-4 w-4 text-[#c2ab65] focus:ring-[#c2ab65]"
                          />
                          <span className="text-gray-800">{variation.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">₹{Number(variation.price || 0).toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.addons?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Add-ons (Optional)</h3>
                  <div className="space-y-2">
                    {selectedItem.addons.map(addon => (
                      <label key={addon._id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAddons.some(a => a._id === addon._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddons([...selectedAddons, addon]);
                              } else {
                                setSelectedAddons(selectedAddons.filter(a => a._id !== addon._id));
                              }
                            }}
                            className="h-4 w-4 text-[#c2ab65] focus:ring-[#c2ab65] rounded"
                          />
                          <span className="text-gray-800">{addon.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">₹{Number(addon.price || 0).toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <button
                className="w-full py-3 px-4 rounded-xl text-[#1f2937] bg-[#c2ab65] hover:bg-[#d4bc7a] font-semibold transition-colors shadow-lg"
                onClick={() => {
                  const itemToAdd = {
                    ...selectedItem,
                    selectedVariation,
                    selectedAddons,
                    Price: Number(selectedVariation?.price || selectedItem.Price || 0) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
                  };
                  handleAddToCart(itemToAdd);
                  setSelectedItem(null);
                  setSelectedVariation(null);
                  setSelectedAddons([]);
                }}
              >
                Add to Cart - ₹{(Number(selectedVariation?.price || selectedItem.Price || 0) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0)).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Popup Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setIsCartOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.298.503 1.298H19.5a1 1 0 00.993-.883l.988-7.893z" />
                  </svg>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Item</th>
                        <th className="text-center py-2 font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Price</th>
                        <th className="text-center py-2 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item._id} className="border-b border-gray-100">
                          <td className="py-3">
                            <div>
                              <div className="font-medium text-gray-800">{item.name}</div>
                              {item.selectedVariation && (
                                <div className="text-xs text-gray-600">• {item.selectedVariation.name}</div>
                              )}
                              {item.selectedAddons?.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  {item.selectedAddons.map(addon => `+ ${addon.name}`).join(', ')}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">{categories.find(cat => cat._id === item.category)?.name || item.foodType}</div>
                              <div className="text-xs font-semibold text-gray-900">₹{(item.Price || item.price || 0).toFixed(2)} each</div>
                              {hasRole(['ADMIN', 'GM', 'FRONT DESK', 'STAFF']) && (
                                <label className="flex items-center gap-1 mt-1">
                                  <input
                                    type="checkbox"
                                    checked={item.isFree || false}
                                    onChange={(e) => {
                                      const updatedItems = cartItems.map(cartItem => 
                                        cartItem._id === item._id 
                                          ? { ...cartItem, isFree: e.target.checked }
                                          : cartItem
                                      );
                                      setCartItems(updatedItems);
                                    }}
                                    className="h-3 w-3 rounded border-gray-300 text-[#c2ab65] focus:ring-[#c2ab65]"
                                  />
                                  <span className="text-xs text-[#c2ab65]">NC</span>
                                </label>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                className="bg-gray-600 text-gray-300 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors text-xs"
                                onClick={() => handleQuantityChange(item.cartKey, -1)}
                              >
                                -
                              </button>
                              <span className="font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                              <button
                                className="bg-[#c2ab65] text-[#1f2937] w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#d4bc7a] transition-colors text-xs font-bold"
                                onClick={() => handleQuantityChange(item.cartKey, 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 text-right font-semibold text-gray-800">
                            <span>₹{((item.Price || item.price || 0) * item.quantity).toFixed(2)}</span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              className="text-red-500 hover:text-red-700 text-lg font-bold"
                              onClick={() => handleRemoveItem(item._id, item.cartKey)}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t p-4">

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{getGstAmounts().subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">SGST ({gstRates.sgstRate}%):</span>
                    <span className="font-medium">₹{getGstAmounts().sgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">CGST ({gstRates.cgstRate}%):</span>
                    <span className="font-medium">₹{getGstAmounts().cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-800">Total:</span>
                      <span className="font-bold text-lg text-gray-800">₹{getGstAmounts().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    className="w-full py-2 px-4 rounded-md text-gray-700 bg-gray-200 font-semibold hover:bg-gray-300 transition-colors duration-200 text-sm"
                    onClick={handleClearCart}
                  >
                    Clear All
                  </button>
                  <button
                    className="w-full py-3 px-4 rounded-xl text-[#1f2937] bg-[#c2ab65] hover:bg-[#d4bc7a] font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    onClick={() => {
                      const hasAnyFreeItems = cartItems.some(item => item.isFree);
                      handlePlaceOrder(hasAnyFreeItems, navigate);
                    }}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
