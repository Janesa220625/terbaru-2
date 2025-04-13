-- Create a public bucket for application data storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('app_data', 'Application Data', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to the app_data bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app_data');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'app_data' AND owner = auth.uid())
WITH CHECK (bucket_id = 'app_data' AND owner = auth.uid());

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'app_data');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'app_data' AND owner = auth.uid());

-- Allow public access to read files (if needed)
CREATE POLICY "Allow public access to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'app_data' AND storage.foldername(name) = 'public');
