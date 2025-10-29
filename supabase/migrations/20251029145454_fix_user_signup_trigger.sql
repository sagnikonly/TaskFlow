-- Fix user signup trigger to create profile, categories, and analytics
-- This replaces the separate triggers from previous migrations

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS initialize_user_categories() CASCADE;

-- Create unified function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default categories
  INSERT INTO public.categories (user_id, name, icon) VALUES
    (NEW.id, 'Work', 'work'),
    (NEW.id, 'Health', 'favorite'),
    (NEW.id, 'Personal Growth', 'auto_stories'),
    (NEW.id, 'Shopping', 'shopping_cart'),
    (NEW.id, 'Fitness', 'fitness_center')
  ON CONFLICT (user_id, name) DO NOTHING;
  
  -- Create user analytics record
  INSERT INTO public.user_analytics (user_id) 
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger with the unified function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
