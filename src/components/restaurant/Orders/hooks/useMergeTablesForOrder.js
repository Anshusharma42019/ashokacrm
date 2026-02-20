import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useMergeTablesForOrder = (guestCount, tables) => {
  const [selectedTablesForMerge, setSelectedTablesForMerge] = useState([]);

  const maxTableCapacity = Math.max(...tables.filter(t => t.status?.toLowerCase() === 'available').map(t => t.capacity), 0);
  const showMergeOption = guestCount && parseInt(guestCount) > maxTableCapacity;

  const selectedCapacity = selectedTablesForMerge.reduce((sum, tableId) => {
    const table = tables.find(t => t._id === tableId);
    return sum + (table?.capacity || 0);
  }, 0);

  const isCapacityMet = selectedCapacity >= parseInt(guestCount || 0);

  useEffect(() => {
    if (!showMergeOption) {
      setSelectedTablesForMerge([]);
    }
  }, [showMergeOption]);

  const toggleTableSelection = (tableId) => {
    setSelectedTablesForMerge(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const mergeTables = async () => {
    if (selectedTablesForMerge.length < 2) {
      throw new Error('Select at least 2 tables to merge');
    }

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/api/table/tables/merge`,
      {
        tableIds: selectedTablesForMerge,
        guestCount: parseInt(guestCount)
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.mergedTable._id;
  };

  return {
    showMergeOption,
    selectedTablesForMerge,
    selectedCapacity,
    isCapacityMet,
    toggleTableSelection,
    mergeTables
  };
};
