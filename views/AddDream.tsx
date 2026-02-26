
import React, { useState, useRef } from 'react';
import { Dream, Member } from '../types';
import { generateDreamImage } from '../services/gemini';

interface Props {
    members?: Member[];
    onAdd: (dream: Omit<Dream, 'id' | 'currentAmount'>, memberIds: string[]) => void;
    onBack: () => void;
}

const DREAM_ICONS = ['rocket_launch', 'pedal_bike', 'sports_esports', 'toys', 'auto_stories', 'brush', 'pets', 'star'];

const AddDream: React.FC<Props> = ({ members, onAdd, onBack }) => {
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState(100);
    const [totalXpTarget, setTotalXpTarget] = useState(500);
    const [icon, setIcon] = useState('rocket_launch');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsCameraOpen(true);
        } catch (err) {
            alert("Câmera não disponível ou permissão negada.");
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx?.drawImage(videoRef.current, 0, 0);
            setPhoto(canvasRef.current.toDataURL('image/jpeg'));
            stopCamera();
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateAI = async () => {
        if (!title.trim()) {
            alert("Escreva o nome do seu sonho primeiro!");
            return;
        }
        setIsGenerating(true);
        try {
            const imageUrl = await generateDreamImage(title);
            if (imageUrl) {
                setPhoto(imageUrl);
            } else {
                alert("Ops! A magia falhou um pouco. Tente novamente!");
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
            alert("Não conseguimos gerar a imagem agora. Tente novamente em alguns instantes!");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAdd = () => {
        if (!title) return;
        onAdd({
            title,
            targetAmount,
            totalXpTarget,
            icon,
            imageUrl: photo || `https://picsum.photos/seed/${title}/400/300`,
            status: 'active',
            updatedAt: Date.now()
        }, selectedMemberIds);
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Novo Sonho</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-6 flex-1 overflow-y-auto pb-12">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-white space-y-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2b8cee]/10 blur-3xl rounded-full"></div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Foto do seu Sonho 📸</label>
                        <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg group">
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />

                            {isGenerating && (
                                <div className="absolute inset-0 z-20 bg-blue-500/90 flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-sm animate-pop-in">
                                    <span className="material-symbols-outlined text-5xl animate-spin mb-4">auto_awesome</span>
                                    <p className="font-black uppercase tracking-widest text-[10px] animate-pulse">Invocando Magia...</p>
                                </div>
                            )}

                            {photo ? (
                                <div className="relative w-full h-full animate-pop-in">
                                    <img src={photo} className="w-full h-full object-cover" alt="Sonho" />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button 
                                            onClick={handleGenerateAI}
                                            className="bg-white/90 backdrop-blur-sm text-[#2b8cee] w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border border-blue-100"
                                            title="Regerar com IA"
                                        >
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                        </button>
                                        <button 
                                            onClick={() => setPhoto(null)}
                                            className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ) : isCameraOpen ? (
                                <div className="w-full h-full relative">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <button 
                                        onClick={takePhoto}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white w-14 h-14 rounded-full border-4 border-[#2b8cee] flex items-center justify-center shadow-xl active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[#2b8cee] text-3xl">photo_camera</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col">
                                    <button 
                                        onClick={handleGenerateAI}
                                        className="flex-[1.5] flex flex-col items-center justify-center bg-gradient-to-br from-[#2b8cee] to-purple-600 text-white gap-2 transition-all hover:brightness-110 active:scale-95 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-white/10 animate-shimmer skew-x-[-20deg]"></div>
                                        <span className="material-symbols-outlined text-4xl animate-float">auto_awesome</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">IA Mágica</span>
                                    </button>
                                    <div className="flex-1 flex divide-x divide-slate-200">
                                        <button 
                                            onClick={startCamera}
                                            className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-1 hover:text-[#2b8cee] transition-colors hover:bg-white"
                                        >
                                            <span className="material-symbols-outlined text-2xl">photo_camera</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Câmera</span>
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-1 hover:text-purple-500 transition-colors hover:bg-white"
                                        >
                                            <span className="material-symbols-outlined text-2xl">image</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Galeria</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">O que você quer?</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Uma prancha de surf!"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 pr-16 font-black text-slate-800 outline-none focus:border-[#2b8cee] transition-colors shadow-inner"
                            />
                            {title.trim() && !photo && !isGenerating && (
                                <button 
                                    onClick={handleGenerateAI}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-[#2b8cee] to-purple-600 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-all animate-pop-in"
                                    title="Gerar imagem com IA"
                                >
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Moedas Alvo</label>
                            <div className="bg-amber-100 px-4 py-3 rounded-2xl flex items-center gap-2 border border-amber-200 shadow-sm">
                                <span className="material-symbols-outlined text-amber-500 fill-1 text-sm">monetization_on</span>
                                <input 
                                    type="number"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                                    className="bg-transparent font-black text-amber-600 text-sm w-full outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">XP Total</label>
                            <div className="bg-sky-100 px-4 py-3 rounded-2xl flex items-center gap-2 border border-sky-200 shadow-sm">
                                <span className="material-symbols-outlined text-sky-500 fill-1 text-sm">bolt</span>
                                <input 
                                    type="number"
                                    value={totalXpTarget}
                                    onChange={(e) => setTotalXpTarget(Number(e.target.value))}
                                    className="bg-transparent font-black text-sky-600 text-sm w-full outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ícone Mágico</label>
                        <div className="grid grid-cols-4 gap-3">
                            {DREAM_ICONS.map(i => (
                                <button 
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${icon === i ? 'bg-[#2b8cee] text-white shadow-lg scale-110 rotate-3' : 'bg-slate-50 text-slate-300 hover:text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-3xl fill-1">{i}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {members && members.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Para quem é este Sonho? 👥</label>
                            <div className="flex flex-wrap gap-3">
                                {members.filter(m => m.role === 'child').map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => {
                                            setSelectedMemberIds(prev => 
                                                prev.includes(member.id) 
                                                    ? prev.filter(id => id !== member.id)
                                                    : [...prev, member.id]
                                            );
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                                            selectedMemberIds.includes(member.id)
                                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200">
                                            {member.avatar ? (
                                                <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-300 text-[10px] text-white font-bold">
                                                    {member.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{member.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    disabled={!title || isGenerating}
                    onClick={handleAdd}
                    className="w-full bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-[0_8px_0_0_#059669] active-press disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 skew-x-[-20deg] animate-shimmer pointer-events-none"></div>
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span> 
                    PLANTAR SONHO
                </button>
            </main>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default AddDream;
