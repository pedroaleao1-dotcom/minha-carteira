
import React, { useState, useEffect } from 'react';
import { Member, LevelConfig, GlobalSettings } from '../types';
import { fetchGlobalSettings, updateGlobalSettings, fetchLevelConfigs, updateLevelConfig, deleteLevelConfig, upsertMember } from '../services/supabase';

interface Props {
    members: Member[];
    onBack: () => void;
}

const SHIELD_OPTIONS = [
    'shield', 'military_tech', 'stars', 'workspace_premium', 'verified_user', 
    'rocket_launch', 'diamond', 'castle', 'crown', 'security', 
    'bolt', 'local_fire_department', 'auto_awesome', 'pentagon'
];

const FORGE_ICONS = [
    'auto_awesome', 'redeem', 'card_giftcard', 'paid', 'diamond', 
    'military_tech', 'verified', 'rocket_launch', 'celebration', 'star'
];

const CouncilRoom: React.FC<Props> = ({ members, onBack }) => {
    const [settings, setSettings] = useState<GlobalSettings>({ allow_coin_creation: true });
    const [levels, setLevels] = useState<LevelConfig[]>([]);
    
    // Estados da Forja de Riqueza
    const [forgeTitle, setForgeTitle] = useState('Tesouro Real');
    const [forgeIcon, setForgeIcon] = useState('auto_awesome');
    const [forgeCoins, setForgeCoins] = useState(50);
    const [forgeXP, setForgeXP] = useState(100);
    const [selectedGrantees, setSelectedGrantees] = useState<string[]>([]);
    const [isForging, setIsForging] = useState(false);
    
    // UI State para Novo Nível
    const [isAddingLevel, setIsAddingLevel] = useState(false);
    const [newLevel, setNewLevel] = useState<LevelConfig>({
        level_number: 1,
        title: '',
        xp_required: 0,
        coins_required: 0,
        shield_icon: 'shield'
    });

    useEffect(() => {
        fetchGlobalSettings().then(setSettings);
        fetchLevelConfigs().then(setLevels);
    }, []);

    const toggleCoinCreation = async () => {
        const newSettings = { allow_coin_creation: !settings.allow_coin_creation };
        setSettings(newSettings);
        await updateGlobalSettings(newSettings);
    };

    const handleForgeWealth = async () => {
        if (selectedGrantees.length === 0) return;
        setIsForging(true);

        const now = Date.now();
        const updatePromises = selectedGrantees.map(async (id) => {
            const member = members.find(m => m.id === id);
            if (!member) return;

            const updatedMember = {
                ...member,
                coins: member.coins + forgeCoins,
                xp: member.xp + forgeXP,
                history: [{
                    id: `forge-${now}-${id}`,
                    type: 'bonus' as const,
                    title: forgeTitle,
                    amount: forgeCoins,
                    icon: forgeIcon,
                    timestamp: now
                }, ...member.history]
            };
            return upsertMember(updatedMember);
        });

        await Promise.all(updatePromises);
        setIsForging(false);
        alert(`O tesouro "${forgeTitle}" foi forjado e entregue para ${selectedGrantees.length} integrantes!`);
        setSelectedGrantees([]);
    };

    const toggleGrantee = (id: string) => {
        setSelectedGrantees(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleSaveLevel = async (lv: LevelConfig) => {
        await updateLevelConfig(lv);
        const updated = await fetchLevelConfigs();
        setLevels(updated);
        setIsAddingLevel(false);
    };

    const handleDeleteLevel = async (levelNumber: number) => {
        if (confirm(`Excluir o nível ${levelNumber}?`)) {
            await deleteLevelConfig(levelNumber);
            const updated = await fetchLevelConfigs();
            setLevels(updated);
        }
    };

    const prepareNewLevel = () => {
        const nextLevelNumber = levels.length > 0 ? Math.max(...levels.map(l => l.level_number)) + 1 : 1;
        setNewLevel({
            level_number: nextLevelNumber,
            title: `Nível ${nextLevelNumber}`,
            xp_required: nextLevelNumber * 500,
            coins_required: nextLevelNumber * 100,
            shield_icon: 'military_tech'
        });
        setIsAddingLevel(true);
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-white">
            <header className="flex items-center justify-between p-6 pt-10 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-30 border-b border-white/5">
                <button onClick={onBack} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md active:scale-90 transition-all border border-white/10">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-amber-500">Sala do Conselho</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Câmara da Forja & Destino</p>
                </div>
                <div className="w-12 h-12"></div>
            </header>

            <main className="flex-1 p-6 space-y-12 overflow-y-auto pb-32">
                {/* Grande Forja Real */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 fill-1 text-xl animate-pulse">local_fire_department</span>
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grande Forja Real</h2>
                        </div>
                        <button 
                            onClick={toggleCoinCreation}
                            className={`w-12 h-6 rounded-full relative p-1 transition-all ${settings.allow_coin_creation ? 'bg-amber-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${settings.allow_coin_creation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {settings.allow_coin_creation && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-[3rem] p-8 border border-amber-500/20 space-y-6 animate-pop-in relative overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Tesouro</label>
                                    <input 
                                        type="text" 
                                        value={forgeTitle}
                                        onChange={(e) => setForgeTitle(e.target.value)}
                                        className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Ex: Bênção da Sabedoria"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Moedas</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={forgeCoins}
                                                onChange={(e) => setForgeCoins(Number(e.target.value))}
                                                className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 pl-10 text-sm font-black text-amber-500 outline-none"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-lg fill-1">monetization_on</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">XP</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={forgeXP}
                                                onChange={(e) => setForgeXP(Number(e.target.value))}
                                                className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 pl-10 text-sm font-black text-blue-400 outline-none"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg">bolt</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Ícone Místico</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {FORGE_ICONS.map(icon => (
                                            <button 
                                                key={icon}
                                                onClick={() => setForgeIcon(icon)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${forgeIcon === icon ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg' : 'bg-slate-800 text-slate-500'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg">{icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Integrantes do Reino que receberão</label>
                                    <div className="flex flex-wrap gap-4">
                                        {members.map(m => {
                                            const isSelected = selectedGrantees.includes(m.id);
                                            return (
                                                <button 
                                                    key={m.id}
                                                    onClick={() => toggleGrantee(m.id)}
                                                    className="flex flex-col items-center gap-2 group"
                                                >
                                                    <div className={`relative w-14 h-14 rounded-full border-4 transition-all duration-300 ${isSelected ? 'border-amber-500 scale-110' : 'border-white/5 opacity-40 grayscale group-hover:opacity-60'}`}>
                                                        <img src={m.avatar} className="w-full h-full object-cover rounded-full" alt={m.name} />
                                                        
                                                        {/* Indicador de Função (Badge) */}
                                                        <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-md ${m.role === 'parent' ? 'bg-slate-700' : 'bg-blue-600'}`}>
                                                            <span className="material-symbols-outlined text-[10px] text-white">
                                                                {m.role === 'parent' ? 'shield' : 'rocket_launch'}
                                                            </span>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pop-in">
                                                                <span className="material-symbols-outlined text-[12px] font-black">check</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-amber-500' : 'text-slate-500'}`}>{m.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleForgeWealth}
                                disabled={selectedGrantees.length === 0 || isForging}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-amber-500/10 active-press disabled:opacity-20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">{isForging ? 'sync' : 'auto_awesome'}</span>
                                {isForging ? 'FORJANDO...' : 'FORJAR E DISTRIBUIR'}
                            </button>
                        </div>
                    )}
                </section>

                {/* Gestão de Níveis (Novels) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 fill-1 text-xl">shield</span>
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jornada de Evolução</h2>
                        </div>
                        <button 
                            onClick={prepareNewLevel}
                            className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {levels.map((lv) => (
                            <div key={lv.level_number} className="bg-slate-900/40 p-5 rounded-[2.5rem] border border-white/5 flex items-center gap-4 relative group">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl flex items-center justify-center border border-white/10 shrink-0">
                                    <span className="material-symbols-outlined text-4xl text-blue-400 font-black">{lv.shield_icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-sm text-white">{lv.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 opacity-60">
                                            <span className="material-symbols-outlined text-[10px]">bolt</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{lv.xp_required} XP</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-60">
                                            <span className="material-symbols-outlined text-[10px]">monetization_on</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{lv.coins_required} MOEDAS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setNewLevel(lv); setIsAddingLevel(true); }}
                                        className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:bg-white/10"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteLevel(lv.level_number)}
                                        className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 active:scale-90 transition-all hover:bg-red-500/20"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Modal de Criação/Edição de Nível */}
            {isAddingLevel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-pop-in">
                    <div className="w-full max-w-sm bg-slate-900 rounded-[3rem] p-8 border border-white/10 shadow-2xl space-y-6 overflow-y-auto max-h-[85vh]">
                        <h2 className="text-xl font-black text-center text-amber-500">Configurar Patamar</h2>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Nível</label>
                                <input 
                                    type="text" 
                                    value={newLevel.title}
                                    onChange={(e) => setNewLevel({...newLevel, title: e.target.value})}
                                    className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500"
                                    placeholder="Ex: Guerreiro Lendário"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta XP</label>
                                    <input 
                                        type="number" 
                                        value={newLevel.xp_required}
                                        onChange={(e) => setNewLevel({...newLevel, xp_required: parseInt(e.target.value)})}
                                        className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta Moedas</label>
                                    <input 
                                        type="number" 
                                        value={newLevel.coins_required}
                                        onChange={(e) => setNewLevel({...newLevel, coins_required: parseInt(e.target.value)})}
                                        className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Escolher Escudo</label>
                                <div className="grid grid-cols-5 gap-2 bg-slate-800/50 p-4 rounded-3xl">
                                    {SHIELD_OPTIONS.map(icon => (
                                        <button 
                                            key={icon}
                                            onClick={() => setNewLevel({...newLevel, shield_icon: icon})}
                                            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${newLevel.shield_icon === icon ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => setIsAddingLevel(false)}
                                className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => handleSaveLevel(newLevel)}
                                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-500/20 active-press"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouncilRoom;
