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
app.get('/add', addSelection);
app.get('/church/:id', getSingleChurch);
app.get('/pastor/:id', getSinglePastor);
app.post('/new-church', addChurch);
app.post('/new-pastor', addPastor);
app.delete('/church/:id', deleteRecord);
app.delete('/pastor/:id', deleteRecord);
app.put('/pastor/:id', updateRecord);
// app.put('/church/:id', updateRecord);

app.get('*', (request, response) => response.status(404).send(
  '<body style="background-color: black; display: flex; flex-direction: row; justify-content: center; align-content: center;"><img style="height: 50vw;" src="https://miro.medium.com/max/1081/1*VYPlqLaosLszAtKlx5fHzg.jpeg"/></body>'));
  
  
  function getSingleChurch(request, response) {
    let SQL = 'SELECT * FROM churches WHERE id=$1;';
    let values = [request.params.id];
    client.query(SQL, values)
    .then(result => response.render('pages/show_single_church', { church: result.rows[0]}))
    .catch(err => handleError(err, response));
  }
  
  function getSinglePastor(request, response) {
    getChurchList()
    .then(churches => {
      let SQL = 'SELECT pastors.*, churches.name, churches.location FROM pastors INNER JOIN churches on pastors.church_id = churches.id WHERE pastors.id=$1;';
      let values = [request.params.id];
      client.query(SQL, values)
      .then(result => {
        let church = churches.rows.find(church => church.id ===parseInt(result.rows[0].church_id));
        
        response.render('pages/show_single_pastor', { pastor: result.rows[0], churches: churches.rows, church: church})
      })
      .catch(err => handleError(err, response));
    })
    .catch(err => handleError(err, response));
  }
  
  // Turn the server On
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  
  // HELPER FUNCTIONS
  
  // Pastors Constructor
  function Pastor(input) {
    const lineBreak = '\r\n\r\n';
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
  function Church(input, map) {
    const lineBreak = '\r\n\r\n';
    const lineBreakReplacement = ', ';
    this.name = input.name;
    this.map_url = map;
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
  
  function getPath(request,response) {
    let currentPath = request.path
    let regex = /\/(.*?)\//;
    let path = currentPath.match(regex);
    return path[1]
  }
  
  // Retrieve churches from database
  function getChurchList() {
    let SQL = 'SELECT DISTINCT id, name, location FROM churches ORDER BY name;';
    
    return client.query(SQL);
  }
  
  // Home Page
  function homePage(request, response) {
    response.render('pages/index');
  }
  
  // TODO: Can allChurches and allPastors be made into 1 function?
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
  
  function allPastors(request, response) {
    let SQL = 'SELECT pastors.id, pastors.pastor_first_name, pastors.pastor_last_name, pastors.spouse, pastors.pastor_story, pastors.spouse_story, pastors.image_url, pastors.family_marriage, pastors.prayer_needs, pastors.church_id, churches.name, churches.location FROM pastors LEFT JOIN churches ON pastors.church_id = churches.id ORDER BY pastor_last_name ASC;'
    
    return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/add');
      } else {
        console.log('results:', results.rows)
        response.render('pages/all_pastors', { pastors: results.rows })
      }
    })
    .catch(err => handleError(err, response));
  }
  
  function addSelection(request, response) {
    getChurchList()
    .then(churchList => {
      response.render('pages/add', {churchList: churchList.rows});
    })
  }
  
  function addChurch(request, response) {
    
    let map = `https://maps.googleapis.com/maps/api/staticmap?center=${request.body.latitude}%2c%20${request.body.longitude}&zoom=8&size=400x400&markers=size:medium%7Ccolor:BE5347%7C${request.body.latitude},${request.body.longitude}&maptype=hybrid&key=${process.env.GEOCODE_API_KEY}`;
    
    console.log(map)
    
    let church = new Church(request.body, map);
    
    console.log(church)
    
    // let { name, longitude, latitude, location, church_members, sunday_school, pre_school, feeding_program, description, community } = request.body;
    
    let SQL = 'INSERT INTO churches(name, longitude, latitude, map_url, location, church_members, sunday_school, pre_school, feeding_program, description, community) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;'
    
    let values = [church.name, church.longitude, church.latitude, church.map_url, church.location, church.church_members, church.sunday_school, church.pre_school, church.feeding_program, church.description, church.community];
    
    client.query(SQL, values)
    .then(result =>  {
      response.redirect(`/church/${result.rows[0].id}`)
    })
    .catch(err => handleError(err, response));
  }
  
  function addPastor(request, response) {
    let pastor = new Pastor(request.body);
    
    let SQL = 'INSERT INTO pastors (pastor_first_name, pastor_last_name, spouse, pastor_story, spouse_story, image_url, family_marriage, prayer_needs, church_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;'
    
    let values = [pastor.pastor_first_name, pastor.pastor_last_name, pastor.spouse, pastor.pastor_story, pastor.spouse_story, pastor.image_url, pastor.family_marriage, pastor.prayer_needs, pastor.church_id];
    
    client.query(SQL, values)
    .then(result =>  {
      response.redirect(`/pastor/${result.rows[0].id}`)
    })
    .catch(err => handleError(err, response));
  }
  
  // Update a single church or pastor
function updateRecord(request, response) {
  let path = getPath(request, response);
  
  function getQueryInfo () {
    if(path === 'pastor'){
      let pastor = new Pastor(request.body);
      let SQL = `UPDATE pastors SET pastor_first_name=$1, pastor_last_name=$2, spouse=$3, pastor_story=$4, spouse_story=$5, image_url=$6, family_marriage=$7, prayer_needs=$8, church_id=$9 WHERE id=$10;`;
      let pastorUpdate = [pastor, SQL];
      return pastorUpdate;
    // } else if (path === 'church') {
    //     let church = new Church(request.body);
    //     let SQL = 
    //     let churchUpdate = [church, SQL];
    //     return churchUpdate;
    // }
    }
  }
  let updateInfo= getQueryInfo();
  
  let values = [updateInfo[0].pastor_first_name, updateInfo[0].pastor_last_name, updateInfo[0].spouse, updateInfo[0].pastor_story, updateInfo[0].spouse_story, updateInfo[0].image_url, updateInfo[0].family_marriage, updateInfo[0].prayer_needs, updateInfo[0].church_id, request.params.id];
  console.log(client.query(updateInfo[1], values))
  return client.query(updateInfo[1], values)
      .then(response.redirect(`/${path}/${request.params.id}`))
      .catch(err => handleError(err, response));

}
  function deleteRecord(request, response) {
    
    let database = '';
    function getDatabase(path)  {
      if(path === 'church') {
        database = 'churches'
      } else if (path === 'pastor'){
          database = 'pastors'
        }
      return database;
    }

    let current= getDatabase(getPath(request, response))

    let SQL = `DELETE FROM ${current} WHERE id=$1;`;
    console.log(SQL)
    let values = [request.params.id];
    
      return client.query(SQL, values)
        .then(response.redirect(`/all_${current}`))
        .catch(err => handleError(err, response));
  }

  // Error Handlers
  function handleError(error, response) {
    response.render('pages/error', { error: error });
  }