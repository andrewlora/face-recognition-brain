const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const morgan = require('morgan');

//require('dotenv').config({ path: ['.env.local', '.env'] });

const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');

//Database Setup
const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI,
});

const app = express();

// const whitelist = ['http://localhost:3001'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log('origin:', origin, 'not allowed');
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

app.use(morgan('combined'));
//app.use(cors(corsOptions));
app.use(express.json()); // latest version of expressJS now comes with Body-Parser!

const PORT = 3000;

app.get('/', (req, res) => {
  db.select('*')
    .from('users')
    .then((data) => {
      console.log('database info:', data);
      res.send(data);
    });
});

app.post('/signIn', signIn.signInAuthentication(db, bcrypt));
app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});
app.get('/profile/:id', auth.requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});
app.post('/profile/:id', auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});
app.put('/image', auth.requireAuth, (req, res) => {
  image.handleImage(req, res, db);
});
app.post('/imageUrl', auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.listen(PORT, () => {
  console.log('app is running on port ' + PORT);
});
