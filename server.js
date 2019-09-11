'use strict';

// Manage Application Environment Variables
require('dotenv').config();

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// Application Setup
const app = express();
const PORT = process.env.PORT;

// Database Client Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Handle HTML Form PUT/DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// // API Routes
app.get('/', homePage);
app.get('/all_churches', allChurches);
app.get('/all_pastors', allPastors);
app.get('/all_meetings', allMeetings);
app.get('/add', addSelection);
app.get('/church/:id', getSingleChurch);
app.get('/pastor/:id', getSinglePastor);
app.get('/meeting/:id', getSingleMeeting);
app.post('/new-church', addChurch);
app.post('/new-pastor', addPastor);
app.post('/new-minutes', addMinutes);
app.delete('/church/:id', deleteRecord);
app.delete('/pastor/:id', deleteRecord);
app.delete('/meeting/:id', deleteRecord);
app.put('/pastor/edit/:id', updateRecord);
app.put('/church/edit/:id', updateRecord);

// app.get('*', (request, response) => response.status(404).send(
//   '<body style="background-color: black; display: flex; flex-direction: row; justify-content: center; align-content: center;"><img style="height: 50vw;" src="https://miro.medium.com/max/1081/1*VYPlqLaosLszAtKlx5fHzg.jpeg"/></body>'));

  app.get('*', (request, response) => response.status(404).render(response.render('pages/404')));

function getSingleChurch(request, response) {
  let SQL = 'SELECT * FROM churches WHERE id=$1;';
  let values = [request.params.id];
  client.query(SQL, values)
    .then(result => {
      response.render('pages/show_single_church', { church: result.rows[0] })
    })
    .catch(err => handleError(err, response));
}

function getSinglePastor(request, response) {
  getChurchList()
    .then(churches => {
      let SQL = 'SELECT pastors.*, churches.name, churches.location FROM pastors INNER JOIN churches on pastors.church_id = churches.id WHERE pastors.id=$1;';
      let values = [request.params.id];
      client.query(SQL, values)
        .then(result => {
          let church = churches.rows.find(church => church.id === parseInt(result.rows[0].church_id));

          response.render('pages/show_single_pastor', { pastor: result.rows[0], churches: churches.rows, church: church })
        })
        .catch(err => handleError(err, response));
    })
    .catch(err => handleError(err, response));
}

function getSingleMeeting(request, response) {
  getChurchesWithPastors()
  .then(churchPastorData => {
    let SQL = 'SELECT * FROM meetings WHERE id=$1;';
    let values = [request.params.id];
    client.query(SQL, values)
      .then(result => {
        response.render('pages/show_single_meeting', { meeting: result.rows[0], churchPastorData: churchPastorData.rows, churchReports: result.rows[0].church_reports.church_reports})
      })
      .catch(err => handleError(err, response));
  })
    .catch(err => handleError(err, response));
}
// Turn the server On
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS

function getPrayerArray(obj) {
  let allPrayerRequests = [];
  for (const key of Object.keys(obj)) {
    if(key.includes('prayer_requests')) {
      let tempArray = obj[key]
      allPrayerRequests.push(tempArray)
    }
  }
  return allPrayerRequests;
}
// function whenHour (hour) {
//   // console.log (typeof hour)
//   // console.log(hour);
//   if(hour >= 12) {
//     return 'PM'
//   } else {
//     return 'AM'
//   }
// }; 

// function formatMinutes (minutes) {
//   console.log(typeof minutes)
//   console.log(minutes)
//   if(minutes < 10) {
//     return `0${minutes}`
//   } else {
//     return minutes
//   }
// };

// function formatHours (hour) {
//   if(hour < 10) {
//     return `0${hour}`
//   } else {
//     return hour
//   }
// }; 

