-- Add vet_nurse to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'vet_nurse';

-- Add vet nurse specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS medical_experience text,
ADD COLUMN IF NOT EXISTS emergency_services boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS medication_support boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS triage_support boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS general_advice boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vet_service_description text;