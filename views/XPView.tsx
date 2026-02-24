
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { getMasterTip } from '../services/gemini';
import HistoryView from '../components/HistoryView';

interface Props {
    child: Member;
    onBack: () => void;
}

const XPView: React.FC<Props> = ({ child, onBack }) => {
    const [tip, setTip] = useState<string>("Carregando dica do Mestre...");

    useEffect(() => {
        getMasterTip("Como ganhar mais XP e subir de nível rapidamente fazendo tarefas").then(setTip);
    }, []);

    // Filtra o histórico para mostrar apenas ganhos de XP (reward)
    // No nosso sistema, o histórico geral contém transações de moedas.
    // Para XP, vamos simular ou usar os dados reais se disponíveis.
    // O usuário pediu "Dados Estáticos de Demostração" para o histórico genérico.
    const xpTransactions = child.history.filter(tx => tx.type === 'reward').map(tx => ({
        ...tx,
        amount: Math.floor(tx.amount * 1.5), // XP costuma ser maior que moedas
        title: `XP: ${tx.title}`
    }));

    return (
        <HistoryView 
            title="Meu XP"
            icon="bolt"
            colorClass="sky"
            balance={child.xp}
            balanceLabel="Pontos de Experiência"
            transactions={xpTransactions}
            onBack={onBack}
            tip={tip}
        />
    );
};

export default XPView;