// function formatTime (input) {
//   let t = new Date(input);
//   let hour = t.getHours();
//   let min = t.getMinutes();
//   console.log(t, 'time')
//   console.log(hour, 'hour')
//   console.log(min, 'min')
//   let timeOfDay = whenHour(hour);
//   let formattedTime = `${formatHours(hour)}:${formatMinutes(min)} ${timeOfDay}`
//   console.log(formatMinutes)
//   return formattedTime;
// }

function dayOfWeek (input) {
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let dayOfTheWeek = days[new Date(input).getDay()]

  return dayOfTheWeek;
}

function formatDate (input) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let month = months[new Date(input).getMonth()];
  let day = new Date(input).getDate();
  let year = new Date(input).getFullYear();

  let formattedDate = `${month} ${day}, ${year}`
  return formattedDate;
}

function formatReports(input) {
  let churchReportsArray = [];

  console.log(input)

  for(let i = 0 ; i < input.church_id.length; i++) {
    const lineBreak = /\r\n\r\n/g;
    const lineBreakReplacement = ', ';
    input.church_id[i] = {
      church_id: input.church_id[i],
      church_name: input.church_name[i],
      church_pastor: input.church_pastor[i],
      report: '{' + input.report[i].replace(lineBreak, lineBreakReplacement) + '}',
      prayerRequests: getPrayerArray(input)[i]
    }
    churchReportsArray.push(input.church_id[i])
  }
  return churchReportsArray;
}

//Meeting Minutes Constructor
function Minutes(input) {
  let startJSON = '{"church_reports":';
  let endJSON = '}';
  const lineBreak = /\r\n\r\n/g;
  const lineBreakReplacement = ', ';
  this.date = input.date;
  this.formatted_date = formatDate(input.date),
  this.day = dayOfWeek(input.date);
  this.start_time = input.start_time;
  this.end_time = input.end_time;
  this.venue = input.venue;
  this.meeting_host = input.meeting_host;
  this.presiding_officer = input.presiding_officer;
  this.agenda = '{' + input.agenda.replace(lineBreak, lineBreakReplacement) + '}';
  this.minutes_taken_by = input.minutes_taken_by;
  this.attendees = input.attendees;
  this.opening_prayer_by = input.opening_prayer_by;
  this.gods_message_by = input.gods_message_by;
  this.general_notes = input.general_notes;
  this.church_reports = startJSON + JSON.stringify(formatReports(input)) + endJSON;
  this.other_matters = input.other_matters;
  this.next_meeting = input.next_meeting;
  this.next_meeting_formatted = formatDate(input.next_meeting);
  this.next_meeting_day = dayOfWeek(input.next_meeting);
  this.next_time = input.next_time;
  this.next_location = input.next_location;
  this.next_location_host = input.next_location_host;
  this.closing_prayer_by = input.closing_prayer_by;
}

// TODO: find a way to escape "" in text input
// Pastors Constructor
function Pastor(input) {
  const lineBreak = /\r\n\r\n/g;
  const lineBreakReplacement = ', ';
  this.pastor_first_name = input.pastor_first_name;
  this.pastor_last_name = input.pastor_last_name;
  this.spouse = input.spouse;
  this.pastor_story = '{' + input.pastor_story.replace(lineBreak, lineBreakReplacement) + '}';
  this.spouse_story = '{' + input.spouse_story.replace(lineBreak, lineBreakReplacement) + '}';
  this.image_url = input.image_url;
  this.family_marriage = '{' + input.family_marriage.replace(lineBreak, lineBreakReplacement) + '}';
  this.prayer_needs = '{' + input.prayer_needs.replace(lineBreak, lineBreakReplacement) + '}';
  this.church_id = input.church_id;
}

