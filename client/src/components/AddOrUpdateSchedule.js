import { useHistory, useParams } from "react-router-dom";
import { useRef } from "react";

function AddOrUpdateSchedule({ currentSchedules, handleScheduleSaveClick, deleteSchedule }) {
  const formRef = useRef(null);
  let history = useHistory();
  let { scheduleID } = useParams();

  console.log('----------------------------------    ', scheduleID);

  scheduleID = scheduleID === 'new' ? scheduleID : parseInt(scheduleID, 10);
  const currentSchedule = currentSchedules.find(sched => sched.id === scheduleID) || {};

  const cancelNewOrUpdate = () => {
    history.push('/schedule');
  }

  const deleteScheduleClick = async () => {
    deleteSchedule(scheduleID);
    history.push('/schedule');
  }

  const newOrUpdateConditionalElements = () => {
    return scheduleID === 'new' ? (
      <div>
        <button onClick={cancelNewOrUpdate} className="flex-initial w-24 rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700 bg-slate-600/75 hover:bg-slate-600">Cancel</button>
      </div>
    ) : (
      <div>
        <button onClick={deleteScheduleClick} className="flex-initial w-24 mr-3 rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700 bg-slate-600/75 hover:bg-slate-600">Delete</button>
        <button onClick={cancelNewOrUpdate} className="flex-initial w-24 rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700 bg-slate-600/75 hover:bg-slate-600">Cancel</button>
      </div>
    )
  }

  return (
    <div className="container mx-auto mt-10">
      <form ref={formRef} onSubmit={handleScheduleSaveClick} className="form" >
        <input id={'id'} name={'id'} value={scheduleID} hidden={true} readOnly={true}/>

        <div className="flex mt-2">
            <label htmlFor={'name'} className="flex-none w-24">Name</label>
            <input id={'name'} name={'schedule_name'} type={'text'} defaultValue={currentSchedule.name} required className=" flex-initial w-64 form-input" />
        </div>

        <div className="flex mt-2">
          <label htmlFor={'start'} className="flex-none w-24">Start time</label>
          <input id={'start'} name={'start_time'} type={'time'}  defaultValue={currentSchedule.start} required={true} className="flex-initial w-64 form-input"/>
        </div>

        <div className="flex mt-2">
          <label htmlFor="duration" className="flex-none w-24">Duration:</label>
          <select name="duration" defaultValue={currentSchedule.duration} required={true} className="flex-initial w-64 form-select">
            <option value="20">20 Mins</option>
            <option value="30">30 Mins</option>
            <option value="40">40 Mins</option>
            <option value="50">50 Mins</option>
            <option value="60">60 Mins</option>
          </select>
        </div>

        <div className="flex mt-2">
          <label htmlFor="days" className="flex-none w-24">Day(s):</label>
          <select id="days" name="selected_days" defaultValue={currentSchedule.days} required={true} multiple className="flex-initial w-64 h-48 form-multiselect">
            <option value="1">Mon</option>
            <option value="2">Tues</option>
            <option value="3">Wed</option>
            <option value="4">Thurs</option>
            <option value="5">Fri</option>
            <option value="6">Sat</option>
            <option value="0">Sun</option>
          </select>
        </div>

        <div className="flex mt-2">
          <label htmlFor="selected_valves" className="flex-none w-24">Area(s):</label>
          <select name="selected_valves" defaultValue={currentSchedule.valves} required={true} multiple className="flex-initial w-64 form-multiselect">
            <option value="1">Tunnel House</option>
            <option value="2">Garden</option>
            <option value="3">Herbs</option>
            <option value="4">Orchard</option>
          </select>
        </div>

        <fieldset className="mt-3 w-48">
          <label htmlFor="enabled" className="mr-2">Active</label>
          <input type="radio" id="enabled" name="active" value={'active'} defaultChecked={scheduleID === 'new' || currentSchedule.active} className="form-radio"/>

          <label htmlFor="disabled" className="ml-5 mr-2">Not Active</label>
          <input type="radio" id="disabled" name="active" value={'inactive'} defaultChecked={scheduleID !== 'new' && !currentSchedule.active} className="form-radio"/>
        </fieldset>

        <div className="flex mt-3">
          <button type="submit" className="flex-initial mx-3 w-24 rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700 bg-slate-600/75 hover:bg-slate-600">{scheduleID === 'new' ? 'Add New' : 'Update'}</button>
          {newOrUpdateConditionalElements()}
        </div>
      </form>
    </div>
  );
}

export default AddOrUpdateSchedule;
