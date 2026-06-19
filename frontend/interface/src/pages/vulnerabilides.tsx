

const vulnerabilidades = () => {
    // Dados simulados baseados na imagem
    const cards = [
        {
            title: "TOTAL DE ALERTAS",
            value: 10,
            colorClass: "text-[#22d3ee]", // Cyan
            borderClass: "border-l-4 border-l-[#22d3ee]",
            bgGlow: "shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]",
            icon: (
                <svg className="w-5 h-5 text-[#22d3ee]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
            )
        },
        {
            title: "CRÍTICOS",
            value: 1,
            colorClass: "text-[#fb7185]", // Rose/Coral
            borderClass: "border-l-4 border-l-[#fb7185]",
            bgGlow: "shadow-[inset_0_0_12px_rgba(251,113,133,0.05)]",
            icon: (
                <svg className="w-5 h-5 text-[#fb7185]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                </svg>
            )
        },
        {
            title: "ALTOS",
            value: 1,
            colorClass: "text-[#f97316]", // Orange
            borderClass: "border-l-4 border-l-[#f97316]",
            bgGlow: "shadow-[inset_0_0_12px_rgba(249,115,22,0.05)]",
            icon: (
                <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            title: "MÉDIOS",
            value: 2,
            colorClass: "text-[#fbbf24]", // Amber/Yellow
            borderClass: "border-l-4 border-l-[#fbbf24]",
            bgGlow: "shadow-[inset_0_0_12px_rgba(251,191,36,0.05)]",
            icon: (
                <svg className="w-5 h-5 text-[#fbbf24]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            )
        },
        {
            title: "BAIXOS / SEGUROS",
            value: 6,
            colorClass: "text-[#34d399]", // Emerald
            borderClass: "border-l-4 border-l-[#34d399]",
            bgGlow: "shadow-[inset_0_0_12px_rgba(52,211,153,0.05)]",
            icon: (
                <svg className="w-5 h-5 text-[#34d399]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold tracking-wider uppercase text-slate-300">
                    Painel de Vulnerabilidades
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Status e severidade dos alertas de segurança identificados.
                </p>
            </header>

            {/* Grid dos Cards de Métrica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`bg-[#0d1527] border border-slate-900 ${card.borderClass} ${card.bgGlow} rounded-r-lg p-5 flex flex-col justify-between h-27 hover:border-slate-800 transition-all duration-300`}
                    >
                        {/* Linha superior: Título e Ícone */}
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-400">
                                {card.title}
                            </span>
                            <div className="p-1 rounded bg-slate-950/40 border border-slate-900">
                                {card.icon}
                            </div>
                        </div>

                        {/* Valor numérico principal */}
                        <div className="mt-auto">
                            <span className={`text-4xl font-extrabold tracking-tight ${card.colorClass}`}>
                                {card.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
                {/* Resultado da varredura */}
            <div className="w-full">
            </div>
        </div>
    );
};

export default vulnerabilidades;