// Churches Constructor
function Church(input) {
  const lineBreak = '\r\n\r\n';
  const lineBreakReplacement = /, /g;
  this.name = input.name;
  this.map_url = `https://maps.googleapis.com/maps/api/staticmap?center=${input.latitude}%2c%20${input.longitude}&zoom=8&size=400x400&markers=size:medium%7Ccolor:BE5347%7C${input.latitude},${input.longitude}&maptype=hybrid&key=${process.env.GEOCODE_API_KEY}`;
  this.longitude = input.longitude;
  this.latitude = input.latitude;
  this.location = input.location;
  this.church_members = input.church_members;
  this.sunday_school = input.sunday_school;
  this.pre_school = input.pre_school;
  this.feeding_program = input.feeding_program;
  this.description = '{' + input.description.replace(lineBreak, lineBreakReplacement) + '}';
  this.community = '{' + input.community.replace(lineBreak, lineBreakReplacement) + '}';
}

function getPath(request, response) {
  let currentPath = request.path
  // console.log(currentPath);
  let regex = /\/(.*?)\//;
  let path = currentPath.match(regex);
  return path[1]
}

// Retrieve churches from database
function getChurchList() {
  let SQL = 'SELECT DISTINCT id, name, location FROM churches ORDER BY name;';

  return client.query(SQL);
}

//Retrieve pastors plus churches from database

function getChurchesWithPastors() {
  let SQL = 'SELECT pastors.pastor_first_name, pastors.pastor_last_name, pastors.church_id, churches.name, churches.location FROM pastors INNER JOIN churches on pastors.church_id = churches.id;';

  return client.query(SQL);
}

// Home Page
function homePage(request, response) {
  response.render('pages/index');
}

// TODO: Can allChurches, allMeetings, and allPastors be made into 1 function?
function allChurches(request, response) {
  let SQL = 'SELECT * FROM churches ORDER BY name ASC;'
  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/add');
      } else {
        response.render('pages/all_churches', { churches: results.rows })
      }
    })
    .catch(err => handleError(err, response));
}

//TODO: create a helper function for the months and days to be used by the meeting minutes functionality (and possibly budget)
function allMeetings(request, response) {
  let SQL = 'SELECT * FROM meetings ORDER BY id ASC;'
  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/add');
      } else {
        response.render('pages/all_meetings', { meetings: results.rows})
      }
    })
    .catch(err => handleError(err, response));
}

function allPastors(request, response) {
  let SQL = 'SELECT pastors.id, pastors.pastor_first_name, pastors.pastor_last_name, pastors.spouse, pastors.pastor_story, pastors.spouse_story, pastors.image_url, pastors.family_marriage, pastors.prayer_needs, pastors.church_id, churches.name, churches.location FROM pastors LEFT JOIN churches ON pastors.church_id = churches.id ORDER BY pastor_last_name ASC;'

  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/add');
      } else {
        response.render('pages/all_pastors', { pastors: results.rows })
      }
    })
    .catch(err => handleError(err, response));
}

function addSelection(request, response) {

  getChurchList()
  .then(result => {
    getChurchesWithPastors()
      .then(churchList => {
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        response.render('pages/add', { churchList: churchList.rows, distinctChurches: result.rows });
      }) 
      .catch(err => handleError(err, response));
  })
  .catch(err => handleError(err, response));
}

function addChurch(request, response) {

  let church = new Church(request.body);

  let SQL = 'INSERT INTO churches(name, longitude, latitude, map_url, location, church_members, sunday_school, pre_school, feeding_program, description, community) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;'

  let values = [church.name, church.longitude, church.latitude, church.map_url, church.location, church.church_members, church.sunday_school, church.pre_school, church.feeding_program, church.description, church.community];

  client.query(SQL, values)
    .then(result => {
      response.redirect(`/church/${result.rows[0].id}`)
    })
    .catch(err => handleError(err, response));
}

function addPastor(request, response) {
  let pastor = new Pastor(request.body);

  let SQL = 'INSERT INTO pastors (pastor_first_name, pastor_last_name, spouse, pastor_story, spouse_story, image_url, family_marriage, prayer_needs, church_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;'

  let values = [pastor.pastor_first_name, pastor.pastor_last_name, pastor.spouse, pastor.pastor_story, pastor.spouse_story, pastor.image_url, pastor.family_marriage, pastor.prayer_needs, pastor.church_id];

  client.query(SQL, values)
    .then(result => {
      response.redirect(`/pastor/${result.rows[0].id}`)
    })
    .catch(err => handleError(err, response));
}

