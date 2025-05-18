
-- Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if a user has a specific role
-- This prevents recursive RLS issues
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create a security definer function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, req_resource TEXT, req_action TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role::text = r.name
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions perm ON rp.permission_id = perm.id
    WHERE p.id = user_id
      AND perm.resource = req_resource
      AND perm.action = req_action
  );
$$;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Policy for users to update their own profiles
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Policy to allow the handle_new_user function to insert new profiles
CREATE POLICY "New users can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable RLS on other tables

-- Orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to create their own orders
CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users with warehouse management permissions to view all orders
CREATE POLICY "Warehouse staff and admins can view all orders"
  ON public.orders
  FOR SELECT
  USING (public.user_has_permission(auth.uid(), 'warehouse', 'manage'));

-- Policy for users with warehouse management permissions to update orders
CREATE POLICY "Warehouse staff and admins can update orders"
  ON public.orders
  FOR UPDATE
  USING (public.user_has_permission(auth.uid(), 'warehouse', 'manage'));

-- Enable RLS on inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Policy for all authenticated users to view inventory
CREATE POLICY "All authenticated users can view inventory"
  ON public.inventory
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for warehouse staff to manage inventory
CREATE POLICY "Warehouse staff and admins can manage inventory"
  ON public.inventory
  FOR ALL
  USING (public.user_has_permission(auth.uid(), 'warehouse', 'manage'));

-- Create trigger function to populate roles table from profiles
CREATE OR REPLACE FUNCTION sync_roles_from_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Make sure all current roles exist in the roles table
  INSERT INTO public.roles (name, description)
  SELECT DISTINCT p.role::text, 'Auto-generated from profiles table'
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role::text = r.name
  WHERE r.id IS NULL AND p.role IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run this function when profiles are updated/inserted
CREATE TRIGGER trigger_sync_roles_from_profiles
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_roles_from_profiles();
