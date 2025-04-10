
import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Shield } from 'lucide-react';

interface NavigationLinksProps {
  isAdmin?: boolean;
  isMobile?: boolean;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ isAdmin, isMobile }) => {
  return (
    <nav className={`${isMobile ? 'grid gap-4 text-lg mt-8' : 'hidden md:flex gap-6 mx-6'}`}>
      <Link
        to="/"
        className={`${isMobile 
          ? 'flex items-center gap-2 text-muted-foreground hover:text-foreground' 
          : 'text-sm font-medium transition-colors hover:text-foreground text-muted-foreground'}`}
      >
        Home
      </Link>
      <Link
        to="/inventory"
        className={`${isMobile 
          ? 'flex items-center gap-2 text-muted-foreground hover:text-foreground' 
          : 'text-sm font-medium transition-colors hover:text-foreground text-muted-foreground'}`}
      >
        Inventory
      </Link>
      <Link
        to="/steam-inventory"
        className={`${isMobile 
          ? 'flex items-center gap-2 text-muted-foreground hover:text-foreground' 
          : 'text-sm font-medium transition-colors hover:text-foreground text-muted-foreground flex items-center gap-1'}`}
      >
        <Cloud className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
        Steam Inventory
      </Link>
      <a
        href="#"
        className={`${isMobile 
          ? 'flex items-center gap-2 text-muted-foreground hover:text-foreground' 
          : 'text-sm font-medium transition-colors hover:text-foreground text-muted-foreground'}`}
      >
        Market
      </a>
      <a
        href="#"
        className={`${isMobile 
          ? 'flex items-center gap-2 text-muted-foreground hover:text-foreground' 
          : 'text-sm font-medium transition-colors hover:text-foreground text-muted-foreground'}`}
      >
        Statistics
      </a>
      {isAdmin && (
        <Link
          to="/admin"
          className={`${isMobile 
            ? 'flex items-center gap-2 text-primary hover:text-primary/80' 
            : 'text-sm font-medium transition-colors hover:text-primary/80 text-primary flex items-center gap-1'}`}
        >
          <Shield className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
          Admin{!isMobile && ' Dashboard'}
        </Link>
      )}
    </nav>
  );
};

export default NavigationLinks;
