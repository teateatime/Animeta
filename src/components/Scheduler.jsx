import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  WeekView,
  Appointments,
  Toolbar,
  ViewSwitcher,
  MonthView,
  AppointmentTooltip,
  TodayButton,
  DateNavigator,
} from '@devexpress/dx-react-scheduler-material-ui';
import Header from './Header';
import { firebase, firestore } from '../firebase';
import './styles/Scheduler.css';

function PlannerList() {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  const [user, setUser] = useState(null);
  const [schedulerData, setSchedulerData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      console.log("Auth state changed:", authUser);
      if (authUser) {
        setUser(authUser);
        loadSchedulerData(authUser.uid);
      } else {
        setUser(null);
        setSchedulerData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSchedulerData = (userId) => {
    console.log("Loading scheduler data for user:", userId);
    if (userId) {
      firestore
        .collection('users')
        .doc(userId)
        .collection('schedule')
        .get()
        .then((querySnapshot) => {
          const data = [];
          querySnapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
            data.push(doc.data());
          });
          console.log("Loaded scheduler data:", data);
          setSchedulerData(data);
        })
        .catch((error) => {
          console.error('Error loading scheduler data:', error);
        });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const date = formData.get('date');
    const time = formData.get('time');
    const endTime = formData.get('EndTime');
    
    if (!title || !date || !time || !endTime) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    const newSchedulerItem = {
      startDate: date + 'T' + time,
      endDate: date + 'T' + endTime,
      title: title,
    };
    
    if (user) {
      firestore
        .collection('users')
        .doc(user.uid)
        .collection('schedule')
        .add(newSchedulerItem)
        .then(() => {
          loadSchedulerData(user.uid);
          setErrorMessage('');
          event.target.reset(); // Clear the form
        })
        .catch((error) => {
          console.error('Error adding scheduler data:', error);
        });
    }
  };

  // Calculate currentDate based on the current date
  const currentDate = new Date(year, month - 1, day);

  return (
    <div>
      <Header />
      <div style={{padding: '10px', margin: '5px'}}>
        <Typography variant="h4" className='scheduler-title' style={{ textAlign: 'center' }}>
          Scheduler
        </Typography>
        <div className='scheduler-container'>
          <div className='form-container'>
            <Paper className='scheduler-form-wrapper' style={{ padding: '1rem' }}>
              <Typography variant="h4" style={{ textAlign: 'center' }}>
                Event Form
              </Typography>
              {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
              <Form className='scheduler-form' onSubmit={handleSubmit} />
            </Paper>
          </div>
          <div className='scheduler-paper'>
            <Paper>
              <Scheduler data={schedulerData} height={660}>
                <ViewState defaultCurrentDate={currentDate} />
                <DayView startDayHour={0} endDayHour={24} />
                <WeekView startDayHour={0} endDayHour={24} />
                <MonthView startDayHour={0} endDayHour={24} />
                <Toolbar />
                <DateNavigator />
                <TodayButton />
                <ViewSwitcher />
                <Appointments />
                <AppointmentTooltip
                  showDeleteButton
                  showOpenButton
                  showCloseButton
                />
              </Scheduler>
            </Paper>
          </div>
        </div>
      </div>
    </div>
  );
}

function Form(props) {
  return (
    <form onSubmit={props.onSubmit}>
      <Typography variant="subtitle1">Title:</Typography>
      <input type="text" id="title" name="title" /><br /><br />

      <Typography variant="subtitle1">Date:</Typography>
      <input type="date" id="date" name="date" /><br /><br />

      <Typography variant="subtitle1">Start Time:</Typography>
      <input type="time" id="time" name="time" /><br /><br />

      <Typography variant="subtitle1">End Time:</Typography>
      <input type="time" id="EndTime" name="EndTime" /><br /><br />

      <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </Grid>
    </form>
  );
}

export default PlannerList;
