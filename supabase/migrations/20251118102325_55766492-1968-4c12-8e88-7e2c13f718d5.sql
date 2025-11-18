-- Fix search_path security issue by recreating functions with explicit search_path

CREATE OR REPLACE FUNCTION public.approve_admin_request(request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.reject_admin_request(request_id UUID, rejection_notes TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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