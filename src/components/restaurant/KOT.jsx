import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiClock, FiAlertTriangle, FiCheckCircle, FiList, FiCoffee, FiActivity, FiArchive, FiPlay, FiCheck, FiPackage } from 'react-icons/fi';
import KOTHistory from './KOTHistory';
import PendingKOT from './PendingKOT';

const KOT = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    fetchKitchenOrders();
    timerRef.current = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const calculateElapsedTime = (startedAt, status) => {
    if (status === 'READY' || status === 'DELIVERED' || status === 'CANCELLED' || status === 'PAID') {
      return null;
    }
    if (!startedAt) {
      return null;
    }
    const elapsed = Math.floor((currentTime - new Date(startedAt).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return { minutes, seconds, totalSeconds: elapsed };
  };

  const getTimerColor = (elapsed, prepTime) => {
    const percentage = (elapsed / (prepTime * 60)) * 100;
    if (percentage >= 100) return 'text-red-600 font-bold';
    if (percentage >= 80) return 'text-orange-600 font-bold';
    if (percentage >= 60) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getProgressColor = (elapsed, prepTime) => {
    const percentage = (elapsed / (prepTime * 60)) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const fetchKitchenOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch both kitchen orders and in-room orders
      const [kitchenResponse, inRoomResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/all/kitchen/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/inroom-orders/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }))
      ]);
      
      let allKots = [];
      
      // Process kitchen orders
      if (kitchenResponse.ok) {
        const kitchenData = await kitchenResponse.json();
        allKots = kitchenData.kots || [];
      }
      
      // Process in-room orders
      if (inRoomResponse.ok) {
        const inRoomData = await inRoomResponse.json();
        const inRoomOrders = Array.isArray(inRoomData) ? inRoomData : [];
        
        // Convert in-room orders to KOT format
        const inRoomKots = inRoomOrders
          .filter(order => order.status !== 'completed' && order.status !== 'cancelled')
          .map(order => ({
            _id: order._id,
            orderNumber: order._id.slice(-6),
            tableNo: order.tableNo,
            status: order.status?.toUpperCase() || 'PENDING',
            items: (order.items || []).map(item => ({
              name: item.itemName || item.name,
              quantity: item.quantity,
              status: order.status?.toUpperCase() || 'PENDING',
              prepTime: 15,
              note: item.note
            })),
            extraItems: [],
            createdAt: order.createdAt,
            startedAt: order.status === 'preparing' ? order.updatedAt : null,
            isInRoomOrder: true
          }));
        
        allKots = [...allKots, ...inRoomKots];
      }
      
      const activeKots = allKots.filter(kot => 
        kot.status !== 'DELIVERED' && 
        kot.status !== 'CANCELLED' && 
        kot.status !== 'PAID' &&
        kot.status !== 'COMPLETED'
      );
      
      setKots(activeKots);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    }
    setLoading(false);
  };

  const getFilteredKots = () => {
    if (activeTab === 'active') {
      return kots.filter(kot => kot.items?.some(item => item.status !== 'PENDING'));
    }
    return kots;
  };

  const updateItemStatus = async (kotId, itemIndex, newStatus, isExtraItem = false) => {
    try {
      const kot = kots.find(k => k._id === kotId);
      
      // If it's an in-room order, update the entire order status instead
      if (kot?.isInRoomOrder) {
        await updateKOTStatus(kotId, newStatus);
        return;
      }
      
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
        const data = await response.json();
        setKots(prev => prev.map(kot => kot._id === kotId ? data.kot : kot));
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      fetchKitchenOrders();
    }
  };

  const updateKOTStatus = async (kotId, newStatus) => {
    try {
      const kot = kots.find(k => k._id === kotId);
      
      if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED' || newStatus === 'PAID' || newStatus === 'COMPLETED') {
        setKots(prev => prev.filter(kot => kot._id !== kotId));
      } else {
        setKots(prev => prev.map(kot => 
          kot._id === kotId ? { ...kot, status: newStatus } : kot
        ));
      }

      const token = localStorage.getItem('token');
      
      // Use different endpoint for in-room orders
      if (kot?.isInRoomOrder) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inroom-orders/${kotId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus.toLowerCase() })
        });
        
        if (!response.ok) {
          fetchKitchenOrders();
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kot/${kotId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
          fetchKitchenOrders();
        }
      }
    } catch (error) {
      console.error('Error updating KOT status:', error);
      fetchKitchenOrders();
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
            <FiCoffee className="mx-auto text-[#c2ab65]" size={64} />
          </motion.div>
          <motion.div 
            className="rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-900 font-medium">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 ${
              activeTab === 'all' 
                ? 'bg-[#c2ab65] text-[#1f2937]' 
                : 'bg-[#1f2937] text-gray-300 hover:bg-[#374151] border border-gray-600'
            }`}
          >
            <FiList /> All
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 ${
              activeTab === 'pending' 
                ? 'bg-[#c2ab65] text-[#1f2937]' 
                : 'bg-[#1f2937] text-gray-300 hover:bg-[#374151] border border-gray-600'
            }`}
          >
            <FiClock /> Pending
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 ${
              activeTab === 'active' 
                ? 'bg-[#c2ab65] text-[#1f2937]' 
                : 'bg-[#1f2937] text-gray-300 hover:bg-[#374151] border border-gray-600'
            }`}
          >
            <FiActivity /> Active
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-[#c2ab65] text-[#1f2937]' 
                : 'bg-[#1f2937] text-gray-300 hover:bg-[#374151] border border-gray-600'
            }`}
          >
            <FiArchive /> History
          </button>
          <button
            onClick={fetchKitchenOrders}
            className="px-6 py-3 bg-[#1f2937] hover:bg-[#374151] text-gray-300 rounded-xl font-medium transition-colors shadow-lg border border-gray-600 flex items-center gap-2"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {activeTab === 'pending' && <PendingKOT onItemStarted={() => { fetchKitchenOrders(); setActiveTab('active'); }} />}

      {(activeTab === 'active' || activeTab === 'all') && (
        <>
          {getFilteredKots().length === 0 ? (
            <div className="text-center py-16 bg-[#1f2937] rounded-2xl shadow-lg border border-[#c2ab65]">
              <motion.div 
                className="text-6xl mb-4 flex justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiCoffee className="text-[#c2ab65]" size={64} />
              </motion.div>
              <p className="text-gray-300 text-lg font-medium">No {activeTab} KOTs in kitchen</p>
              <p className="text-gray-500 text-sm mt-2">Orders will appear here when placed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getFilteredKots().map((kot) => {
                const allItems = [...(kot.items || []), ...(kot.extraItems || [])];
                const filteredItems = allItems.filter(item => activeTab === 'all' || item.status !== 'PENDING');
                
                return (
                <motion.div 
                  key={kot._id} 
                  className="bg-[#1f2937] rounded-2xl shadow-lg border border-[#c2ab65] transition-all hover:shadow-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-3 py-2 rounded-t-2xl flex items-center justify-between bg-[#c2ab65] text-[#1f2937] shadow-lg">
                    <div>
                      <h3 className="font-bold text-base">{kot.kotNumber}</h3>
                      <p className="text-[10px] opacity-90">{kot.orderNumber}</p>
                      {kot.isInRoomOrder && (
                        <span className="text-[9px] bg-[#1f2937] text-[#c2ab65] px-2 py-0.5 rounded mt-1 inline-block font-semibold">
                          IN-ROOM
                        </span>
                      )}
                    </div>
                    <div className="text-right text-[10px]">
                      <div className="flex items-center gap-1 justify-end"><FiClock size={10} /> {new Date(kot.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      {kot.tableNumber && <div className="flex items-center gap-1 justify-end"><FiPackage size={10} /> {kot.tableNumber}</div>}
                      {kot.isInRoomOrder && kot.tableNo && <div className="flex items-center gap-1 justify-end"><FiPackage size={10} /> Room {kot.tableNo}</div>}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {filteredItems.map((item, idx) => {
                      const elapsed = calculateElapsedTime(item.startedAt, item.status);
                      const prepTime = item.timeToPrepare || 15;
                      const progress = elapsed ? Math.min((elapsed.totalSeconds / (prepTime * 60)) * 100, 100) : 100;
                      const isExtraItem = idx >= (kot.items?.length || 0);
                      const actualIndex = isExtraItem ? idx - (kot.items?.length || 0) : idx;
                      
                      return (
                      <div key={idx} className="bg-[#2d3748] rounded-xl p-2 border border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-xs">
                            <span className="bg-[#c2ab65] text-[#1f2937] px-2 py-0.5 rounded mr-1">{item.quantity}×</span>
                            {item.name}
                            {isExtraItem && <span className="ml-1 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded">NEW</span>}
                          </span>
                          {item.status === 'PREPARING' && elapsed && (
                            <div className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${getTimerColor(elapsed.totalSeconds, prepTime)} bg-[#1f2937]`}>
                              ⏱ {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                        {item.status === 'PREPARING' && elapsed && (
                          <>
                            <div className="w-full bg-gray-600 rounded-full h-1.5 mb-1 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(elapsed.totalSeconds, prepTime)}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-gray-400 font-medium mb-1">
                              Target: {prepTime}min {progress >= 100 && <span className="text-red-600 font-bold flex items-center gap-1"><FiAlertTriangle size={10} /> DELAYED</span>}
                            </div>
                          </>
                        )}
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => updateItemStatus(kot._id, actualIndex, 'PREPARING', isExtraItem)}
                            className="w-full py-1 px-2 rounded text-[10px] font-bold text-white bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center gap-1"
                          >
                            <FiPlay size={10} /> Start
                          </button>
                        )}
                        {item.status === 'PREPARING' && (
                          <button
                            onClick={() => updateItemStatus(kot._id, actualIndex, 'READY', isExtraItem)}
                            className="w-full py-1 px-2 rounded text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <FiCheckCircle size={10} /> Mark Ready
                          </button>
                        )}
                        {item.status === 'READY' && (
                          <button
                            onClick={() => updateItemStatus(kot._id, actualIndex, 'SERVED', isExtraItem)}
                            className="w-full py-1 px-2 rounded text-[10px] font-bold text-white bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] flex items-center justify-center gap-1"
                          >
                            <FiPackage size={10} /> Mark Served
                          </button>
                        )}
                        {item.status === 'SERVED' && (
                          <div className="w-full py-1 px-2 rounded text-[10px] font-bold text-white text-center bg-gray-600 flex items-center justify-center gap-1">
                            <FiCheck size={10} /> Served
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>

                  <div className="px-3 pb-3">
                    {(() => {
                      const allItemsServed = allItems.length > 0 && allItems.every(item => item.status === 'SERVED');
                      
                      if (allItemsServed) {
                        return (
                          <div className="w-full px-3 py-2 rounded-xl text-sm font-bold text-white text-center bg-[#c2ab65] text-[#1f2937] flex items-center justify-center gap-2">
                            <FiCheckCircle /> All Served
                          </div>
                        );
                      } else {
                        const readyCount = allItems.filter(item => item.status === 'READY').length || 0;
                        const servedCount = allItems.filter(item => item.status === 'SERVED').length || 0;
                        const totalCount = allItems.length || 0;
                        return (
                          <div className="w-full px-3 py-2 rounded-xl text-xs font-medium text-gray-300 text-center bg-[#374151] flex items-center justify-center gap-2">
                            {servedCount > 0 ? (
                              <><FiPackage /> {servedCount}/{totalCount} Served</>
                            ) : readyCount > 0 ? (
                              <><FiCheckCircle /> {readyCount}/{totalCount} Ready</>
                            ) : (
                              <><FiClock /> Preparing...</>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </motion.div>
              )})}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && <KOTHistory />}
    </motion.div>
  );
};

export default KOT;
