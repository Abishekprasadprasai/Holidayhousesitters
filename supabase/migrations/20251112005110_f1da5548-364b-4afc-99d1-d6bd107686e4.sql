-- Create storage bucket for identity documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity-documents', 'identity-documents', false);

-- Create storage policies for identity documents
CREATE POLICY "Users can upload their own identity documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own identity documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all identity documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'identity-documents' 
  AND has_role(auth.uid(), 'admin')
);

-- Add document_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN document_url text;