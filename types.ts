
export type UserRole = 'child' | 'parent';

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
    shield_icon: string;
    title: string;
}

export interface GlobalSettings {
    allow_coin_creation: boolean;
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
}

export interface Task {
    id: string;
    title: string;
    reward: number;
    xp: number;
    status: 'todo' | 'pending' | 'completed' | 'proposal';
    icon: string;
    proposalImage?: string;
    linkedDreamId?: string;
    assignedTo: string[];
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
