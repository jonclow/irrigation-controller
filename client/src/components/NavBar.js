import React from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
// import water_drop from "./assets/water_drop.svg";

function NavBar() {
  let navigate = useNavigate();

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <button onClick={() => navigate('/control')}>Control</button>
        <button onClick={() => navigate('/schedule')}>Schedule</button>
        <button onClick={() => navigate('/weather')}>Weather</button>
      </div>
      <Outlet/>
    </>
  )
}

export default NavBar;
