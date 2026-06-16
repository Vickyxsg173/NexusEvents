-- 1. Deduplicate Events (keep the newest one if source_urls match)
DELETE FROM events a USING events b
WHERE a.id < b.id 
  AND a.source_url = b.source_url 
  AND a.source_url IS NOT NULL;

-- 2. Deduplicate Events based on identical title and start_date (if no source_url)
DELETE FROM events a USING events b
WHERE a.id < b.id 
  AND a.title = b.title 
  AND a.start_date = b.start_date;

-- 3. Add UNIQUE constraint to prevent future scraper duplicates
ALTER TABLE events DROP CONSTRAINT IF EXISTS unique_source_url;
ALTER TABLE events ADD CONSTRAINT unique_source_url UNIQUE (source_url);

-- 3.5 Drop the strict CHECK constraint on mode to allow scraper inserts
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_mode_check;

-- 4. Create SQL Function for Server-Side Recommendation & Pagination
CREATE OR REPLACE FUNCTION get_recommended_events(
    p_user_id UUID DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_mode TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    organizer TEXT,
    event_type TEXT,
    category TEXT,
    mode TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    registration_link TEXT,
    source_url TEXT,
    cover_image TEXT,
    tags TEXT[],
    match_score INTEGER
) AS $$
DECLARE
    ten_days_ago TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '10 days';
BEGIN
    RETURN QUERY
    WITH event_matches AS (
        SELECT 
            e.*,
            -- Subquery to aggregate tags into an array
            ARRAY(SELECT tag_name FROM event_tags WHERE event_id = e.id) as tags_array,
            
            -- Calculate Match Score
            CASE 
                WHEN p_user_id IS NULL THEN 0
                ELSE (
                    SELECT COALESCE(SUM(
                        CASE 
                            -- Category exact match = 10 pts
                            WHEN e.category ILIKE '%' || i.category || '%' THEN 10
                            -- Keyword match in tags = 5 pts
                            WHEN EXISTS (SELECT 1 FROM event_tags et WHERE et.event_id = e.id AND et.tag_name ILIKE '%' || i.name || '%') THEN 5
                            -- Keyword match in title = 2 pts
                            WHEN e.title ILIKE '%' || i.name || '%' THEN 2
                            ELSE 0
                        END
                    ), 0)::INTEGER
                    FROM user_interests ui
                    JOIN interests i ON ui.interest_id = i.id
                    WHERE ui.user_id = p_user_id
                )
            END as calculated_score
        FROM events e
        WHERE 
            -- Filter out very old events (must be >= 10 days ago or TBA)
            (e.start_date >= ten_days_ago OR e.start_date IS NULL)
            
            -- Standard Filters
            AND (p_category IS NULL OR p_category = '' OR e.category = p_category)
            AND (p_mode IS NULL OR p_mode = '' OR e.mode = p_mode)
            AND (p_source IS NULL OR p_source = '' OR e.source_platform = p_source)
            AND (p_type IS NULL OR p_type = '' OR e.event_type = p_type)
            
            -- Search Text
            AND (
                p_search IS NULL OR p_search = '' 
                OR e.title ILIKE '%' || p_search || '%' 
                OR e.description ILIKE '%' || p_search || '%'
            )
    )
    SELECT 
        em.id, em.title, em.description, em.organizer, em.event_type, em.category, 
        em.mode, em.start_date, em.end_date, em.venue, em.registration_link, 
        em.source_url, em.cover_image, em.tags_array, em.calculated_score
    FROM event_matches em
    ORDER BY 
        -- 1. Recommendations first
        em.calculated_score DESC, 
        -- 2. Then upcoming chronological
        em.start_date ASC NULLS LAST
    LIMIT p_limit 
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
