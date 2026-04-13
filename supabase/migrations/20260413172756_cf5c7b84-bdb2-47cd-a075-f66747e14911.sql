
-- Create customer media table
CREATE TABLE public.customer_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own media"
ON public.customer_media FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own media"
ON public.customer_media FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all media"
ON public.customer_media FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for customer media
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-media', 'customer-media', true);

CREATE POLICY "Anyone can view customer media"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-media');

CREATE POLICY "Authenticated users can upload customer media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-media' AND auth.uid() IS NOT NULL);
