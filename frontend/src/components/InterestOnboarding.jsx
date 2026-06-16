import React, { useEffect, useState } from 'react';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';

export default function InterestOnboarding({ onComplete }) {
  const { allInterests, fetchAllInterests, saveUserInterests, loading } = useProfileStore();
  const { user } = useAuthStore();
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchAllInterests();
  }, [fetchAllInterests]);

  const toggleInterest = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = async () => {
    if (selectedIds.size === 0) return;
    await saveUserInterests(Array.from(selectedIds));
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What are you interested in?</h2>
          <p className="text-gray-500 dark:text-gray-400">Select topics to personalize your event recommendations.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 justify-center max-h-80 overflow-y-auto p-2">
          {allInterests.map((interest) => {
            const isSelected = selectedIds.has(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2 
                  ${isSelected 
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 shadow-sm transform scale-105' 
                    : 'border-gray-200 text-gray-600 hover:border-brand-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {interest.name}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={selectedIds.size === 0 || loading}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : `Continue (${selectedIds.size} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}
