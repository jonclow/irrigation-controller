import React, { useEffect, useState } from 'react';
import '../../app/css/base.css';
import DurationSlider from './DurationSlider';
import Valve from './Valve';
import {useLoaderData} from "react-router-dom";

function Control({ socket }) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [valves, setValves] = useState([]);
  const [duration, setDuration] = useState(10);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const valve_data = useLoaderData();

  socket.on('valve-update', (update) => {
    setValves(update);
  });

  useEffect(() => {
    setValves(valve_data);
  }, [valve_data]);

  const toggleValveClick = (id) => {
    setIsLoaded(false);

    fetch(`${BASE_URL}/valve/toggleValve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        duration: duration,
      })
    })
      .then(res => res.json())
      .then(
        (result) => {
          setValves(result);
          setIsLoaded(true);
        },
        (error) => {
          setError(error);
          setIsLoaded(true);
        }
      );
  }

  const durationSliderChange = (e) => setDuration(e.target.value);

  const renderValveControl = (value) => {
    return (
      <Valve
        key={value.id}
        name={value.name}
        status={value.status}
        onClick={() => toggleValveClick(value.id)}
      />
    );
  }

  if (error) {
    return (<div>Error: {error.message}</div>);
  } else if (!isLoaded) {
    return (<div>Loading...</div>);
  } else {
    return (
      <>
        <div className="w-6/6 mx-5 mt-5">
          <div>
            <DurationSlider onChange={durationSliderChange} duration={duration} />
            <div className={'grid grid-cols-2 xs:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4'}>
              {valves.map((value) => renderValveControl(value))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Control;
