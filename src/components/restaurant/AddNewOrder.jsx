import React from 'react';
import { FiPlus, FiMinus, FiX, FiSearch, FiShoppingBag, FiRefreshCw, FiFileText } from 'react-icons/fi';
import { useAddNewOrder } from './hooks/useAddNewOrder';

const AddNewOrder = ({ onClose, orderId }) => {
  const {
    menuItems,
    orderItems,
    loading,
    loadingMenu,
    error,
    selectedItem,
    selectedVariation,
    setSelectedVariation,
    selectedAddons,
    setSelectedAddons,
    searchTerm,
    setSearchTerm,
    openItemModal,
    closeItemModal,
    addItemToOrder,
    updateItemQuantity,
    removeItem,
    calculateTotal,
    handleAddItemsToOrder
  } = useAddNewOrder(orderId);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1f2937] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-[#c2ab65]">
          <div className="p-6 border-b border-[#c2ab65] flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#c2ab65]">Add Items to Order</h2>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="bg-red-500/80 border border-red-600 text-white px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#c2ab65]">Selected Items</h3>
                
                {orderItems.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between bg-[#2d3748] p-3 rounded-xl border border-gray-600">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-400">
                            {item.variation.name} - ₹{item.price}
                            {item.addons.length > 0 && (
                              <div className="text-xs text-gray-500 truncate">
                                + {item.addons.map(a => a.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                          >
                            <FiMinus size={14} />
                          </button>
                          
                          <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                          
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-all"
                          >
                            <FiPlus size={14} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8 bg-[#2d3748] rounded-xl border border-gray-600">
                    <FiShoppingBag className="text-4xl mb-2 mx-auto" />
                    <p className="text-sm">No items selected</p>
                  </div>
                )}

                <div className="text-right bg-[#2d3748] p-3 rounded-xl border border-[#c2ab65]">
                  <div className="text-lg font-bold text-[#c2ab65]">
                    Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#c2ab65]">Menu Items</h3>
                  <div className="relative flex-1 max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search menu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm bg-[#2d3748] border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-white placeholder-gray-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {loadingMenu ? (
                    <div className="col-span-2 text-center py-10 text-gray-400">
                      <FiRefreshCw className="text-4xl mb-2 mx-auto animate-spin" />
                      <p className="text-sm">Loading menu items...</p>
                    </div>
                  ) : menuItems.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-gray-400">
                      <FiFileText className="text-4xl mb-2 mx-auto" />
                      <p className="text-sm">No menu items available</p>
                    </div>
                  ) : menuItems
                    .filter(item => 
                      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((item) => (
                      <div key={item._id} className="bg-[#2d3748] border border-gray-600 rounded-xl p-3 hover:border-[#c2ab65] transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white text-sm truncate flex-1">{item.itemName}</h4>
                          <span className="text-sm font-semibold text-[#c2ab65] whitespace-nowrap ml-2">
                            ₹{item.variation && item.variation.length > 0 
                              ? Math.min(...item.variation.map(v => v.price || 0))
                              : 0}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => openItemModal(item)}
                          disabled={item.status !== 'active'}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            item.status === 'active'
                              ? 'bg-[#c2ab65] text-[#1f2937] hover:bg-[#d4bc7a]'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {item.status === 'active' ? '+ Add' : 'Unavailable'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#c2ab65]">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-6 py-2 bg-[#2d3748] border border-gray-600 text-white rounded-xl hover:bg-[#374151] transition-all"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  await handleAddItemsToOrder();
                  onClose(true);
                }}
                disabled={loading || orderItems.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Adding...' : 'Add Items'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1f2937] rounded-2xl shadow-2xl p-6 max-w-md w-full border border-[#c2ab65]">
            <h3 className="text-lg font-semibold mb-4 text-[#c2ab65]">{selectedItem.itemName}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">Select Variation</label>
              {selectedItem.variation?.map(variation => (
                <label key={variation._id} className="flex items-center mb-2 p-3 bg-[#2d3748] rounded-lg hover:bg-[#374151] cursor-pointer border border-gray-600">
                  <input
                    type="radio"
                    name="variation"
                    checked={selectedVariation?._id === variation._id}
                    onChange={() => setSelectedVariation(variation)}
                    className="mr-3"
                  />
                  <span className="text-white">{variation.name} - ₹{variation.price}</span>
                </label>
              ))}
            </div>
            
            {selectedItem.addon?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Select Addons</label>
                {selectedItem.addon.map(addon => (
                  <label key={addon._id} className="flex items-center mb-2 p-3 bg-[#2d3748] rounded-lg hover:bg-[#374151] cursor-pointer border border-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedAddons.some(a => a._id === addon._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddons(prev => [...prev, addon]);
                        } else {
                          setSelectedAddons(prev => prev.filter(a => a._id !== addon._id));
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="text-white">{addon.name} - ₹{addon.price}</span>
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeItemModal}
                className="px-4 py-2 bg-[#2d3748] border border-gray-600 text-white rounded-xl hover:bg-[#374151] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addItemToOrder}
                disabled={!selectedVariation}
                className="px-4 py-2 bg-[#c2ab65] text-[#1f2937] rounded-xl hover:bg-[#d4bc7a] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewOrder;
