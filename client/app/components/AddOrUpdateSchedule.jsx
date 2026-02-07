import { useNavigate, useParams } from "react-router";
import { useRef, useEffect, useState } from "react";

function AddOrUpdateSchedule({ currentSchedules, handleScheduleSaveClick, deleteSchedule }) {
  const formRef = useRef(null);
  let navigate = useNavigate();
  let { scheduleID } = useParams();

  scheduleID = scheduleID === 'new' ? scheduleID : parseInt(scheduleID, 10);
  const currentSchedule = currentSchedules.find(sched => sched.id === scheduleID) || {};

  // State for multi-select checkboxes
  const [selectedDays, setSelectedDays] = useState(currentSchedule.days || []);
  const [selectedValves, setSelectedValves] = useState(currentSchedule.valves || []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleDay = (dayValue) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const toggleValve = (valveValue) => {
    setSelectedValves(prev =>
      prev.includes(valveValue)
        ? prev.filter(v => v !== valveValue)
        : [...prev, valveValue]
    );
  };

  const days = [
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
    { value: 0, label: 'Sun', fullLabel: 'Sunday' }
  ];

  const valves = [
    { value: 1, label: 'Tunnel House' },
    { value: 2, label: 'Garden' },
    { value: 3, label: 'Herbs' },
    { value: 4, label: 'Orchard' }
  ];

  const cancelNewOrUpdate = () => {
    navigate('/schedule');
  }

  const deleteScheduleClick = async () => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule(scheduleID);
      navigate('/schedule');
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
    letterSpacing: '-0.01em'
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        onClick={cancelNewOrUpdate}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Modal Container */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 51,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)',
            borderRadius: '20px',
            padding: 'clamp(24px, 5vw, 32px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            animation: 'fadeInUp 0.4s ease-out'
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: '800',
              paddingBottom: '4px',
              background: 'linear-gradient(135deg, var(--color-sun), var(--color-water-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {scheduleID === 'new' ? 'New Schedule' : 'Edit Schedule'}
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontSize: '14px'
            }}>
              {scheduleID === 'new' ? 'Create a new irrigation schedule' : 'Update schedule settings'}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleScheduleSaveClick}>
            <input id={'id'} name={'id'} value={scheduleID} hidden={true} readOnly={true}/>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={'name'} style={labelStyle}>Schedule Name</label>
              <input
                id={'name'}
                name={'schedule_name'}
                type={'text'}
                defaultValue={currentSchedule.name}
                required
                placeholder="e.g., Morning Garden"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-sun)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label htmlFor={'start'} style={labelStyle}>Start Time</label>
                <input
                  id={'start'}
                  name={'start_time'}
                  type={'time'}
                  defaultValue={currentSchedule.start}
                  required
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-water)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              <div>
                <label htmlFor="duration" style={labelStyle}>Duration</label>
                <select
                  name="duration"
                  defaultValue={currentSchedule.duration}
                  required
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-water)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="40">40 Minutes</option>
                  <option value="50">50 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Days of Week</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '10px'
              }}>
                {days.map(day => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <label
                      key={day.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 8px',
                        borderRadius: '10px',
                        background: isSelected
                          ? 'rgba(6, 182, 212, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected
                          ? '2px solid var(--color-water)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? 'var(--color-water-light)' : 'var(--color-text-secondary)',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        name="selected_days"
                        value={day.value}
                        checked={isSelected}
                        onChange={() => toggleDay(day.value)}
                        style={{ display: 'none' }}
                      />
                      <span>{day.label}</span>
                    </label>
                  );
                })}
              </div>
              {selectedDays.length === 0 && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#f87171',
                  fontFamily: 'var(--font-body)'
                }}>
                  Please select at least one day
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Irrigation Areas</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px'
              }}>
                {valves.map(valve => {
                  const isSelected = selectedValves.includes(valve.value);
                  return (
                    <label
                      key={valve.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 12px',
                        borderRadius: '10px',
                        background: isSelected
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected
                          ? '2px solid var(--color-growth)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? 'var(--color-growth)' : 'var(--color-text-secondary)',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        name="selected_valves"
                        value={valve.value}
                        checked={isSelected}
                        onChange={() => toggleValve(valve.value)}
                        style={{ display: 'none' }}
                      />
                      <span>{valve.label}</span>
                    </label>
                  );
                })}
              </div>
              {selectedValves.length === 0 && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#f87171',
                  fontFamily: 'var(--font-body)'
                }}>
                  Please select at least one irrigation area
                </p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  flex: 1
                }}>
                  <input
                    type="radio"
                    id="enabled"
                    name="active"
                    value={'active'}
                    defaultChecked={scheduleID === 'new' || currentSchedule.active}
                    style={{ accentColor: 'var(--color-sun)' }}
                  />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--color-sun)'
                  }}>Active</span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  flex: 1
                }}>
                  <input
                    type="radio"
                    id="disabled"
                    name="active"
                    value={'inactive'}
                    defaultChecked={scheduleID !== 'new' && !currentSchedule.active}
                    style={{ accentColor: 'var(--color-text-muted)' }}
                  />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--color-text-muted)'
                  }}>Inactive</span>
                </label>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              flexWrap: 'wrap'
            }}>
              <button
                type="submit"
                style={{
                  flex: '1 1 auto',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--color-sun), #d97706)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                {scheduleID === 'new' ? 'Create Schedule' : 'Save Changes'}
              </button>

              {scheduleID !== 'new' && (
                <button
                  type="button"
                  onClick={deleteScheduleClick}
                  style={{
                    flex: '0 1 auto',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#f87171',
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                onClick={cancelNewOrUpdate}
                style={{
                  flex: '0 1 auto',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddOrUpdateSchedule;
