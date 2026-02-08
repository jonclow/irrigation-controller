import React, {useEffect, useState} from 'react';
import '../css/schedule.css';
import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router";
import AddOrUpdateSchedule from "./AddOrUpdateSchedule";
import Toast from "./Toast";
import { apiGet, apiPut, apiDelete } from '../utils/api';

function Schedule() {

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [valves, setValves] = useState([]);
  const [toast, setToast] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  let navigate = useNavigate();
  const valveConfig = Object.fromEntries(valves.map(v => [v.id, v.name]));
  const daysOfWeek = {
    0: 'Su',
    1: 'Mo',
    2: 'Tu',
    3: 'We',
    4: 'Th',
    5: 'Fr',
    6: 'Sa'
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoaded(false);
      setError(null);

      try {
        const [schedulesData, valvesData] = await Promise.all([
          apiGet(`${BASE_URL}/schedule/getAllSchedules`),
          apiGet(`${BASE_URL}/valve/getValveState`)
        ]);

        setSchedules(schedulesData);
        setValves(valvesData);

      } catch (err) {
        console.error('Failed to load schedule data:', err);
        setError(err);
        // Set empty defaults to keep UI functional
        setSchedules([]);
        setValves([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [BASE_URL]);

  const handleScheduleSaveClick = async (event) => {
    event.preventDefault();
    setIsLoaded(false);
    const data = new FormData(event.target);

    try {
      const schedules = await apiPut(`${BASE_URL}/schedule/setSchedule`, {
        id: data.get('id') === 'new' ? 'new' : parseInt(data.get('id')),
        schedule: {
          active: data.get('active') === 'active',
          name: data.get('schedule_name'),
          start: data.get('start_time'),
          days: data.getAll('selected_days').map(d => parseInt(d, 10)),
          valves: data.getAll('selected_valves').map(v => parseInt(v, 10)),
          duration: parseInt(data.get('duration'), 10)
        },
      });

      setSchedules(schedules);
      setIsLoaded(true);
      setToast({ message: 'Schedule saved successfully', type: 'success' });
      navigate('/schedule');

    } catch (error) {
      console.error('Save schedule failed:', error);
      setIsLoaded(true);
      setToast({ message: error.message, type: 'error' });
    }
  }

  const deleteAllSchedules = async () => {
    setIsLoaded(false);

    try {
      const result = await apiDelete(`${BASE_URL}/schedule/deleteAllSchedules`);
      setSchedules(result);
      setIsLoaded(true);
      setToast({ message: 'All schedules deleted', type: 'success' });

    } catch (error) {
      console.error('Delete all schedules failed:', error);
      setIsLoaded(true);
      setToast({ message: error.message, type: 'error' });
    }
  }

  const handleDeleteScheduleClick = async (id) => {
    setIsLoaded(false);

    try {
      const schedules = await apiDelete(`${BASE_URL}/schedule/deleteSchedule`, { id });
      setSchedules(schedules);
      setIsLoaded(true);
      setToast({ message: 'Schedule deleted', type: 'success' });

    } catch (error) {
      console.error('Delete schedule failed:', error);
      setIsLoaded(true);
      setToast({ message: error.message, type: 'error' });
    }
  }

  if (error) {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Connection Error</h2>
        <p>{error.message}</p>
      </div>
    );
  } else if (!isLoaded) {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--color-sun)',
        fontSize: '20px'
      }}>
        Loading schedules...
      </div>
    );
  } else {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: 'clamp(20px, 4vw, 28px)' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 6vw, 42px)',
              fontWeight: '800',
              marginBottom: '6px',
              paddingBottom: '4px',
              background: 'linear-gradient(135deg, var(--color-sun), var(--color-water-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Irrigation Schedule
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}>
              Automated watering programs
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to={'new'}>
              <button style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--color-sun), #d97706)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}>
                <span style={{ fontSize: '18px' }}>+</span> New Schedule
              </button>
            </Link>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(16px, 3vw, 24px)',
          marginBottom: '24px'
        }}>
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              style={{
                background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
                borderRadius: '16px',
                padding: 'clamp(16px, 3vw, 20px)',
                boxShadow: 'var(--shadow-card)',
                border: schedule.active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease',
                animation: 'fadeInUp 0.6s ease-out backwards',
                animationDelay: `${index * 0.1}s`,
                position: 'relative'
              }}
            >
              {schedule.active && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 12px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid var(--color-sun)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-sun)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  ACTIVE
                </div>
              )}

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 3.5vw, 22px)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                marginBottom: '12px',
                letterSpacing: '-0.01em'
              }}>
                {schedule.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 'clamp(20px, 4vw, 28px)',
                    fontWeight: '700',
                    color: 'var(--color-water-light)'
                  }}>
                    {schedule.start}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    color: 'var(--color-text-muted)'
                  }}>
                    for {schedule.duration} mins
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {schedule.days.map(dayInt => (
                    <span key={dayInt} style={{
                      padding: '4px 10px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px',
                      fontSize: 'clamp(11px, 2vw, 12px)',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-water-light)',
                      fontWeight: '600'
                    }}>
                      {daysOfWeek[dayInt]}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {schedule.valves.map(valveID => (
                    <span key={valveID} style={{
                      padding: '4px 10px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      fontSize: 'clamp(11px, 2vw, 12px)',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-growth)',
                      fontWeight: '600'
                    }}>
                      {valveConfig[valveID]}
                    </span>
                  ))}
                </div>
              </div>

              <Link to={`${schedule.id}`}>
                <button style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(13px, 2.5vw, 14px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}>
                  Edit Schedule
                </button>
              </Link>
            </div>
          ))}
        </div>

        {schedules.length > 0 && (
          <button
            onClick={deleteAllSchedules}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2))',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#f87171',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(13px, 2.5vw, 14px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.3))';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2))';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
          >
            Clear All Schedules
          </button>
        )}

        <Routes>
          <Route path={'/:scheduleID'} element={
            <AddOrUpdateSchedule
              deleteSchedule={handleDeleteScheduleClick}
              handleScheduleSaveClick={handleScheduleSaveClick}
              currentSchedules={schedules}
            />}
          />
        </Routes>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

      </div>

      {/* Spacer for fixed footer */}
      <div style={{ height: '60px' }} />
    );
  }

}

export default Schedule;
