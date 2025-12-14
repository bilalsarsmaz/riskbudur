import StandardPageLayout from "@/components/StandardPageLayout";
import GlobalHeader from "@/components/GlobalHeader";

/**
 * Example page using StandardPageLayout (S + M + R)
 * This demonstrates the standard 3-column layout.
 */
export default function ExampleStandardPage() {
    return (
        <StandardPageLayout>
            <GlobalHeader title="Örnek Sayfa" subtitle="StandardPageLayout kullanımı" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>
                    StandardPageLayout Örneği
                </h1>

                <div className="space-y-4" style={{ color: 'var(--app-body-text)' }}>
                    <p>
                        Bu sayfa <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--app-surface)' }}>StandardPageLayout</code> kullanıyor.
                    </p>

                    <div className="border border-theme-border rounded-lg p-4" style={{ backgroundColor: 'var(--app-surface)' }}>
                        <h2 className="font-bold mb-2">Layout Yapısı:</h2>
                        <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--app-subtitle)' }}>
                            <li>Sol Sidebar: 88px (md) → 275px (xl)</li>
                            <li>Orta İçerik: max 600px</li>
                            <li>Sağ Sidebar: 350px (lg+)</li>
                        </ul>
                    </div>

                    <p style={{ color: 'var(--app-subtitle)' }}>
                        Mobile görünümde sidebar'lar gizlenir ve alt navbar aktif olur.
                    </p>
                </div>
            </div>
        </StandardPageLayout>
    );
}
