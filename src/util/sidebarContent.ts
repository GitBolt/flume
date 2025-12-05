import { SidebarContentType } from '@/types/sidebar';
import { ACTION_DEFINITIONS } from './sendaiActions';

// Map of category names to their logo paths
const categoryLogos: Record<string, string> = {
  'Adrena': '/logos/adrena.png',
  'Flash': '/logos/flashtrade.jpg',
  'Drift': '/logos/drifttrade.png',
  'OpenBook': '/logos/openbook.png',
  'FluxBeam': '/logos/fluxbeam.png',
  'Orca': '/logos/orca.png',
  'Raydium': '/logos/raydium.png',
  'Solayer': '/logos/solayer.jpg',
  'Voltr': '/logos/voltr.jpg',
  'Sanctum': '/logos/sanctum.jpg',
  'Jupiter': '/logos/jupiter.png',
  'Tokens': '/icons/Crypto.svg',
  'Solana': '/logos/solana.png',
  'Mayan': '/logos/mayan.avif',
  'Pumpfun': '/logos/pump.jpg',
  'Pyth': '/logos/pyth.png',
  'Rugcheck': '/logos/rugcheck.jpg',
  'Solutiofi': '/icons/Crypto.svg',
};

const groupByCategory = () => {
  const grouped: Record<string, { title: string; icon: string; items: { title: string; type: string; icon: string }[] }> = {};
  ACTION_DEFINITIONS.forEach((action) => {
    if (!grouped[action.category]) {
      grouped[action.category] = {
        title: action.category,
        icon: categoryLogos[action.category] || '/icons/Crypto.svg',
        items: [],
      };
    }
    grouped[action.category].items.push({
      title: action.label,
      type: action.type,
      icon: categoryLogos[action.category] || '/icons/Crypto.svg',
    });
  });
  return Object.values(grouped);
};

export const sidebarContent: SidebarContentType[] = [
  ...groupByCategory(),
  {
    title: "Assets",
    icon: "/icons/Util.svg",
    items: [
      { title: "Folder", type: "folder", icon: "/icons/Util.svg" },
    ],
  },
];
