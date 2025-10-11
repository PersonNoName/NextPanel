
export default function SectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="container mx-auto px-4 h-full">
      {children}
    </div>
  )
}