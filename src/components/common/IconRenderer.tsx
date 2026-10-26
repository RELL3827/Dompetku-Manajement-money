import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  size = 20,
  className = '',
  color,
}) => {
  // @ts-ignore dynamic index into Lucide icons
  const LucideIcon = (Icons as Record<string, any>)[name] || Icons.HelpCircle;

  return <LucideIcon size={size} className={className} color={color} />;
};

export const AVAILABLE_WALLET_ICONS = [
  'Banknote',
  'Landmark',
  'Smartphone',
  'CreditCard',
  'Coins',
  'Wallet',
  'Building2',
  'PiggyBank',
  'Vault',
  'DollarSign',
];

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Gamepad2',
  'HeartPulse',
  'GraduationCap',
  'HandHeart',
  'Briefcase',
  'Store',
  'TrendingUp',
  'Gift',
  'Coffee',
  'Plane',
  'Fuel',
  'Film',
  'Shirt',
  'Home',
  'Dumbbell',
  'BookOpen',
  'MoreHorizontal',
  'PlusCircle',
];

export const AVAILABLE_COLORS = [
  '#10b981', // emerald
  '#059669', // dark emerald
  '#3b82f6', // blue
  '#2563eb', // dark blue
  '#8b5cf6', // purple
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#64748b', // slate
];
