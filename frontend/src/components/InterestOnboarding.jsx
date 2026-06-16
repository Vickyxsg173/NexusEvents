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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">What are you interested in?</h2>
          <p className="text-slate-500 dark:text-slate-400">Select topics to personalize your event recommendations.</p>
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
                    : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {interest.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
          <button
            onClick={onComplete}
            className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors order-2 sm:order-1"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={selectedIds.size === 0 || loading}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all order-1 sm:order-2"
          >
            {loading ? 'Saving...' : `Continue (${selectedIds.size} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}
