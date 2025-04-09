
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the current user has admin permissions
 * @returns Promise<boolean> True if user is admin, false otherwise
 */
export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const userId = session.user.id;
    
    // Check if user has admin role in the user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data; // Return true if data exists (user is admin)
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return false;
  }
};

/**
 * Grants admin role to a user
 * @param userId The ID of the user to grant admin role to
 */
export const grantAdminRole = async (userId: string): Promise<boolean> => {
  try {
    // Check if the role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    // If role doesn't exist, add it
    if (!existingRole) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error granting admin role:', error);
    return false;
  }
};

/**
 * Revokes admin role from a user
 * @param userId The ID of the user to revoke admin role from
 */
export const revokeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error revoking admin role:', error);
    return false;
  }
};
