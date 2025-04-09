
export interface Skin {
  id: string;
  name: string;
  weapon_type: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband';
  exterior?: string;
  price_usd?: number | null;
  price_brl?: number | null;
  price_cny?: number | null;
  price_rub?: number | null;
  statTrak?: boolean;
  float?: number | null;
}

export interface UserSkin extends Skin {
  collection_id: string;
  acquired_date?: string;
  acquisition_price?: number | null;
  currency?: string | null;
  notes?: string | null;
}

export interface PaginatedSkins {
  skins: Skin[];
  count: number;
  page: number;
  pageSize: number;
}

export interface PaginatedUserSkins {
  skins: UserSkin[];
  count: number;
  page: number;
  pageSize: number;
}
