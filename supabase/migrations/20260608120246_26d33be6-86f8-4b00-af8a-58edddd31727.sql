-- Customer images: bucket is private, drop broad public read and restrict to admins
DROP POLICY IF EXISTS "Anyone can view customer images" ON storage.objects;

CREATE POLICY "Admins can view customer images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'customer-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Product images: bucket is public, so direct URL access still works.
-- Drop the broad SELECT policy that allowed listing all objects via the API.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;