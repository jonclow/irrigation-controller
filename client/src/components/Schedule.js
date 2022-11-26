import React, {useEffect, useState} from 'react';
import '../css/schedule.css';
import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import _ from 'lodash';
import AddOrUpdateSchedule from "./AddOrUpdateSchedule";

function Schedule() {

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [valves, setValves] = useState([]);

  let navigate = useNavigate();
  const valveConfig = _.zipObject(_.map(valves, 'id'), _.map(valves, 'name'));
  const daysOfWeek = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  };

  useEffect(() => {
    setIsLoaded(false);

    fetch('/schedule/getAllSchedules')
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setSchedules(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );

    fetch('/valve/getValveState')
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setValves(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }, []);

  const handleScheduleSaveClick = (event) => {
    event.preventDefault();
    setIsLoaded(false);
    const data = new FormData(event.target);

    fetch('/schedule/setSchedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.get('id') === 'new' ? 'new' : parseInt(data.get('id')),
        schedule: {
          active: data.get('active') === 'active',
          name: data.get('schedule_name'),
          start: data.get('start_time'),
          days: _.map(data.getAll('selected_days'), (d) => parseInt(d, 10)),
          valves: _.map(data.getAll('selected_valves'), (v) => parseInt(v, 10)),
          duration: parseInt(data.get('duration'), 10)
       },
     }),
    })
      .then(res => res.json())
      .then(
        (res) => {
          setIsLoaded(true);
          setSchedules(res);
          navigate('/schedule');
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }

  const deleteAllSchedules = () => {
    setIsLoaded(false);

    fetch('/schedule/deleteAllSchedules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setSchedules(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }

  const handleDeleteScheduleClick = (id) => {
    setIsLoaded(false);

    fetch('/schedule/deleteSchedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
      })
    })
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setSchedules(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>

        <table className="table-auto border-separate w-5/6 overflow-visible ml-20 my-5">
          <thead>
          <tr>
            <th className="bg-slate-400 border border-slate-600">Active</th>
            <th className="bg-slate-400 border border-slate-600">Name</th>
            <th className="bg-slate-400 border border-slate-600">Start</th>
            <th className="bg-slate-400 border border-slate-600">Days</th>
            <th className="bg-slate-400 border border-slate-600">Valves</th>
            <th className="bg-slate-400 border border-slate-600">Duration</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="border border-slate-700">{schedule.active ? <span>&#x2714;</span> : 'X'}</td>
              <td className="border border-slate-700">{schedule.name}</td>
              <td className="border border-slate-700">{schedule.start}</td>
              <td className="border border-slate-700">{_.map(schedule.days, (dayInt) => daysOfWeek[dayInt]).join(', ')}</td>
              <td className="border border-slate-700">{_.map(schedule.valves, (valveID) => valveConfig[valveID]).join(', ')}</td>
              <td className="border border-slate-700">{schedule.duration}</td>
              <td className="border border-slate-600 bg-slate-400 hover:bg-slate-600"><button><Link to={`${schedule.id}`}>Edit</Link></button></td>
            </tr>
          ))}
          <tr key={'new'}>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td className="border border-slate-600 bg-slate-400 hover:bg-slate-600"><Link to={'new'}><span>&#10133;</span></Link></td>
          </tr>
          </tbody>
        </table>

        <button onClick={deleteAllSchedules} className="block ml-20 w-1/6 mt-5 rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700 bg-red-600/75 hover:bg-red-600">Clear All</button>

        <Routes>
          <Route path={'/:scheduleID'} element={
            <AddOrUpdateSchedule
              deleteSchedule={handleDeleteScheduleClick}
              handleScheduleSaveClick={handleScheduleSaveClick}
              currentSchedules={schedules}
            />}
          />
        </Routes>

      </div>
    );
  }

}

export default Schedule;
