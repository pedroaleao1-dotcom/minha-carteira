
import React, { useState, useRef } from 'react';
import { Dream } from '../types';

interface Props {
    onAdd: (dream: Omit<Dream, 'id' | 'currentAmount'>) => void;
    onBack: () => void;
}

const DREAM_ICONS = ['rocket_launch', 'pedal_bike', 'sports_esports', 'toys', 'auto_stories', 'brush', 'pets', 'star'];

const AddDream: React.FC<Props> = ({ onAdd, onBack }) => {
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState(100);
    const [icon, setIcon] = useState('rocket_launch');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const handleAdd = () => {
        if (!title) return;
        onAdd({
            title,
            targetAmount,
            icon,
            imageUrl: photo || `https://picsum.photos/seed/${title}/400/300`
        });
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
                    {/* Background Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2b8cee]/10 blur-3xl rounded-full"></div>

                    {/* Foto do Sonho */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Foto do seu Sonho 📸</label>
                        <div className="relative aspect-square w-full max-w-[200px] mx-auto bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg group">
                            {photo ? (
                                <div className="relative w-full h-full">
                                    <img src={photo} className="w-full h-full object-cover" alt="Sonho" />
                                    <button 
                                        onClick={() => setPhoto(null)}
                                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-90"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ) : isCameraOpen ? (
                                <div className="w-full h-full relative">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <button 
                                        onClick={takePhoto}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white w-14 h-14 rounded-full border-4 border-[#2b8cee] flex items-center justify-center shadow-xl active:scale-90"
                                    >
                                        <span className="material-symbols-outlined text-[#2b8cee] text-3xl">photo_camera</span>
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={startCamera}
                                    className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 hover:text-[#2b8cee] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-6xl">add_a_photo</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ver o Sonho</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">O que você quer?</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Uma prancha de surf!"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-slate-800 outline-none focus:border-[#2b8cee] transition-colors shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Quanto você acha que custa?</label>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="20" 
                                    max="1000" 
                                    step="20"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                                    className="flex-1 h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#2b8cee] border border-slate-200"
                                />
                                <div className="bg-amber-100 px-5 py-3 rounded-2xl flex items-center gap-1 border border-amber-200 shadow-sm shrink-0">
                                    <span className="material-symbols-outlined text-amber-500 fill-1">monetization_on</span>
                                    <span className="font-black text-amber-600 text-lg">{targetAmount}</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-center text-slate-400 font-bold italic">Arraste para definir o valor em moedas mágicas!</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ícone da Categoria</label>
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
                </div>

                <button 
                    disabled={!title}
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
