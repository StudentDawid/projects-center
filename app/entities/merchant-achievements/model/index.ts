export type AchievementCategory =
  | 'gold'
  | 'workers'
  | 'cities'
  | 'caravans'
  | 'prestige'
  | 'clicks'
  | 'factors'
  | 'hidden';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  hidden: boolean; // Hidden until unlocked
  condition: () => boolean;
  reward?: {
    type: 'production_bonus' | 'click_bonus' | 'prestige_bonus' | 'reputation_bonus';
    value: number; // Percentage bonus
    description: string;
  };
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // Timestamp
  seen: boolean; // Has player seen the notification?
}
