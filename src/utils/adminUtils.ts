
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithAdmin } from '@/integrations/supabase/client-override';

// Define a User type that includes the is_admin field 
// to match how we're using it in our code
type User = {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  steam_id: string | null;
  created_at: string;
  is_admin: boolean;
};

/**
 * Check if the current user has admin status
 */
export const checkAdminStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const userId = session.user.id;
    
    const { data, error } = await supabaseWithAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    // Check if is_admin property exists and is true
    return data && 'is_admin' in data ? !!data.is_admin : false;
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return false;
  }
};

/**
 * Get list of all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabaseWithAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    // Cast the data to include is_admin with default value
    return (data || []).map(user => ({
      ...user,
      is_admin: user.is_admin !== undefined ? !!user.is_admin : false
    })) as User[];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

/**
 * Toggle admin status for a user
 */
export const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
  try {
    // First check if the is_admin column exists
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'users', 
        column_name: 'is_admin' 
      });
    
    if (columnError || !columnInfo) {
      console.error('Error checking column or is_admin column does not exist:', columnError);
      return null;
    }
    
    // Now update with is_admin
    const { data, error } = await supabaseWithAdmin
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error updating admin status:', error);
      return null;
    }
    
    return data?.[0];
  } catch (error) {
    console.error('Error in toggleAdminStatus:', error);
    return null;
  }
};

/**
 * Grant admin role to a user
 */
export const grantAdminRole = async (userId: string) => {
  try {
    const { error } = await supabaseWithAdmin
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (error) {
      console.error('Error granting admin role:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in grantAdminRole:', error);
    return false;
  }
};

/**
 * Revoke admin role from a user
 */
export const revokeAdminRole = async (userId: string) => {
  try {
    const { error } = await supabaseWithAdmin
      .from('users')
      .update({ is_admin: false })
      .eq('id', userId);
    
    if (error) {
      console.error('Error revoking admin role:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in revokeAdminRole:', error);
    return false;
  }
};

// Add a new Supabase RPC function to check if a column exists in a table
// This will be helpful for checking if is_admin exists before using it
const createCheckColumnExistsFunction = async () => {
  const { error } = await supabase.rpc('create_check_column_exists_function');
  if (error) {
    console.error('Error creating check_column_exists function:', error);
  }
};

// Call this function when the app initializes to ensure the RPC exists
createCheckColumnExistsFunction();
