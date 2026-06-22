-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table specifically for LangChain embeddings. 
-- This table is completely separate from the main 'events' table.
create table if not exists public.event_embeddings (
  id uuid primary key default uuid_generate_v4(),
  content text, -- The dense text chunk representing the event
  metadata jsonb, -- Will store the original event_id and any other filterable data
  embedding vector(3072) -- Google Gemini-2 generates 3072-dimensional embeddings.
);

-- Enable Row Level Security (RLS) but allow read/write for now
alter table public.event_embeddings enable row level security;

-- Allow public read access (for chatbot retrieval)
create policy "Allow public read access to event_embeddings"
  on public.event_embeddings
  for select
  using (true);

-- Allow service role to manage embeddings (for the backend sync script)
create policy "Allow service role to insert event_embeddings"
  on public.event_embeddings
  for insert
  with check (true);

create policy "Allow service role to delete event_embeddings"
  on public.event_embeddings
  for delete
  using (true);

-- Create a Postgres function for vector similarity search (cosine distance)
-- LangChain's SupabaseVectorStore uses a function like this to find the top k results.
create or replace function match_event_embeddings (
  query_embedding vector(3072),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  embedding vector(3072),
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    event_embeddings.id,
    event_embeddings.content,
    event_embeddings.metadata,
    event_embeddings.embedding,
    1 - (event_embeddings.embedding <=> query_embedding) as similarity
  from event_embeddings
  where event_embeddings.metadata @> filter
  order by event_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
