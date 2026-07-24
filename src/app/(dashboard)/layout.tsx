
// use for Admin Sidebar & Header Navigation Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return(
    <>
    <div>
        {children}
    </div>
    </>
  )
}
