-- Enable RLS on events table (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read events
CREATE POLICY "Events are viewable by everyone" 
ON events FOR SELECT 
USING (true);

-- Allow backend scraper to insert events
-- (In production, you would restrict this to authenticated scraper roles or use the Service Role Key)
CREATE POLICY "Anyone can insert events" 
ON events FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read event tags
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event tags are viewable by everyone" 
ON event_tags FOR SELECT 
USING (true);

-- Allow backend scraper to insert event tags
CREATE POLICY "Anyone can insert event tags" 
ON event_tags FOR INSERT 
WITH CHECK (true);
