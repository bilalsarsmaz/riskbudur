// Auth check only layout
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Only provides a boundary for potential efficient data fetching or contexts
    // Actual visual layout is now handled by the pages themselves
    return <>{children}</>;
}
