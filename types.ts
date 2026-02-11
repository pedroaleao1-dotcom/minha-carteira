
export type UserRole = 'child' | 'parent';
export type TaskFrequency = 'once' | 'daily';
export type TaskCategory = 'study' | 'chore' | 'health' | 'fitness';

export interface Transaction {
    id: string;
    type: 'purchase' | 'sale' | 'reward' | 'investment' | 'bonus';
    title: string;
    amount: number;
    icon: string;
    timestamp: number;
}

export interface LevelConfig {
    level_number: number;
    xp_required: number;
    coins_required: number;
    shield_icon: string;
    title: string;
}

export interface GlobalSettings {
    allow_coin_creation: boolean;
}

export interface DreamStep {
    id: string;
    title: string;
    isCompleted: boolean;
    orderIndex: number;
    xpReward: number;
}

export interface Member {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
    badge: string;
    level: number;
    xp: number;
    coins: number;
    dreams: Dream[];
    tasks: Task[];
    achievements: Achievement[];
    redemptions: Redemption[];
    history: Transaction[];
    notifications?: {
        tasks: boolean;
        achievements: boolean;
    };
}

export interface Dream {
    id: string;
    title: string;
    icon: string;
    targetAmount: number;
    currentAmount: number;
    estimatedAmount?: number;
    imageUrl?: string;
    status: 'active' | 'proposal';
    steps?: DreamStep[];
}

export interface Task {
    id: string;
    title: string;
    reward: number;
    xp: number;
    status: 'todo' | 'pending' | 'completed' | 'proposal';
    icon: string;
    frequency: TaskFrequency;
    category: TaskCategory;
    proposalImage?: string;
    linkedDreamId?: string;
    assignedTo: string[];
    lastCompletedAt?: number;
}

export interface StoreItem {
    id: string;
    title: string;
    price: number;
    icon: string;
    color: string;
    assignedTo: string[];
}

export interface Redemption {
    id: string;
    itemId: string;
    title: string;
    icon: string;
    status: 'pending' | 'delivered';
    timestamp: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
}
