-- Seed Default Interests
INSERT INTO interests (name, category) VALUES
('AI/ML', 'General'),
('Data Science', 'General'),
('Web Development', 'General'),
('Mobile Development', 'General'),
('Cybersecurity', 'General'),
('Cloud', 'General'),
('DevOps', 'General'),
('Blockchain', 'General'),
('Open Source', 'General'),
('Competitive Programming', 'General'),
('Robotics', 'General'),
('Startup', 'General'),
('Research', 'General')
ON CONFLICT (name) DO NOTHING;

-- Policies for RLS
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interests are viewable by everyone" ON interests FOR SELECT USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all user interests" ON user_interests FOR SELECT USING (true);
CREATE POLICY "Users can insert their own interests" ON user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interests" ON user_interests FOR DELETE USING (auth.uid() = user_id);
