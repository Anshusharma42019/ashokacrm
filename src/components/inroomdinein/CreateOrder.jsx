import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import OrderItemsList from './OrderItemsList';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Order data
  const [orderData, setOrderData] = useState({
    roomNumber: '',
    customerName: '',
    sgstRate: 2.5,
    cgstRate: 2.5
  });
  const [cartItems, setCartItems] = useState([]);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/all?status=Checked In`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingData = Array.isArray(response.data) ? response.data : (response.data.bookings || []);
      
      const occupiedRooms = [];
      bookingData.forEach(booking => {
        if (booking.roomNumber && booking.status === 'Checked In') {
          const roomNumbers = booking.roomNumber.split(',').map(num => num.trim());
          roomNumbers.forEach(roomNum => {
            occupiedRooms.push({
              _id: `${booking._id}_${roomNum}`,
              tableNumber: roomNum,
              status: 'occupied',
              guestName: booking.name || 'Guest',
              bookingNo: booking.bookingNo,
              bookingId: booking._id
            });
          });
        }
      });
      
      setRooms(occupiedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/restaurant-categories/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch variations and addons first
      let variationsMap = {};
      let addonsMap = {};
      
      try {
        const variationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/variations/all/variation`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const variationsData = variationsRes.data || [];
        variationsMap = variationsData.reduce((acc, v) => ({ ...acc, [v._id]: v }), {});
      } catch (error) {
        console.error('Error fetching variations:', error);
      }
      
      try {
        const addonsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/addons/all/addon`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const addonsData = addonsRes.data || [];
        addonsMap = addonsData.reduce((acc, a) => ({ ...acc, [a._id]: a }), {});
      } catch (error) {
        console.error('Error fetching addons:', error);
      }
      
      // Fetch menu items
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/menu-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const itemsData = response.data.data || response.data || [];
      
      // Populate variations and addons
      const populatedItems = itemsData.map(item => ({
        ...item,
        variations: (item.variations || []).map(vId => variationsMap[vId] || vId).filter(v => v && typeof v === 'object'),
        addons: (item.addons || []).map(aId => addonsMap[aId] || aId).filter(a => a && typeof a === 'object')
      }));
      
      setMenuItems(Array.isArray(populatedItems) ? populatedItems : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleNext = () => {
    if (!orderData.roomNumber || !orderData.customerName) {
      alert('Please select room and customer name');
      return;
    }
    setStep(2);
  };

  const openItemModal = (item) => {
    const hasMultipleVariations = item.variations?.length > 1;
    const hasAddons = item.addons?.length > 0;
    
    if (hasMultipleVariations || hasAddons) {
      setSelectedItem(item);
      setSelectedVariation(item.variations?.[0] || null);
      setSelectedAddons([]);
    } else if (item.variations?.length === 1) {
      // Auto-add with single variation
      const cartKey = `${item._id}-${item.variations[0]._id}-`;
      const price = Number(item.variations[0].price || 0);
      
      const existingItem = cartItems.find(i => i.cartKey === cartKey);
      if (existingItem) {
        setCartItems(cartItems.map(i => 
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        ));
      } else {
        setCartItems([...cartItems, {
          ...item,
          cartKey,
          selectedVariation: item.variations[0],
          selectedAddons: [],
          Price: price,
          quantity: 1
        }]);
      }
    } else {
      // No variations, add directly
      const cartKey = `${item._id}--`;
      const price = Number(item.Price || 0);
      
      const existingItem = cartItems.find(i => i.cartKey === cartKey);
      if (existingItem) {
        setCartItems(cartItems.map(i => 
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        ));
      } else {
        setCartItems([...cartItems, {
          ...item,
          cartKey,
          selectedVariation: null,
          selectedAddons: [],
          Price: price,
          quantity: 1
        }]);
      }
    }
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setSelectedVariation(null);
    setSelectedAddons([]);
  };

  const addToCart = () => {
    if (selectedItem.variations?.length > 0 && !selectedVariation) {
      alert('Please select a variation');
      return;
    }

    const cartKey = `${selectedItem._id}-${selectedVariation._id}-${selectedAddons.map(a => a._id).join('-')}`;
    const price = Number(selectedVariation.price || 0) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);

    const existingItem = cartItems.find(item => item.cartKey === cartKey);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, {
        ...selectedItem,
        cartKey,
        selectedVariation,
        selectedAddons,
        Price: price,
        quantity: 1
      }]);
    }
    closeItemModal();
  };

  const updateQuantity = (cartKey, change) => {
    setCartItems(cartItems.map(item => {
      if (item.cartKey === cartKey) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (cartKey) => {
    setCartItems(cartItems.filter(item => item.cartKey !== cartKey));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.Price * item.quantity), 0);
    const sgst = subtotal * (orderData.sgstRate / 100);
    const cgst = subtotal * (orderData.cgstRate / 100);
    return { subtotal, sgst, cgst, total: subtotal + sgst + cgst };
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { subtotal, sgst, cgst, total } = calculateTotal();
      
      // Get booking details for selected room
      const selectedRoom = rooms.find(room => room.tableNumber === orderData.roomNumber);
      
      const orderPayload = {
        staffName: orderData.customerName || 'Guest',
        customerName: orderData.customerName,
        tableNo: orderData.roomNumber,
        bookingNo: selectedRoom?.bookingNo,
        bookingId: selectedRoom?.bookingId,
        items: cartItems.map(item => ({
          itemId: item._id,
          itemName: item.name,
          name: item.name,
          quantity: item.quantity,
          price: item.Price,
          note: '',
          isFree: false,
          variation: item.selectedVariation ? {
            id: item.selectedVariation._id,
            name: item.selectedVariation.name,
            price: item.selectedVariation.price
          } : null,
          addons: item.selectedAddons?.map(addon => ({
            id: addon._id,
            name: addon.name,
            price: addon.price
          })) || []
        })),
        notes: '',
        subtotal,
        gstRate: orderData.sgstRate + orderData.cgstRate,
        sgstRate: orderData.sgstRate,
        cgstRate: orderData.cgstRate,
        sgstAmount: sgst,
        cgstAmount: cgst,
        totalGstAmount: sgst + cgst,
        amount: total,
        discount: 0,
        nonChargeable: false,
        isMembership: false,
        isLoyalty: false
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/inroom-orders/create`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Order placed successfully!');
      navigate('/inroomdinein/all-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Step 1: Room Selection */}
      {step === 1 && (
        <div className="bg-[#1f2937] rounded-2xl p-6 shadow-lg border border-[#c2ab65]">
          <h3 className="text-xl font-bold text-white mb-6">🏨 Room Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Number *</label>
              <select
                value={orderData.roomNumber}
                onChange={(e) => {
                  const room = rooms.find(r => r.tableNumber === e.target.value);
                  setOrderData({
                    ...orderData,
                    roomNumber: e.target.value,
                    customerName: room?.guestName || ''
                  });
                }}
                className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300"
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room._id} value={room.tableNumber}>
                    Room {room.tableNumber} - {room.guestName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name *</label>
              <input
                type="text"
                value={orderData.customerName}
                onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300 placeholder-gray-500"
                placeholder="Customer Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">SGST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={orderData.sgstRate}
                onChange={(e) => setOrderData({ ...orderData, sgstRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CGST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={orderData.cgstRate}
                onChange={(e) => setOrderData({ ...orderData, cgstRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => navigate('/inroom-orders')}
              className="px-6 py-2.5 bg-[#374151] hover:bg-[#4b5563] text-gray-300 rounded-xl transition-colors border border-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] rounded-xl font-semibold shadow-lg"
            >
              Next: Select Items →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Menu Selection */}
      {step === 2 && (
        <>
          <OrderItemsList
            menuItems={menuItems}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddItem={openItemModal}
          />

          {/* Floating Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] z-50"
          >
            <FiShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c2ab65] text-[#1f2937] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
          </button>
        </>
      )}

      {/* Item Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{selectedItem.name}</h2>
              <button onClick={closeItemModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedItem.variations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Select Variation</h3>
                  {selectedItem.variations.map(variation => (
                    <label key={variation._id} className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedVariation?._id === variation._id}
                          onChange={() => setSelectedVariation(variation)}
                          className="h-4 w-4 text-[#c2ab65] focus:ring-[#c2ab65]"
                        />
                        <span>{variation.name}</span>
                      </div>
                      <span className="font-semibold">₹{Number(variation.price || 0).toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedItem.addons?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Add-ons (Optional)</h3>
                  {selectedItem.addons.map(addon => (
                    <label key={addon._id} className="flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50">
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
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-semibold">₹{Number(addon.price || 0).toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <button
                onClick={addToCart}
                className="w-full py-3 bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] rounded-xl font-semibold"
              >
                Add to Cart - ₹{(Number(selectedVariation?.price || 0) + selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0)).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FiShoppingCart size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.cartKey} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          {item.selectedVariation && (
                            <p className="text-xs text-gray-600">• {item.selectedVariation.name}</p>
                          )}
                          {item.selectedAddons?.length > 0 && (
                            <p className="text-xs text-gray-600">+ {item.selectedAddons.map(a => a.name).join(', ')}</p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.cartKey)} className="text-red-500 hover:text-red-700">
                          <FiX size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, 1)}
                            className="w-7 h-7 bg-[#c2ab65] text-[#1f2937] rounded-full flex items-center justify-center hover:bg-[#d4bc7a]"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <span className="font-bold">₹{(item.Price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateTotal().subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST ({orderData.sgstRate}%):</span>
                    <span className="font-medium">₹{calculateTotal().sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST ({orderData.cgstRate}%):</span>
                    <span className="font-medium">₹{calculateTotal().cgst.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg">₹{calculateTotal().total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-3 bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] rounded-xl font-semibold disabled:opacity-50"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
