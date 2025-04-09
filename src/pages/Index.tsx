
import React from 'react';
import Navbar from '@/components/Navbar';
import SkinCard from '@/components/SkinCard';
import FilterBar from '@/components/FilterBar';
import CategoryTabs from '@/components/CategoryTabs';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

// Mock skin data
const skins = [
  {
    id: 1,
    name: "AWP | Dragon Lore",
    weaponType: "AWP",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "ancient",
    wear: "Factory New",
    price: "$10,450.00",
    statTrak: false,
  },
  {
    id: 2,
    name: "AK-47 | Neon Rider",
    weaponType: "AK-47",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "legendary",
    wear: "Minimal Wear",
    price: "$145.50",
    statTrak: true,
  },
  {
    id: 3,
    name: "M4A4 | Howl",
    weaponType: "M4A4",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "contraband",
    wear: "Field-Tested",
    price: "$3,875.20",
    statTrak: false,
  },
  {
    id: 4,
    name: "Desert Eagle | Blaze",
    weaponType: "Desert Eagle",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "mythical",
    wear: "Factory New",
    price: "$410.00",
    statTrak: false,
  },
  {
    id: 5,
    name: "Karambit | Fade",
    weaponType: "Knife",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "rare",
    wear: "Factory New",
    price: "$1,250.75",
    statTrak: true,
  },
  {
    id: 6,
    name: "USP-S | Kill Confirmed",
    weaponType: "USP-S",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "legendary",
    wear: "Well-Worn",
    price: "$120.30",
    statTrak: true,
  },
  {
    id: 7,
    name: "Glock-18 | Fade",
    weaponType: "Glock-18",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "mythical",
    wear: "Minimal Wear",
    price: "$750.00",
    statTrak: false,
  },
  {
    id: 8,
    name: "Butterfly | Doppler",
    weaponType: "Knife",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rarity: "ancient",
    wear: "Factory New",
    price: "$3,200.00",
    statTrak: false,
  }
];

const Index = () => {
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-foreground">Welcome to </span>
            <span className="text-neon-purple neon-text">SkinVault</span>
          </h1>
          <p className="text-muted-foreground">
            Manage, track, and showcase your CS2 skin collection in one place.
          </p>
        </div>
        
        <CategoryTabs />
        <FilterBar />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
          {skins.map((skin) => (
            <SkinCard 
              key={skin.id}
              name={skin.name}
              weaponType={skin.weaponType}
              image={skin.image}
              rarity={skin.rarity as any}
              wear={skin.wear}
              price={skin.price}
              statTrak={skin.statTrak}
            />
          ))}
        </div>
      </main>
      
      <footer className="border-t border-border/40 py-6 px-4 mt-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Clutch Studio's SkinVault. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
      
      {showBackToTop && (
        <Button 
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg z-40 neon-border"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default Index;
