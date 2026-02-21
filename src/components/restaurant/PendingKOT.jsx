import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PendingKOT = ({ onItemStarted }) => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingKOTs();
  }, []);

  const fetchPendingKOTs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/all/kitchen/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const pendingKots = (data.kots || []).filter(kot => 
          kot.status !== 'DELIVERED' && 
          kot.status !== 'CANCELLED' && 
          kot.status !== 'PAID' &&
          kot.items?.some(item => item.status === 'PENDING')
        );
        setKots(pendingKots);
      }
    } catch (error) {
      console.error('Error fetching pending KOTs:', error);
    }
    setLoading(false);
  };

  const updateItemStatus = async (kotId, itemIndex, newStatus, isExtraItem = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kot/${kotId}/item/${itemIndex}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, isExtraItem })
      });

      if (response.ok) {
        if (onItemStarted) onItemStarted();
        fetchPendingKOTs();
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      fetchPendingKOTs();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⏳
          </motion.div>
          <p className="mt-4 text-gray-900 font-medium">Loading pending KOTs...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >

      {kots.length === 0 ? (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✅
          </motion.div>
          <p className="text-gray-500 text-lg font-medium">No pending KOTs</p>
          <p className="text-gray-400 text-sm mt-2">All orders have been accepted</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kots.map((kot) => (
            <motion.div 
              key={kot._id} 
              className={`bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-lg rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl ${
                kot.priority === 'URGENT' ? 'border-red-500 shadow-red-500/50' : 
                kot.priority === 'HIGH' ? 'border-orange-400 shadow-orange-400/30' : 
                'border-white/30'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={kot.priority === 'URGENT' ? { opacity: 1, scale: [1, 1.02, 1] } : { opacity: 1, scale: 1 }}
              transition={kot.priority === 'URGENT' ? { scale: { duration: 1.5, repeat: Infinity } } : { duration: 0.2 }}
            >
              <div className={`px-3 py-2 rounded-t-2xl flex items-center justify-between ${
                kot.priority === 'URGENT' ? 'bg-gradient-to-r from-red-600 to-red-500' :
                kot.priority === 'HIGH' ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                kot.priority === 'NORMAL' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                'bg-gradient-to-r from-green-600 to-green-500'
              } text-white shadow-lg`}>
                <div className="flex items-center gap-2">
                  <div className="text-xl">
                    {kot.priority === 'URGENT' ? '🔴' :
                     kot.priority === 'HIGH' ? '🟠' :
                     kot.priority === 'NORMAL' ? '🟡' : '🟢'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{kot.kotNumber}</h3>
                    <p className="text-[10px] opacity-90">{kot.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <div>⏰ {new Date(kot.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  {kot.tableNumber && <div>🪑 {kot.tableNumber}</div>}
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {kot.items?.filter(item => item.status === 'PENDING').map((item, idx) => {
                  const originalIdx = kot.items.findIndex(i => i === item);
                  return (
                  <div key={originalIdx} className="bg-white/30 backdrop-blur-sm rounded-xl p-2 border border-white/40 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold px-2 py-0.5 rounded-md text-xs shadow-sm flex-shrink-0">
                          {item.quantity}×
                        </span>
                        <span className="font-semibold text-gray-900 text-xs leading-tight">{item.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 mb-2">
                      {item.variation && (
                        <div className="text-[10px] text-gray-700 flex items-center gap-1">
                          <span className="bg-blue-500/20 px-1.5 py-0.5 rounded">🎯 {item.variation.name}</span>
                        </div>
                      )}
                      {item.addons?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.addons.map((addon, addonIdx) => (
                            <span key={addonIdx} className="text-[9px] bg-purple-500/20 text-purple-900 px-1.5 py-0.5 rounded">+ {addon.name}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => updateItemStatus(kot._id, originalIdx, 'PREPARING')}
                      className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-sm"
                    >
                      👨‍🍳 Accept & Start
                    </button>
                  </div>
                  );
                })}
                
                {kot.extraItems?.length > 0 && (
                  <div className="border-t-2 border-dashed border-red-400 pt-2 mt-2">
                    <div className="text-[10px] font-bold text-white mb-2 flex items-center gap-1">
                      <span>⭐</span>
                      <span>EXTRA ITEMS ADDED</span>
                    </div>
                    {kot.extraItems.map((item, idx) => (
                      <div key={`extra-${idx}`} className="bg-red-50/50 backdrop-blur-sm rounded-xl p-2 border-2 border-red-400 shadow-sm mb-2">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold px-2 py-0.5 rounded-md text-xs shadow-sm flex-shrink-0">
                              {item.quantity}×
                            </span>
                            <span className="font-semibold text-gray-900 text-xs leading-tight">{item.name}</span>
                            <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">NEW</span>
                          </div>
                        </div>
                        
                        <div className="space-y-0.5 mb-2">
                          {item.variation && (
                            <div className="text-[10px] text-gray-700 flex items-center gap-1">
                              <span className="bg-blue-500/20 px-1.5 py-0.5 rounded">🎯 {item.variation.name}</span>
                            </div>
                          )}
                          {item.addons?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.addons.map((addon, addonIdx) => (
                                <span key={addonIdx} className="text-[9px] bg-purple-500/20 text-purple-900 px-1.5 py-0.5 rounded">+ {addon.name}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => updateItemStatus(kot._id, idx, 'PREPARING', true)}
                          className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
                        >
                          👨‍🍳 Accept Extra Item
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PendingKOT;
