import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Bell, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function ApplyReminderModal({ event, isOpen, onClose, onApplicationConfirmed, onReminderSaved, mode = 'apply' }) {
  const { user } = useAuthStore();
  
  const [step, setStep] = useState(mode === 'reminder_only' ? 2 : 1); // 1 = Ask if applied, 2 = Set Reminder, 3 = Success
  const [reminderDays, setReminderDays] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isCustomDays, setIsCustomDays] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setStep(mode === 'reminder_only' ? 2 : 1);
      setReminderDays(1);
      setReminderTime('08:00');
      setIsSubmitting(false);
      setError('');
      setIsCustomDays(false);
    }
  }, [isOpen, mode]);

  React.useEffect(() => {
    if (event?.start_date) {
      try {
        setCustomStartDate(new Date(event.start_date).toISOString().split('T')[0]);
      } catch (e) {}
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      return new Intl.DateTimeFormat('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }).format(new Date(dateString));
    } catch {
      return 'Date TBA';
    }
  };

  const handleApplyConfirm = async (didApply) => {
    if (!user) return onClose();
    
    if (!didApply) {
      // User didn't apply, just close the modal.
      return onClose();
    }
    
    setIsSubmitting(true);
    try {
      await supabase
        .from('event_reminders')
        .upsert({
          user_id: user.id,
          event_id: event.id,
          has_applied: true,
          reminder_sent: false
        }, { onConflict: 'user_id,event_id' });
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);

    if (onApplicationConfirmed) onApplicationConfirmed();
    
    // Move to step 2 to set reminder
    setStep(2);
  };

  const handleSaveReminder = async () => {
    if (!user) return onClose();
    
    setIsSubmitting(true);
    setError('');

    try {
      const { error: upsertError } = await supabase
        .from('event_reminders')
        .upsert({
          user_id: user.id,
          event_id: event.id,
          has_applied: mode === 'apply',
          reminder_days: reminderDays,
          reminder_time: reminderTime + ':00', // format as time
          reminder_sent: false,
          custom_start_date: customStartDate ? new Date(customStartDate).toISOString() : null
        }, { onConflict: 'user_id,event_id' });

      if (upsertError) throw upsertError;
      
      if (onReminderSaved) onReminderSaved(reminderDays);
      setStep(3);
    } catch (err) {
      console.error("Failed to save reminder:", err);
      setError(err.message || 'Failed to save reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Did you apply?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              We noticed you just checked out <strong>{event.title}</strong>. Did you successfully complete the application?
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleApplyConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Not yet
              </button>
              <button 
                onClick={() => handleApplyConfirm(true)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-colors"
              >
                Yes, I applied!
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Never Miss the Start</h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              {mode === 'apply' ? "Awesome! We've marked you as applied. Want us to remind you before it begins?" : "Want us to remind you before the event begins?"}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center flex-1">
                <Calendar className="w-10 h-10 text-brand-500 mr-4" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Event Starts</p>
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-white font-medium border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-brand-500 w-full"
                  />
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Send Time</p>
                <input 
                  type="time" 
                  value={reminderTime} 
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white font-medium border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-brand-500 w-full"
                />
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Remind me via email:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: '1 Day', value: 1 },
                { label: '3 Days', value: 3 },
                { label: '1 Week', value: 7 },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => { setReminderDays(option.value); setIsCustomDays(false); }}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    !isCustomDays && reminderDays === option.value 
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setIsCustomDays(true)}
                className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  isCustomDays 
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustomDays && (
              <div className="mb-8 flex items-center justify-center gap-3">
                <input 
                  type="number" 
                  min="1"
                  max="365"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value) || 1)}
                  className="w-20 bg-slate-50 dark:bg-slate-800 text-center text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600 rounded-lg py-2 focus:outline-none focus:border-brand-500"
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium">days before</span>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button 
              onClick={handleSaveReminder}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Bell className="w-5 h-5 mr-2" /> Set Reminder
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              className="w-full mt-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
            >
              No thanks, skip reminder
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">You're All Set!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              We'll send you an email reminder {reminderDays} day{reminderDays === 1 ? '' : 's'} before <strong>{event.title}</strong> begins 
              {customStartDate ? ` on ${formatDate(customStartDate)}` : ''} at {reminderTime} so you can get ready.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 flex items-center justify-center transition-all"
            >
              Done <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