function addMinutes(request, response) {
  console.log(request, 'new minutes')
  let minutes = new Minutes(request.body);
  console.log(minutes, "what does reports looks like?")

  let SQL = 'INSERT INTO meetings (date, day, formatted_date, start_time, end_time, venue, meeting_host, presiding_officer, agenda, minutes_taken_by, attendees, opening_prayer_by, gods_message_by, general_notes, church_reports, other_matters, next_meeting, next_meeting_formatted, next_meeting_day, next_time, next_location, next_location_host, closing_prayer_by) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING id;';

  let values = [minutes.date, minutes.day, minutes.formatted_date, minutes.start_time, minutes.end_time, minutes.venue, minutes.meeting_host, minutes.presiding_officer, minutes.agenda, minutes.minutes_taken_by, minutes.attendees, minutes.opening_prayer_by, minutes.gods_message_by, minutes.general_notes, minutes.church_reports, minutes.other_matters, minutes.next_meeting, minutes.next_meeting_formatted, minutes.next_meeting_day, minutes.next_time, minutes.next_location, minutes.next_location_host, minutes.closing_prayer_by];

  client.query(SQL, values)
    .then(result => {
        // console.log(result.rows[0].id, "result");
      response.redirect(`/meeting/${result.rows[0].id}`)
    })
    .catch(err => handleError(err, response));
}

// Update a single church or pastor
function updateRecord(request, response) {
  let path = getPath(request, response);
  function getQueryInfo() {
    if (path === 'pastor') {
      let pastor = new Pastor(request.body);
      let SQL = `UPDATE pastors SET pastor_first_name=$1, pastor_last_name=$2, spouse=$3, pastor_story=$4, spouse_story=$5, image_url=$6, family_marriage=$7, prayer_needs=$8, church_id=$9 WHERE id=$10;`;

      let values = [pastor.pastor_first_name, pastor.pastor_last_name, pastor.spouse, pastor.pastor_story, pastor.spouse_story, pastor.image_url, pastor.family_marriage, pastor.prayer_needs, pastor.church_id, request.params.id];

      let pastorUpdate = [pastor, SQL, values];
      return pastorUpdate;

    } else if (path === 'church') {

      let church = new Church(request.body);
      let SQL = `UPDATE churches SET name=$1, map_url=$2, longitude=$3, latitude=$4, location=$5, church_members=$6, sunday_school=$7, pre_school=$8, feeding_program=$9, description=$10, community=$11 WHERE id=$12;`;

      let values = [church.name, church.map_url, church.longitude, church.latitude, church.location, church.church_members, church.sunday_school, church.pre_school, church.feeding_program, church.description, church.community, request.params.id];

      let churchUpdate = [church, SQL, values];
      return churchUpdate;
    }
  }
  let updateInfo = getQueryInfo();


  return client.query(updateInfo[1], updateInfo[2])
    .then(response.redirect(`/${path}/${request.params.id}`))
    .catch(err => handleError(err, response));
}

// }
function deleteRecord(request, response) {
  function getDatabase(path) {
    if (path === 'church') {
      database = 'churches';
    } else if (path === 'pastor') {
      database = 'pastors';
    } else if (path === 'meeting') {
      database = 'meetings';
    }
    return database;
  }
  let database = '';

  let current = getDatabase(getPath(request, response))

  let SQL = `DELETE FROM ${current} WHERE id=$1;`;
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(response.redirect(`/all_${current}`))
    .catch(err => handleError(err, response));
}

// Error Handlers
function handleError(error, response) {
  response.render('pages/error', { error: error });
}