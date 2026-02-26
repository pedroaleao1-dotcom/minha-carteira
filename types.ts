
export type UserRole = 'child' | 'parent';
export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'custom';
export type TaskCategory = 'study' | 'chore' | 'health' | 'fitness';

export interface BaseEntity {
    updatedAt: number;
}

export interface JourneyTemplate extends BaseEntity {
    id: string;
    title: string;
    description?: string;
    icon: string;
    steps: DreamStep[];
}

export interface TaskCompletion extends BaseEntity {
    id: string;
    taskId: string;
    memberId: string;
    completedAt: number;
    taskTitle: string;
    icon: string;
    rewardCoins: number;
    rewardXp: number;
}

export interface Transaction extends BaseEntity {
    id: string;
    type: 'purchase' | 'sale' | 'reward' | 'investment' | 'bonus';
    title: string;
    amount: number;
    icon: string;
    timestamp: number;
}

export interface LevelConfig extends BaseEntity {
    level_number: number;
    xp_required: number;
    coins_required: number;
    shield_icon: string;
    title: string;
}

export interface GlobalSettings extends BaseEntity {
    allow_coin_creation: boolean;
}

export interface DreamStep extends BaseEntity {
    id: string;
    title: string;
    isCompleted: boolean;
    orderIndex: number;
    xpReward: number;
    coinReward: number;
    xPos: number;
    yPos: number;
    icon: string;
}

export interface Member extends BaseEntity {
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
    taskCompletions: TaskCompletion[];
    achievements: Achievement[];
    redemptions: Redemption[];
    history: Transaction[];
    notifications?: {
        tasks: boolean;
        achievements: boolean;
    };
}

export interface Dream extends BaseEntity {
    id: string;
    title: string;
    icon: string;
    targetAmount: number;
    currentAmount: number;
    estimatedAmount?: number;
    imageUrl?: string;
    status: 'active' | 'proposal';
    steps?: DreamStep[];
    templateId?: string; // ID do mapa global, se houver
    totalXpTarget?: number;
}

export interface Task extends BaseEntity {
    id: string;
    title: string;
    reward: number;
    xp: number;
    status: 'todo' | 'pending' | 'completed' | 'proposal';
    icon: string;
    frequency: TaskFrequency;
    recurrenceText?: string;
    category: TaskCategory;
    proposalImage?: string;
    linkedDreamId?: string;
    assignedTo: string[];
    lastCompletedAt?: number;
}

export interface StoreItem extends BaseEntity {
    id: string;
    title: string;
    price: number;
    icon: string;
    color: string;
    assignedTo: string[];
}

export interface Redemption extends BaseEntity {
    id: string;
    itemId: string;
    title: string;
    icon: string;
    status: 'pending' | 'delivered';
    timestamp: number;
}

export interface Achievement extends BaseEntity {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
}
