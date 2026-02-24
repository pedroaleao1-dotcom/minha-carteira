
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { getMasterTip } from '../services/gemini';
import HistoryView from '../components/HistoryView';

interface Props {
    child: Member;
    onBack: () => void;
}

const Wallet: React.FC<Props> = ({ child, onBack }) => {
    const [tip, setTip] = useState<string>("Carregando dica do Mestre...");

    useEffect(() => {
        getMasterTip("Como economizar moedas para grandes sonhos").then(setTip);
    }, []);

    return (
        <HistoryView 
            title="Meu Tesouro"
            icon="monetization_on"
            colorClass="amber"
            balance={child.coins}
            balanceLabel="Moedas Mágicas"
            transactions={child.history}
            onBack={onBack}
            tip={tip}
        />
    );
};

export default Wallet;
