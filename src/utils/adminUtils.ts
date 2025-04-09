
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has admin status
 */
export const checkAdminStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const userId = session.user.id;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    // Use optional chaining to safely access is_admin
    return data?.is_admin === true;
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return false;
  }
};

/**
 * Get list of all users
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
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
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating admin status:', error);
      return null;
    }
    
    return data;
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
    const { error } = await supabase
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
    const { error } = await supabase
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
