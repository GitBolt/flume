import { SidebarContentType } from '@/types/sidebar';
import { ACTION_DEFINITIONS } from './sendaiActions';

const groupByCategory = () => {
  const grouped: Record<string, { title: string; items: { title: string; type: string; icon: string }[] }> = {};
  ACTION_DEFINITIONS.forEach((action) => {
    if (!grouped[action.category]) {
      grouped[action.category] = {
        title: action.category,
        items: [],
      };
    }
    grouped[action.category].items.push({
      title: action.label,
      type: action.type,
      icon: "/icons/Crypto.svg",
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
