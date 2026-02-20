import React from 'react';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';

const OrderItemsList = ({ menuItems, loadingMenu, searchQuery, setSearchQuery, fetchMenuItems, openItemModal }) => {
  return (
    <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">🍽️ Select Menu Items</h3>
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            fetchMenuItems();
          }}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-300"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
        />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {loadingMenu ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-700 text-sm">Loading menu...</p>
            </div>
          </div>
        ) : (
          menuItems.filter(item => 
            (item.itemName || item.name)?.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((item) => (
            <div key={item._id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:bg-gray-100 transition-all flex flex-col shadow-sm">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.itemName || item.name} 
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div className="flex-1 mb-2">
                <h4 className="font-semibold text-gray-800 text-sm mb-1 break-words leading-tight">{item.itemName || item.name}</h4>
                <span className="text-xs font-bold text-green-600">
                  ₹{item.variation && item.variation.length > 0 
                    ? Math.min(...item.variation.map(v => v.price || 0))
                    : item.Price || 0}
                </span>
              </div>
              
              {item.description && (
                <p className="text-[10px] text-gray-600 mb-2 line-clamp-2 leading-tight">{item.description}</p>
              )}
              
              <button
                type="button"
                onClick={() => openItemModal(item)}
                disabled={item.status !== 'active' && !item.isActive}
                className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  (item.status === 'active' || item.isActive)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {(item.status === 'active' || item.isActive) ? '➕ Add' : 'Not Available'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderItemsList;
