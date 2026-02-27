
import React, { useState } from 'react';

interface Props {
    onLogin: () => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
    const [email, setEmail] = useState('mestre@dreamquest.com');
    const [password, setPassword] = useState('Mestre123!');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const VALID_USERS = [
        { email: 'mestre@dreamquest.com', password: 'Mestre123!' },
        { email: 'arthur@dreamquest.com', password: 'Arthur123!' },
        { email: 'alice@dreamquest.com', password: 'Alice123!' },
        { email: 'bob@dreamquest.com', password: 'Bob123!' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const user = VALID_USERS.find(u => u.email === email && u.password === password);
            
            if (user) {
                onLogin();
            } else {
                setError('Credenciais mágicas incorretas! Tente novamente.');
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-sky-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-sm z-10 animate-pop-in">
                <div className="flex flex-col items-center mb-12">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-6 border-4 border-sky-400 rotate-3 animate-float">
                        <span className="material-symbols-outlined text-sky-500 text-4xl font-black fill-1">rocket_launch</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight text-center">
                        DreamQuest <span className="text-sky-500">Kids</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Aventura em Família</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 shadow-xl border-2 border-white space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">E-mail da Família</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">mail</span>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="familia@exemplo.com"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-sky-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Senha Mágica</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">lock</span>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-sky-400 transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">{error}</p>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_6px_0_0_#0ea5e9] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin">sync</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">login</span>
                                Entrar no Reino
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-sky-500 transition-colors">
                        Esqueceu a senha?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
