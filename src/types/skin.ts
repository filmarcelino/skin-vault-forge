
export interface Skin {
  id: string;
  name: string;
  weapon_type: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband';
  exterior?: string;
  price_usd?: number | null;
  statTrak?: boolean;
}
