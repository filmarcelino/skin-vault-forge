
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Shield, ShieldOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { grantAdminRole, revokeAdminRole } from '@/utils/adminUtils';

type User = {
  id: string;
  email: string | null;
  username: string | null;
  isAdmin: boolean;
  created_at: string;
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch admin roles using the custom RPC function
      // Add proper type arguments for the RPC function
      const { data: adminUsersData, error: adminError } = await supabase
        .rpc<string[], Record<string, never>>('get_all_admin_users');

      if (adminError) throw adminError;

      // Create a set of admin user IDs for quick lookup
      const adminUserIds = new Set(adminUsersData || []);

      // Combine the data
      const combinedUsers = usersData.map(user => ({
        ...user,
        isAdmin: adminUserIds.has(user.id)
      })) as User[];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const success = await revokeAdminRole(userId);
        if (!success) throw new Error('Failed to revoke admin role');
      } else {
        // Add admin role
        const success = await grantAdminRole(userId);
        if (!success) throw new Error('Failed to grant admin role');
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !isCurrentlyAdmin } 
          : user
      ));

      toast({
        title: 'Success',
        description: `Admin role ${isCurrentlyAdmin ? 'removed from' : 'granted to'} user.`,
      });
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const viewUserInventory = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setInventoryDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user inventory.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.username || 'No username'}
                  </TableCell>
                  <TableCell>{user.email || 'No email'}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                      >
                        {user.isAdmin ? (
                          <ShieldOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Shield className="h-4 w-4 mr-1" />
                        )}
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewUserInventory(user.id)}
                      >
                        View Inventory
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.username || selectedUser?.email || 'User'}'s Inventory
            </DialogTitle>
            <DialogDescription>
              Review this user's skin collection
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* This would fetch and display the user's inventory items */}
            <p className="text-muted-foreground">
              Inventory details would be shown here. This could be implemented by fetching
              the user's collection items from the user_collections table.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
