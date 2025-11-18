-- Create a table for pending admin requests
CREATE TABLE IF NOT EXISTS public.pending_admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.pending_admin_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own admin requests"
  ON public.pending_admin_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all admin requests"
  ON public.pending_admin_requests
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Anyone can insert their own request
CREATE POLICY "Users can request admin access"
  ON public.pending_admin_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update requests
CREATE POLICY "Admins can update admin requests"
  ON public.pending_admin_requests
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to approve admin request
CREATE OR REPLACE FUNCTION public.approve_admin_request(request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve admin requests';
  END IF;

  -- Get the user_id from the request
  SELECT user_id INTO v_user_id
  FROM public.pending_admin_requests
  WHERE id = request_id AND status = 'pending';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Update the request status
  UPDATE public.pending_admin_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = request_id;

  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark as paid (admins don't pay)
  UPDATE public.profiles
  SET is_paid = true
  WHERE user_id = v_user_id;
END;
$$;

-- Create function to reject admin request
CREATE OR REPLACE FUNCTION public.reject_admin_request(request_id UUID, rejection_notes TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject admin requests';
  END IF;

  -- Update the request status
  UPDATE public.pending_admin_requests
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    notes = rejection_notes
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$$;