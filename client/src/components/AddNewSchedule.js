import { useHistory } from "react-router-dom";
import { useRef } from "react";

const AddNewSchedule = (props) => {
  const formRef = useRef(null);
  let history = useHistory();

  const cancelAddNew = () => {
    history.push('/schedule');
  }

  return (
    <div>
      <form ref={formRef} className="schedule-editor" onSubmit={props.handleScheduleSaveClick}>
        <h2>Schedule </h2>

        <label htmlFor={'id'}>Schedule ID</label>
        <input id={'id'} name={'id'} value={'new'} readOnly={true}/>

        <input
          id={'name'}
          name={'schedule_name'}
          type={'text'}
          required
          placeholder="Schedule Name"
        />

        <label htmlFor={'start'}>Select the irrigation starting time</label>
        <input type={'time'} id={'start'} name={'start_time'} required={true}/>

        <label htmlFor={'days'}>Select the day(s) for watering:</label>
        <select id={'days'} name={'selected_days'} multiple>
          <option value="1">Mon</option>
          <option value="2">Tues</option>
          <option value="3">Wed</option>
          <option value="4">Thurs</option>
          <option value="5">Fri</option>
          <option value="6">Sat</option>
          <option value="0">Sun</option>
        </select>

        <select name={'selected_valves'} multiple>
          <option value="1">Tunnel House</option>
          <option value="2">Garden</option>
          <option value="3">Herbs</option>
          <option value="4">Orchard</option>
        </select>

        <select name={'duration'}>
          <option value="20">20 Mins</option>
          <option value="30">30 Mins</option>
          <option value="40">40 Mins</option>
          <option value="50">50 Mins</option>
          <option value="60">60 Mins</option>
        </select>

        <fieldset>
          <input type="radio" id="enabled" name="active" value={'active'} defaultChecked={true}/>
          <label htmlFor="enabled">Active</label>

          <input type="radio" id="disabled" name="active" value={'inactive'}/>
          <label htmlFor="disabled">Not Active</label>
        </fieldset>

        <button type="submit">Add</button>
      </form>

      <button onClick={cancelAddNew}>Cancel</button>
    </div>
  );
}

export default AddNewSchedule;
