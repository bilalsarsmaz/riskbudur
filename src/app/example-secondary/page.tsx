import SecondaryLayout from "@/components/SecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";

/**
 * Example page using SecondaryLayout (S + MR)
 * This demonstrates the wide 2-column layout.
 */
export default function ExampleSecondaryPage() {
    return (
        <SecondaryLayout maxWidth="1000px">
            <GlobalHeader title="Geniş Sayfa Örneği" subtitle="SecondaryLayout kullanımı" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>
                    SecondaryLayout Örneği
                </h1>

                <div className="space-y-4" style={{ color: 'var(--app-body-text)' }}>
                    <p>
                        Bu sayfa <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--app-surface)' }}>SecondaryLayout</code> kullanıyor.
                    </p>

                    <div className="border border-theme-border rounded-lg p-4" style={{ backgroundColor: 'var(--app-surface)' }}>
                        <h2 className="font-bold mb-2">Layout Yapısı:</h2>
                        <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--app-subtitle)' }}>
                            <li>Sol Sidebar: 88px (md) → 275px (xl)</li>
                            <li>Geniş İçerik: max 1000px (özelleştirilebilir)</li>
                            <li>Sağ Sidebar YOK = Daha fazla alan</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="border border-theme-border rounded-lg p-4 text-center"
                                style={{ backgroundColor: 'var(--app-surface)' }}
                            >
                                <div className="text-4xl mb-2">📦</div>
                                <p className="font-bold">Kart {i}</p>
                                <p className="text-sm" style={{ color: 'var(--app-subtitle)' }}>
                                    Geniş alana sığan içerik
                                </p>
                            </div>
                        ))}
                    </div>

                    <p style={{ color: 'var(--app-subtitle)' }}>
                        Bu layout, dashboard, tablo veya galeri görünümleri için ideal.
                    </p>
                </div>
            </div>
        </SecondaryLayout>
    );
}
