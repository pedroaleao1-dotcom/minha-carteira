
import React, { useState, useRef, useEffect } from 'react';
import { Member, StoreItem, Transaction } from '../types';

interface Props {
    child: Member;
    storeItems: StoreItem[];
    onNavigate: (view: any) => void;
    onBack: () => void;
    onUpdateAvatar: (newAvatar: string) => void;
    onUpdateNotifications?: (notifications: { tasks: boolean, achievements: boolean }) => void;
    onBuyItem: (item: StoreItem) => void;
    onSellItem: (redemptionId: string) => void;
}

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Junior&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Caspian&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Willow&backgroundColor=ffd5dc',
];

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const Profile: React.FC<Props> = ({ child, storeItems, onNavigate, onBack, onUpdateAvatar, onUpdateNotifications, onBuyItem, onSellItem }) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
    const [xpUpdating, setXpUpdating] = useState(false);
    const [flash, setFlash] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const xpForNextLevel = 500;
    const currentLevelXp = child.xp % xpForNextLevel;
    const xpPercent = (currentLevelXp / xpForNextLevel) * 100;
    
    const completedTasks = child.tasks.filter(t => t.status === 'completed');
    const recentTasks = [...completedTasks].reverse().slice(0, 5);
    const inventory = child.redemptions.filter(r => r.status === 'delivered');
    
    const storeHistory = child.history.filter(tx => tx.type === 'purchase' || tx.type === 'sale').slice(0, 10);

    const notifications = child.notifications || { tasks: true, achievements: true };

    useEffect(() => {
        setXpUpdating(true);
        const timer = setTimeout(() => setXpUpdating(false), 600);
        return () => clearTimeout(timer);
    }, [child.xp]);

    const startCamera = async () => {
        setIsAvatarPickerOpen(false);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setIsCameraOpen(true);
        } catch (err) {
            alert("Câmera não disponível.");
        }
    };

    const stopCamera = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            setFlash(true);
            setTimeout(() => setFlash(false), 150);
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0);
            onUpdateAvatar(canvasRef.current.toDataURL('image/jpeg'));
            stopCamera();
        }
    };

    const toggleNotif = (key: 'tasks' | 'achievements') => {
        if (onUpdateNotifications) {
            onUpdateNotifications({
                ...notifications,
                [key]: !notifications[key]
            });
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen relative pb-12">
            {isCameraOpen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
                    {flash && <div className="absolute inset-0 bg-white z-[110]"></div>}
                    <div className="relative w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-900">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-12 flex items-center gap-10">
                        <button onClick={stopCamera} className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20"><span className="material-symbols-outlined">close</span></button>
                        <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-2xl border-4 border-[#2b8cee]"><span className="material-symbols-outlined text-4xl">photo_camera</span></button>
                    </div>
                </div>
            )}

            {isAvatarPickerOpen && (
                <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setIsAvatarPickerOpen(false)}>
                    <div className="w-full max-w-md bg-white rounded-[3rem] p-8 animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-slate-800 mb-6 text-center">Mudar Visual</h3>
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <button onClick={startCamera} className="aspect-square rounded-3xl bg-blue-500 flex flex-col items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined text-3xl">add_a_photo</span></button>
                            {PRESET_AVATARS.map((url, i) => (
                                <button key={i} onClick={() => { onUpdateAvatar(url); setIsAvatarPickerOpen(false); }} className={`aspect-square rounded-3xl overflow-hidden border-4 ${child.avatar === url ? 'border-blue-500' : 'border-slate-50'}`}><img src={url} className="w-full h-full object-cover" alt="" /></button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between p-6 pt-10">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Perfil do Herói</h1>
                <div className="bg-white rounded-full px-4 py-1.5 shadow-md flex items-center gap-2 border border-slate-100">
                    <span className="material-symbols-outlined text-amber-400 text-sm fill-1">monetization_on</span>
                    <span className="text-sm font-black text-slate-800">{child.coins}</span>
                </div>
            </header>

            <main className="flex-1 p-6 pt-0 overflow-y-auto space-y-8 pb-24">
                <section className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center relative overflow-hidden">
                    <div className="relative mb-6 cursor-pointer group" onClick={() => setIsAvatarPickerOpen(true)}>
                        <div className={`w-32 h-32 rounded-full border-8 border-slate-50 p-1 shadow-inner transition-transform duration-500 ${xpUpdating ? 'scale-110 rotate-12' : ''}`}>
                            <img src={child.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-[#2b8cee] text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-1">{child.name}</h2>
                    <div className="bg-[#2b8cee] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-md">
                        Nível {child.level}
                    </div>
                    <div className="w-full space-y-2">
                        <div className="w-full h-4 bg-slate-100 rounded-full p-1 border border-slate-50 overflow-hidden">
                            <div className="h-full bg-[#2b8cee] rounded-full transition-all duration-1000" style={{ width: `${xpPercent}%` }}></div>
                        </div>
                    </div>
                </section>

                {/* Notificações Mágicas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notificações Mágicas 🔔</h3>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-50 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notifications.tasks ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-300'}`}>
                                    <span className="material-symbols-outlined text-xl">notifications_active</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs">Lembretes de Missões</h4>
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Avisar quando houver tarefas</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleNotif('tasks')}
                                className={`w-12 h-6 rounded-full transition-all relative p-1 ${notifications.tasks ? 'bg-blue-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${notifications.tasks ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notifications.achievements ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300'}`}>
                                    <span className="material-symbols-outlined text-xl">military_tech</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs">Alertas de Medalhas</h4>
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Comemorar novas conquistas</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleNotif('achievements')}
                                className={`w-12 h-6 rounded-full transition-all relative p-1 ${notifications.achievements ? 'bg-amber-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${notifications.achievements ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Meus Itens ({inventory.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {inventory.length === 0 ? (
                            <div className="col-span-2 py-8 bg-white/40 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-2">
                                <span className="material-symbols-outlined">inventory_2</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Vazio</span>
                            </div>
                        ) : (
                            inventory.map(item => {
                                const originalItem = storeItems.find(si => si.id === item.itemId);
                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                        <span className="text-[9px] font-black text-slate-800 text-center uppercase truncate w-full">{item.title}</span>
                                        <div className="flex gap-2 w-full">
                                            <button onClick={() => originalItem && onBuyItem(originalItem)} className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-[8px] font-black uppercase active:scale-95 transition-all">Buy</button>
                                            <button onClick={() => onSellItem(item.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-[8px] font-black uppercase active:scale-95 transition-all">Sell</button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Histórico da Loja 🛒</h3>
                    </div>
                    
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-50 space-y-4">
                        {storeHistory.length === 0 ? (
                            <p className="py-4 text-center text-[10px] font-black uppercase text-slate-300">Nenhuma compra ou venda ainda.</p>
                        ) : (
                            storeHistory.map(tx => (
                                <div key={tx.id} className="flex items-center gap-4 group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'purchase' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-500'}`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {tx.type === 'purchase' ? 'shopping_bag' : 'payments'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-xs leading-tight truncate">{tx.title}</h4>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{formatDate(tx.timestamp)}</p>
                                    </div>
                                    <div className={`text-right font-black text-sm whitespace-nowrap ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount} 💰
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Missões Concluídas</h3>
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-50 space-y-4">
                        {recentTasks.length === 0 ? (
                            <p className="py-4 text-center text-[10px] font-black uppercase text-slate-400">Nenhuma missão concluída.</p>
                        ) : (
                            recentTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                        <span className="material-symbols-outlined text-xl">{task.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-xs leading-tight truncate">{task.title}</h4>
                                    </div>
                                    <div className="text-emerald-500 font-black text-sm">+{task.reward}💰</div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default Profile;
