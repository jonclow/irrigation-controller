import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Footer from './Footer';

function NavBar() {
  const navigate = useNavigate();

  return (
    <>
      <div className="pb-10">
        <div className="h-14 grid grid-cols-2 md:grid-cols-4 gap-2 m-5 text-white">
          <button onClick={() => navigate('/')} className="rounded-full bg-slate-600 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">Home</button>
          <button onClick={() => navigate('/control')} className="rounded-full bg-slate-600 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">Control</button>
          <button onClick={() => navigate('/schedule')} className="rounded-full bg-slate-600 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">Schedule</button>
          <button onClick={() => navigate('/weather')} className="rounded-full bg-slate-600 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">Weather</button>
        </div>
        <Outlet />
        <Footer />
      </div>
    </>
  )
}

export default NavBar;
