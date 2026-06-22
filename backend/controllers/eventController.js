const { supabase } = require('../config/supabase');
const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase');
const CustomGeminiEmbeddings = require('../utils/geminiEmbeddings');
const { Document } = require('@langchain/core/documents');
// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { category, mode, search, source_platform, event_type, limit = 12, page = 1, user_id } = req.query;

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    // Call the custom SQL RPC function for filtered, paginated, and recommended events
    const { data, error } = await supabase.rpc('get_recommended_events', {
      p_user_id: user_id || null,
      p_search: search || null,
      p_category: category || null,
      p_mode: mode || null,
      p_source: source_platform || null,
      p_type: event_type || null,
      p_limit: limitNum,
      p_offset: offset
    });

    if (error) throw error;

    // Also get the total count for frontend if needed, though for infinite scroll we just check if data.length < limitNum
    res.status(200).json({
      success: true,
      count: data.length,
      page: pageNum,
      hasMore: data.length === limitNum,
      data
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: 'Server error fetching events', error: err.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_tags(tag_name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Transform event_tags array of objects into a simple array of strings
    if (data.event_tags) {
      data.tags = data.event_tags.map(t => t.tag_name);
      delete data.event_tags;
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ success: false, message: 'Server error fetching event', error: err.message });
  }
};

// @desc    Create a new event (For scraper/internal use)
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    // Verify API key so only the scraper can insert
    const apiKey = req.headers['x-api-secret'];
    if (!apiKey || apiKey !== process.env.SCRAPER_API_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing API secret' });
    }
    
    const { tags, ...eventData } = req.body;

    // 1. Insert the event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (eventError) throw eventError;

    // 2. Insert tags if any exist
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        event_id: newEvent.id,
        tag_name: tag
      }));

      const { error: tagError } = await supabase
        .from('event_tags')
        .insert(tagInserts);

      if (tagError) console.error("Error inserting tags:", tagError); // Non-fatal for the event itself
    }

    // 3. Real-time RAG Embedding Generation
    try {
      if (process.env.GEMINI_API_KEY) {
        const embeddings = new CustomGeminiEmbeddings(process.env.GEMINI_API_KEY);
        
        const pageContent = `
Event Title: ${newEvent.title || 'Unknown'}
Organization: ${newEvent.organizer || 'Unknown'}
Category: ${newEvent.category || 'Tech'}
Location/Mode: ${newEvent.mode || 'Online'}
Description: ${newEvent.description || ''}
        `.trim();

        const metadata = {
          event_id: newEvent.id,
          mode: newEvent.mode || 'Online',
          start_date: newEvent.start_date,
          tags: tags || []
        };

        const doc = new Document({ pageContent, metadata });

        await SupabaseVectorStore.fromDocuments(
          [doc],
          embeddings,
          {
            client: supabase,
            tableName: "event_embeddings",
            queryName: "match_event_embeddings",
          }
        );
      }
    } catch (embedError) {
      console.error("Error generating vector embedding for new event:", embedError);
      // Non-fatal, return 201 success anyway
    }

    res.status(201).json({
      success: true,
      data: newEvent
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ success: false, message: 'Server error creating event', error: err.message });
  }
};
