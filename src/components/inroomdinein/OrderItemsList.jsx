import React from 'react';

const OrderItemsList = ({ 
  menuItems, 
  categories, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  onAddItem 
}) => {
  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="bg-[#1f2937] rounded-2xl p-6 mb-6 shadow-lg border border-[#c2ab65]">
        <h3 className="text-lg font-semibold text-white mb-4">🍽️ Select Menu Items</h3>
        
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
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMenu.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#374151] rounded-2xl shadow-lg border border-gray-600">
            <div className="text-gray-500 text-4xl mb-2">🍽️</div>
            <div className="text-gray-400">No menu items found</div>
          </div>
        ) : (
          filteredMenu.map(item => {
            let displayPrice = item.Price || 0;
            if (item.variations?.length > 0) {
              const validPrices = item.variations.filter(v => v.price > 0).map(v => v.price);
              if (validPrices.length > 0) displayPrice = Math.min(...validPrices);
            }

            return (
              <div key={item._id} className="bg-[#374151] rounded-2xl p-4 shadow-lg border border-gray-600 hover:border-[#c2ab65] transition-all">
                <h4 className="font-semibold text-white text-sm mb-1 truncate">{item.name}</h4>
                <p className="text-xs text-gray-400 mb-2">{item.foodType}</p>
                {item.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>}
                <p className="font-bold text-[#c2ab65] mb-3">₹{displayPrice.toFixed(2)}</p>
                <button
                  onClick={() => onAddItem(item)}
                  className="w-full bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] py-2 rounded-xl font-semibold text-sm"
                >
                  Add
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default OrderItemsList;
