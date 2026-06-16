-- Enable RLS for saved_events
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own saved events
CREATE POLICY "Users can view their own saved events"
ON saved_events FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own saved events
CREATE POLICY "Users can insert their own saved events"
ON saved_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own saved events
CREATE POLICY "Users can delete their own saved events"
ON saved_events FOR DELETE
USING (auth.uid() = user_id);
