
export default function SectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full px-4 h-full">
      {children}
    </div>
  )
}