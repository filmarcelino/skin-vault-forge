
import type { Database as OriginalDatabase } from './types';

// Define the extended User type
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  steam_id: string;
  created_at: string;
  is_admin: boolean;
}

// Override the users table type to include is_admin
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
        Relationships: OriginalDatabase['public']['Tables']['users']['Relationships'];
      };
    } & Omit<OriginalDatabase['public']['Tables'], 'users'>;
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
};

// Re-export all other types from the original types.ts
export type { 
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  Constants
} from './types';
