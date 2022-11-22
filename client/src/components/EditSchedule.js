import { useHistory, useParams } from "react-router-dom";
import { useRef } from "react";

function EditSchedule(props) {
  const formRef = useRef(null);
  let history = useHistory();
  let { scheduleID } = useParams();
  scheduleID = parseInt(scheduleID, 10);

  const currentSchedule = props.currentSchedules.find(sched => sched.id === scheduleID);

  const cancelUpdate = () => {
    history.push('/schedule');
  }

  const deleteSchedule = async () => {
    props.deleteSchedule(scheduleID);
    history.push('/schedule');
  }

  return (
    <div>
      <form className="schedule-editor" ref={formRef} onSubmit={props.handleScheduleSaveClick}>
        <h2>Schedule</h2>

        <label htmlFor={'id'}>Schedule ID</label>
        <input id={'id'} name={'id'} type={'number'} value={scheduleID} readOnly={true}/>

        <label htmlFor={'name'}>Schedule name</label>
        <input
          id={'name'}
          name={'schedule_name'}
          type={'text'}
          defaultValue={currentSchedule.name}
          required
        />

        <label htmlFor={'start'}>Select the irrigation starting time</label>
        <input type={'time'} id={'start'} name={'start_time'} defaultValue={currentSchedule.start} required={true}/>

        <label htmlFor="days">Select the day(s) for watering:</label>
        <select id="days" name="selected_days" defaultValue={currentSchedule.days} multiple>
          <option value="1">Mon</option>
          <option value="2">Tues</option>
          <option value="3">Wed</option>
          <option value="4">Thurs</option>
          <option value="5">Fri</option>
          <option value="6">Sat</option>
          <option value="0">Sun</option>
        </select>

        <select name="selected_valves" defaultValue={currentSchedule.valves} multiple>
          <option value="1">Tunnel House</option>
          <option value="2">Garden</option>
          <option value="3">Herbs</option>
          <option value="4">Orchard</option>
        </select>

        <select name="duration" defaultValue={currentSchedule.duration}>
          <option value="20">20 Mins</option>
          <option value="30">30 Mins</option>
          <option value="40">40 Mins</option>
          <option value="50">50 Mins</option>
          <option value="60">60 Mins</option>
        </select>

        <fieldset>
          <input type="radio" id="enabled" name="active" value={'active'} defaultChecked={currentSchedule.active}/>
          <label htmlFor="enabled">Active</label>

          <input type="radio" id="disabled" name="active" value={'inactive'} defaultChecked={!currentSchedule.active} />
          <label htmlFor="disabled">Not Active</label>
        </fieldset>

        <button type="submit">Update</button>
      </form>

      <button onClick={deleteSchedule}>Delete This Schedule</button>
      <button onClick={cancelUpdate}>Cancel</button>
    </div>
  );
}

export default EditSchedule;
