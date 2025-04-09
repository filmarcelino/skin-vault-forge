
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
    // Using rpc workaround since user_roles is not in the TypeScript types yet
    const { data, error } = await supabase
      .rpc('has_admin_role', { user_id: userId });
    
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
    // Using raw query workaround since user_roles is not in the TypeScript types yet
    const { error } = await supabase
      .rpc('add_admin_role', { user_id: userId });
    
    if (error) throw error;
    
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
    // Using raw query workaround since user_roles is not in the TypeScript types yet
    const { error } = await supabase
      .rpc('remove_admin_role', { user_id: userId });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error revoking admin role:', error);
    return false;
  }
};
