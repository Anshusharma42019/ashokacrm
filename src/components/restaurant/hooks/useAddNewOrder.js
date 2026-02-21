import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAddNewOrder = (orderId) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoadingMenu(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/menu-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Menu items response:', response.data);
      const items = Array.isArray(response.data) ? response.data : (response.data.menuItems || response.data.items || []);
      console.log('Processed menu items:', items);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setSelectedVariation(item.variation?.[0] || null);
    setSelectedAddons([]);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setSelectedVariation(null);
    setSelectedAddons([]);
  };

  const addItemToOrder = () => {
    if (!selectedVariation) return;

    const newItem = {
      key: `${selectedItem._id}-${selectedVariation._id}-${Date.now()}`,
      menuItemId: selectedItem._id,
      name: selectedItem.itemName,
      variation: selectedVariation,
      addons: selectedAddons,
      quantity: 1,
      price: selectedVariation.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0),
      timeToPrepare: selectedItem.timeToPrepare || 15
    };

    setOrderItems(prev => [...prev, newItem]);
    closeItemModal();
  };

  const updateItemQuantity = (key, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(key);
      return;
    }
    setOrderItems(prev => prev.map(item => 
      item.key === key ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (key) => {
    setOrderItems(prev => prev.filter(item => item.key !== key));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddItemsToOrder = async () => {
    if (orderItems.length === 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const extraItems = orderItems.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        variation: item.variation,
        addons: item.addons,
        quantity: item.quantity,
        timeToPrepare: item.timeToPrepare
      }));

      await axios.post(
        `${API_BASE_URL}/api/restaurant-orders/${orderId}/extra-items`,
        { extraItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderItems([]);
      return { success: true };
    } catch (err) {
      console.error('Failed to add items:', err);
      setError(err.response?.data?.error || 'Failed to add items to order');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
