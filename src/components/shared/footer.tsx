export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-400 px-4 py-4 md:px-8 lg:px-16 xl:px-25 xl:py-6">
      <p className="jt-muted text-sm">
        © {new Date().getFullYear()} Ruxera Digital
      </p>
    </footer>
  );
}
