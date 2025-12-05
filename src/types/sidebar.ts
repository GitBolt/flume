export interface SidebarItemType {
  title: string;
  type: string;
  icon?: string;
  sub?: SidebarItemType[];
}

export interface SidebarContentType {
  title: string;
  icon: string;
  items: SidebarItemType[];
}

// Alias for backward compatibility
export type ItemType = SidebarItemType;

