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
app.get('/add', addSelection);
app.get('/church/:id', getSingleChurch);
app.post('/new-church', addChurch);
app.post('/new-pastor', addPastor);
// app.post('/searches', createSearch);
// app.get('/searches/new', newSearch);
// app.get('/books/:id', getBook);
// app.post('/books', createBook);
// app.put('/books/:id', updateBook);
// app.delete('/books/:id', deleteBook);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function getSingleChurch(request, response) {
  let SQL = 'SELECT * FROM churches WHERE id=$1;';
      let values = [request.params.id];
      client.query(SQL, values)
        .then(result => response.render('pages/churches/show_single_church', { church: result.rows[0]}))
        .catch(err => handleError(err, response));
}

// Turn the server On
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// // HELPER FUNCTIONS

// // Data Model Constructor
// function Book(info) {
//   const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

//   this.title = info.title ? info.title : 'No title available';
//   this.author = info.authors ? info.authors[0] : 'No author available';
//   this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
//   this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
//   this.description = info.description ? info.description : 'No description available';
// }

// Home Page
function homePage(request, response) {
  response.render('pages/index');
}

function addSelection(request, response) {
  response.render('pages/add');
}

function addChurch(request, response) {
  let { name, longitude, latitude, location, church_members, sunday_school, pre_school, description, community } = request.body;

  let SQL = 'INSERT INTO churches(name, longitude, latitude, location, church_members, sunday_school, pre_school, description, community) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';

  let values = [name, longitude, latitude, location, church_members, sunday_school, pre_school, description, community];

  client.query(SQL, values)
    .then(result =>  response.redirect(`/church/${result.rows[0].id}`))
    .catch(err => handleError(err, response));
}

function addPastor(request, response) {
  
}
// // Load pastors from Database
// function getPastors(request, response) {
//   let SQL = 'SELECT * FROM pastors;';

//   return client.query(SQL)
//     .then(results => {
//       if (results.rows.rowCount === 0) {
//         response.render('pages/searches/new');
//       } else {
//         response.render('pages/index', { pastors: results.rows })
//       }
//     })
//     .catch(err => handleError(err, response));
// }

// // Render Search Form
// function newSearch(request, response) {
//   response.render('pages/searches/new');
// }

// // Get search results from Google Books API
// function createSearch(request, response) {
//   let url = 'https://www.googleapis.com/books/v1/volumes?q=';

//   if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
//   if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

//   superagent.get(url)
//     .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
//     .then(results => response.render('pages/searches/show', { results: results }))
//     .catch(err => handleError(err, response));
// }
// // Retrieve and Render a single book
// function getBook(request, response) {
//   getBookshelves()
//     .then(shelves => {

//       let SQL = 'SELECT books.*, bookshelves.name FROM books INNER JOIN bookshelves on books.bookshelf_id=bookshelves.id WHERE books.id=$1;';
//       let values = [request.params.id];
//       client.query(SQL, values)
//         .then(result => {
//           let shelf = shelves.rows.find(shelf => shelf.id === parseInt(result.rows[0].bookshelf_id));
//           response.render('pages/books/show', { book: result.rows[0], bookshelves: shelves.rows, shelfName: shelf })
//         })
//         .catch(err => handleError(err, response));
//     })
// }

// // Retrieve bookshelves from database
// function getBookshelves() {
//   let SQL = 'SELECT DISTINCT id, name FROM bookshelves ORDER BY name;';

//   return client.query(SQL);
// }

// // Create a new bookshelf
// function createShelf(shelf) {
//   let normalizedShelf = shelf.toUpperCase();
//   let SQL1 = `SELECT id from bookshelves where name=$1;`;
//   let values1 = [normalizedShelf];

//   return client.query(SQL1, values1)
//     .then(results => {
//       if (results.rowCount) {
//         return results.rows[0].id;
//       } else {
//         let INSERT = `INSERT INTO bookshelves(name) VALUES($1) RETURNING id;`;
//         let insertValues = [normalizedShelf];

//         return client.query(INSERT, insertValues)
//           .then(results => {
//             return results.rows[0].id;
//           })
//       }
//     })
// }

// // Create a new book
// function createBook(request, response) {
//   createShelf(request.body.bookshelf)
//     .then(id => {
//       let { title, author, isbn, image_url, description } = request.body;
//       let SQL = 'INSERT INTO books(title, author, isbn, image_url, description, bookshelf_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;';
//       let values = [title, author, isbn, image_url, description, id];

//       client.query(SQL, values)
//         .then(result => response.redirect(`/books/${result.rows[0].id}`))
//         .catch(err => handleError(err, response));
//     })
// }

// // Update a single book
// function updateBook(request, response) {
//   let { title, author, isbn, image_url, description, bookshelf_id } = request.body;
//   let SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf_id=$6 WHERE id=$7;`;
//   let values = [title, author, isbn, image_url, description, bookshelf_id, request.params.id];

//   client.query(SQL, values)
//     .then(response.redirect(`/books/${request.params.id}`))
//     .catch(err => handleError(err, response));
// }

// // Delete a single book
// function deleteBook(request, response) {
//   let SQL = 'DELETE FROM books WHERE id=$1;';
//   let values = [request.params.id];

//   return client.query(SQL, values)
//     .then(response.redirect('/'))
//     .catch(err => handleError(err, response));
// }

// // Error Handlers
// function handleError(error, response) {
//   response.render('pages/error', { error: error });
// }

// Error Handlers
function handleError(error, response) {
  response.render('pages/error', { error: error });
}