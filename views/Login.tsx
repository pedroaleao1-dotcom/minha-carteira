import React, { useState } from 'react';
import { signIn } from '../services/auth';

interface Props {
    onLoginSuccess: (userId: string) => void;
}

const Login: React.FC<Props> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const data = await signIn(email, password);
            if (data.user) {
                onLoginSuccess(data.user.id);
            }
        } catch (err: any) {
            setErrorMsg(err?.message || 'Erro ao fazer login. Verifique seu e-mail e senha.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen bg-slate-50">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-amber-400 animate-float">
                <span className="material-symbols-outlined text-amber-400 text-4xl font-black fill-1">key</span>
            </div>

            <h1 className="text-3xl font-black text-slate-800 text-center leading-tight mb-2">
                Bem-vindo ao
            </h1>
            <h2 className="text-4xl font-black text-pink-500 text-center leading-tight mb-8 drop-shadow-sm">
                DreamQuest
            </h2>

            <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-4">
                {errorMsg && (
                    <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl text-sm font-bold border-2 border-red-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">error</span>
                        {errorMsg}
                    </div>
                )}
                
                <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold ml-2 text-xs uppercase tracking-widest">E-mail Mágico</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-14 bg-white rounded-2xl px-5 border-2 border-slate-100 focus:border-pink-300 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-slate-700" 
                        placeholder="seu@email.com"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold ml-2 text-xs uppercase tracking-widest">Senha Secreta</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-14 bg-white rounded-2xl pl-5 pr-12 border-2 border-slate-100 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 outline-none transition-all font-bold tracking-widest text-slate-700" 
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`h-14 mt-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                        isLoading || !email || !password ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-pink-500 text-white shadow-pink-200/50 hover:bg-pink-600'
                    }`}
                >
                    {isLoading ? (
                        <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                    ) : (
                        <>
                            Entrar no Reino
                            <span className="material-symbols-outlined text-xl">login</span>
                        </>
                    )}
                </button>
            </form>

            <p className="mt-12 text-center text-xs text-slate-400 font-bold">
                Aventura protegida pelos Guardiões.
            </p>
        </div>
    );
};

export default Login;
