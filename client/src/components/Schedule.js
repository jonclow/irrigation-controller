import React, {useEffect, useState} from 'react';
import '../css/schedule.css';
import {
  Link,
  Route,
  Switch, useHistory,
  useRouteMatch
} from "react-router-dom";
import EditSchedule from "./EditSchedule";
import AddNewSchedule from "./AddNewSchedule";
import _ from 'lodash';

function Schedule() {

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const { path, url } = useRouteMatch();
  let history = useHistory();

  useEffect(() => {
    setIsLoaded(false);

    fetch('/schedule/getAllSchedules', { method: 'GET' })
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
          history.push('/schedule');
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
        <table>
          <thead>
          <tr>
            <th>Active</th>
            <th>Name</th>
            <th>Start</th>
            <th>Days</th>
            <th>Valves</th>
            <th>Duration</th>
            <th>Edit</th>
          </tr>
          </thead>
          <tbody>
          {schedules.map((schedule) => (
            <tr>
              <td>{schedule.active ? <span>&#x2714;</span> : 'X'}</td>
              <td>{schedule.name}</td>
              <td>{schedule.start}</td>
              <td>{schedule.days}</td>
              <td>{schedule.valves}</td>
              <td>{schedule.duration}</td>
              <td><Link to={`${url}/${schedule.id}`}>Edit</Link></td>
            </tr>
          ))}
          </tbody>
        </table>

        <button>
          <Link to={`${url}/new`}>Add New</Link>
        </button>
        <button onClick={deleteAllSchedules}>Clear All</button>

        <Switch>
          <Route exact path={`${path}/new`}>
            <AddNewSchedule
              handleScheduleSaveClick={handleScheduleSaveClick}
            />
          </Route>
          <Route path={`${path}/:scheduleID`}>
            <EditSchedule
              deleteSchedule={handleDeleteScheduleClick}
              handleScheduleSaveClick={handleScheduleSaveClick}
              currentSchedules={schedules}
            />
          </Route>
        </Switch>

      </div>
    );
  }

}

export default Schedule;
