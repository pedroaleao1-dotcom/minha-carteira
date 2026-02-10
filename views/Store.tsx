
import React, { useState } from 'react';
import { StoreItem, Redemption } from '../types';

interface Props {
    coins: number;
    storeItems: StoreItem[];
    redemptions: Redemption[];
    onBuy: (item: StoreItem) => void;
    onBack: () => void;
}

const Store: React.FC<Props> = ({ coins, storeItems, redemptions, onBuy, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = storeItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col p-6">
            <header className="flex items-center justify-between mb-6 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Loja de Prêmios</h1>
                <div className="bg-white rounded-full px-4 py-1.5 shadow-md flex items-center gap-2 border border-slate-100">
                    <span className="material-symbols-outlined text-amber-400 text-sm fill-1">monetization_on</span>
                    <span className="text-sm font-black text-slate-800">{coins}</span>
                </div>
            </header>

            {/* Barra de Busca Mágica */}
            <div className="relative mb-8 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#2b8cee] transition-colors">search</span>
                </div>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Procurar prêmio..."
                    className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] py-4 pl-12 pr-4 font-bold text-slate-800 outline-none focus:border-[#2b8cee] shadow-sm transition-all placeholder:text-slate-300"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-500"
                    >
                        <span className="material-symbols-outlined text-lg">cancel</span>
                    </button>
                )}
            </div>

            <main className="space-y-8 pb-12 overflow-y-auto">
                {/* Seção de Pratos Pedidos - Só aparece se não houver busca ativa para focar nos itens */}
                {!searchQuery && redemptions.filter(r => r.status === 'pending').length > 0 && (
                    <section>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Aguardando Entrega 🎁</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {redemptions.filter(r => r.status === 'pending').map(red => (
                                <div key={red.id} className="min-w-[140px] bg-emerald-50 rounded-3xl p-4 border-2 border-emerald-100 flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm animate-pulse">
                                        <span className="material-symbols-outlined text-2xl">{red.icon}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 text-center uppercase leading-tight">{red.title}</span>
                                    <span className="text-[8px] text-emerald-400 font-bold uppercase">Fale com seus pais!</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="grid grid-cols-2 gap-4">
                    {filteredItems.map(item => {
                        const isDisabled = coins < item.price;
                        return (
                            <button 
                                key={item.id}
                                disabled={isDisabled}
                                onClick={() => onBuy(item)}
                                className={`bg-white rounded-[2.5rem] p-6 flex flex-col items-center border-2 border-white shadow-xl active:scale-95 transition-all animate-pop-in ${isDisabled ? 'opacity-50 grayscale' : 'hover:border-[#2b8cee]'}`}
                            >
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 transform transition-transform group-hover:rotate-6`}>
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </div>
                                <h3 className="font-black text-slate-800 text-[11px] mb-1 text-center uppercase leading-tight h-6 flex items-center">{item.title}</h3>
                                <div className="flex items-center gap-1 mt-auto">
                                    <span className="material-symbols-outlined text-amber-500 text-[10px] fill-1">monetization_on</span>
                                    <span className="text-xs font-black text-amber-600">{item.price}</span>
                                </div>
                                <div className={`mt-4 w-full py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isDisabled ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-md'}`}>
                                    {isDisabled ? 'Faltam Moedas' : 'Resgatar'}
                                </div>
                            </button>
                        );
                    })}
                </section>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 opacity-30 flex flex-col items-center animate-pop-in">
                        <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                        <p className="font-black uppercase tracking-widest text-xs">Nenhum prêmio encontrado</p>
                        <p className="text-[10px] font-bold mt-2 px-8">Tente procurar por outro nome ou peça para seus pais criarem algo novo!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Store;
