-- Execute this in the Supabase SQL Editor

-- Create the event_reminders table
CREATE TABLE IF NOT EXISTS public.event_reminders (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    has_applied BOOLEAN DEFAULT false,
    reminder_days INTEGER DEFAULT 1,
    reminder_sent BOOLEAN DEFAULT false,
    custom_start_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can only have one reminder/application record per event
    UNIQUE(user_id, event_id)
);

-- If you already ran the previous script, run this line to add the new column:
-- ALTER TABLE public.event_reminders ADD COLUMN custom_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.event_reminders ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '08:00:00';

-- Enable RLS
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reminders" 
    ON public.event_reminders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" 
    ON public.event_reminders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
    ON public.event_reminders FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
    ON public.event_reminders FOR DELETE 
    USING (auth.uid() = user_id);
