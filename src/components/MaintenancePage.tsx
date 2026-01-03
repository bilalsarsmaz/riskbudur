"use client";



export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: 'var(--app-body-bg)', color: 'var(--app-body-text)' }}>
            <div className="w-16 h-16 flex items-center justify-center mb-6 animate-pulse">
                <img src="/riskbudurlogo.png" alt="RiskBudur Logo" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Bakımdayız</h1>
            <p className="text-[var(--app-subtitle)] max-w-md mb-8 text-lg">
                RiskBudur şu anda planlı bakım çalışması nedeniyle kısa bir süreliğine hizmet verememektedir. <br />En kısa sürede geri döneceğiz!
            </p>



            <p className="mt-12 text-sm opacity-50 text-[var(--app-subtitle)]">
                &copy; {new Date().getFullYear()} RiskBudur.net | Tüm hakları saklıdır.
            </p>
        </div>
    );
}
