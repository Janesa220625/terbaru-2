-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  pairs_per_box INTEGER NOT NULL,
  sizes TEXT NOT NULL,
  colors TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create box_stock table
CREATE TABLE IF NOT EXISTS box_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL REFERENCES products(sku),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  box_count INTEGER NOT NULL,
  pairs_per_box INTEGER NOT NULL,
  total_pairs INTEGER NOT NULL,
  stock_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_units table
CREATE TABLE IF NOT EXISTS stock_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  box_id TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT,
  last_modified TIMESTAMP WITH TIME ZONE,
  modified_by TEXT
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sku TEXT NOT NULL,
  box_count INTEGER NOT NULL,
  pairs_per_box INTEGER NOT NULL,
  total_pairs INTEGER NOT NULL,
  product_name TEXT
);

-- Create outgoing_documents table
CREATE TABLE IF NOT EXISTS outgoing_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number TEXT NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient TEXT NOT NULL,
  notes TEXT,
  total_items INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outgoing_items table
CREATE TABLE IF NOT EXISTS outgoing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES outgoing_documents(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Products policies
CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow staff and above to insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow staff and above to update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Allow authenticated users to read box_stock"
  ON box_stock FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read stock_units"
  ON stock_units FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read deliveries"
  ON deliveries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read outgoing_documents"
  ON outgoing_documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read outgoing_items"
  ON outgoing_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE box_stock;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_units;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE outgoing_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE outgoing_items;
