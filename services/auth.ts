import { supabase } from './supabase';

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
};

export const getLinkedMembers = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('user_members')
        .select('member_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Erro ao buscar membros vinculados:", error);
        return [];
    }

    return (data || []).map(row => row.member_id);
};
