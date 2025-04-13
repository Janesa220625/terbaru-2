-- Create a function to list all tables in the public schema
CREATE OR REPLACE FUNCTION get_tables()
RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tables() TO anon;
