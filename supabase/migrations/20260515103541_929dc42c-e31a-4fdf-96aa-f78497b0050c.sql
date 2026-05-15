CREATE TABLE public.video_unlock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text,
  proof_video_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.video_unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own unlock requests" ON public.video_unlock_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own unlock requests" ON public.video_unlock_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all unlock requests" ON public.video_unlock_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update unlock requests" ON public.video_unlock_requests
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.video_unlock_requests;