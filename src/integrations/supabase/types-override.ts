
import type { Database as OriginalDatabase } from './types';

// Override the users table type to include is_admin
export type Database = {
  public: {
    Tables: {
      users: {
        Row: OriginalDatabase['public']['Tables']['users']['Row'] & {
          is_admin?: boolean;
        };
        Insert: OriginalDatabase['public']['Tables']['users']['Insert'] & {
          is_admin?: boolean;
        };
        Update: OriginalDatabase['public']['Tables']['users']['Update'] & {
          is_admin?: boolean;
        };
        Relationships: OriginalDatabase['public']['Tables']['users']['Relationships'];
      };
    } & Omit<OriginalDatabase['public']['Tables'], 'users'>;
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
};

// Re-export all other types from the original types.ts with the 'type' keyword
export type { 
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  Constants
} from './types';
