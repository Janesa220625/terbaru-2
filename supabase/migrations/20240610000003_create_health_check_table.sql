-- Create a health_check table for connection testing
CREATE TABLE IF NOT EXISTS health_check (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL
);

-- Insert a test record
INSERT INTO health_check (status) VALUES ('ok');

-- Enable realtime for this table
alter publication supabase_realtime add table health_check;
