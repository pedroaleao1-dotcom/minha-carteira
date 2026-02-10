
import { createClient } from '@supabase/supabase-js';
import { Member, StoreItem } from '../types';

const SUPABASE_URL = 'https://omsjbleuvmwdqfcbzmjs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nqcylCcbP2z1YeeRZucUig_ggUhr6Wj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const fetchMembers = async (): Promise<Member[]> => {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching members:', error);
        return [];
    }
    return (data || []) as Member[];
};

export const upsertMember = async (member: Member) => {
    const { error } = await supabase
        .from('members')
        .upsert(member);
    
    if (error) console.error('Error upserting member:', error);
};

export const fetchStoreItems = async (): Promise<StoreItem[]> => {
    const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('title', { ascending: true });
    
    if (error) {
        console.error('Error fetching store items:', error);
        return [];
    }
    
    return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        icon: item.icon,
        color: item.color,
        assignedTo: item.assigned_to || []
    })) as StoreItem[];
};

export const upsertStoreItem = async (item: StoreItem) => {
    const { error } = await supabase
        .from('store_items')
        .upsert({
            id: item.id,
            title: item.title,
            price: item.price,
            icon: item.icon,
            color: item.color,
            assigned_to: item.assignedTo
        });
    
    if (error) console.error('Error upserting store item:', error);
};
