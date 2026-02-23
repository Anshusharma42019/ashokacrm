import React from 'react';

const ToggleButton = ({ isActive, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium ${!isActive ? 'text-gray-700' : 'text-gray-400'}`}>No</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isActive ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>Yes</span>
    </div>
  );
};

export default ToggleButton;
