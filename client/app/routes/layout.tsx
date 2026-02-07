import { Outlet, useNavigate } from "react-router";
import Footer from "~/components/Footer";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <>
      <div className="pb-16 w-full max-w-full overflow-x-hidden">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          <button
            onClick={() => navigate('/')}
            className="h-12 sm:h-14 rounded-2xl font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: 'var(--color-water-light)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2)',
            }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/control')}
            className="h-12 sm:h-14 rounded-2xl font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--color-growth)',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
            }}
          >
            Control
          </button>
          <button
            onClick={() => navigate('/schedule')}
            className="h-12 sm:h-14 rounded-2xl font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--color-sun)',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)',
            }}
          >
            Schedule
          </button>
          <button
            onClick={() => navigate('/weather')}
            className="h-12 sm:h-14 rounded-2xl font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(163, 137, 91, 0.15) 0%, rgba(120, 100, 65, 0.1) 100%)',
              border: '1px solid rgba(163, 137, 91, 0.3)',
              color: 'var(--color-earth-light)',
              boxShadow: '0 4px 16px rgba(163, 137, 91, 0.2)',
            }}
          >
            Weather
          </button>
        </nav>
        <Outlet />
        <Footer />
      </div>
    </>
  );
}
