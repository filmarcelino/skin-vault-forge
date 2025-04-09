
-- Function to check if a user has admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND role = 'admin'
  );
$$;

-- Function to add admin role to a user
CREATE OR REPLACE FUNCTION public.add_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Check if role already exists
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE public.user_roles.user_id = $1 AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES ($1, 'admin');
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to remove admin role from a user
CREATE OR REPLACE FUNCTION public.remove_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE public.user_roles.user_id = $1 AND role = 'admin';
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to get all users with admin role
CREATE OR REPLACE FUNCTION public.get_all_admin_users()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT user_id FROM public.user_roles WHERE role = 'admin';
$$;
