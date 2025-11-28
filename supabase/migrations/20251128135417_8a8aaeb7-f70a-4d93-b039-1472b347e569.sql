-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-attachments', 'complaint-attachments', true);

-- Create storage policies
CREATE POLICY "Anyone can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'complaint-attachments' AND auth.role() = 'authenticated');