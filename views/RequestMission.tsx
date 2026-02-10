
import React, { useState, useRef } from 'react';

interface Props {
    onPropose: (proposal: { title: string, icon: string, image?: string }) => void;
    onBack: () => void;
}

const MISSION_ICONS = ['cleaning_services', 'brush', 'menu_book', 'pets', 'eco', 'sports_soccer', 'draw', 'volunteer_activism'];

const RequestMission: React.FC<Props> = ({ onPropose, onBack }) => {
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('cleaning_services');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsCameraOpen(true);
        } catch (err) {
            alert("Câmera não disponível.");
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

    return (
        <div className="flex-1 flex flex-col p-6 bg-blue-50 min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Propor Missão</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-6 flex-1 overflow-y-auto pb-12">
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-white space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">O que você vai fazer?</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Vou limpar o aquário"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-[#2b8cee] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Escolha o Ícone</label>
                        <div className="grid grid-cols-4 gap-2">
                            {MISSION_ICONS.map(i => (
                                <button 
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-slate-50 text-slate-300'}`}
                                >
                                    <span className="material-symbols-outlined">{i}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Foto da Missão (Opcional)</label>
                        <div className="relative aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-200">
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />

                            {photo ? (
                                <div className="relative w-full h-full">
                                    <img src={photo} className="w-full h-full object-cover" alt="Proposta" />
                                    <button 
                                        onClick={() => setPhoto(null)}
                                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ) : isCameraOpen ? (
                                <div className="w-full h-full relative">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <button 
                                        onClick={takePhoto}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white w-14 h-14 rounded-full border-4 border-blue-400 flex items-center justify-center shadow-xl active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-blue-500">photo_camera</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex divide-x divide-slate-200">
                                    <button 
                                        onClick={startCamera}
                                        className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-3xl">photo_camera</span>
                                        <span className="text-[9px] font-black uppercase">Câmera</span>
                                    </button>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-3xl">image</span>
                                        <span className="text-[9px] font-black uppercase">Galeria</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button 
                    disabled={!title}
                    onClick={() => onPropose({ title, icon, image: photo || undefined })}
                    className="w-full bg-[#2b8cee] text-white py-6 rounded-3xl font-black text-xl shadow-[0_8px_0_0_#1a6ac4] active-press disabled:opacity-50 transition-all"
                >
                    ENVIAR PARA OS PAIS 🕊️
                </button>
            </main>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default RequestMission;
