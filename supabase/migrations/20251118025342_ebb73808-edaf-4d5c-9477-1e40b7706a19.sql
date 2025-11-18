-- Add comprehensive profile fields for sitters and homeowners

-- Add location field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location text;

-- Add availability fields (using date range)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS availability_start date,
ADD COLUMN IF NOT EXISTS availability_end date,
ADD COLUMN IF NOT EXISTS availability_flexible boolean DEFAULT false;

-- Add experience fields for sitters
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS years_experience text,
ADD COLUMN IF NOT EXISTS property_types_cared_for text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS animals_cared_for text[] DEFAULT '{}';

-- Add homeowner property details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS property_type text,
ADD COLUMN IF NOT EXISTS bedrooms_bathrooms text,
ADD COLUMN IF NOT EXISTS property_features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS wifi_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parking_available boolean DEFAULT false;

-- Add pet details for homeowners
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS number_of_pets integer,
ADD COLUMN IF NOT EXISTS pet_care_instructions text,
ADD COLUMN IF NOT EXISTS medication_needs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS exercise_requirements text;

-- Add house rules and emergency contacts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS house_rules text,
ADD COLUMN IF NOT EXISTS emergency_contacts text;

-- Add contact preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_contact_method text DEFAULT 'email';

-- Add rating field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0.00;