
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
    
    // Check if user has admin role using the RPC function with type parameters
    const { data, error } = await supabase
      .rpc<boolean>('has_admin_role', { user_id: userId });
    
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
    // Use RPC function to add admin role with type parameters
    const { error } = await supabase
      .rpc<void>('add_admin_role', { user_id: userId });
    
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
    // Use RPC function to remove admin role with type parameters
    const { error } = await supabase
      .rpc<void>('remove_admin_role', { user_id: userId });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error revoking admin role:', error);
    return false;
  }
};
