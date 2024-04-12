const express = require('express');
const cors = require('cors');
const knex = require('knex');
const morgan = require('morgan');

//require('dotenv').config({ path: ['.env.local', '.env'] });

const {
  handleProfileGet,
  handleProfileUpdate,
} = require('./controllers/profile');
const { handleImage, handleApiCall } = require('./controllers/image');
const {
  signInAuthentication,
  handleRegister,
  requireAuth,
} = require('./controllers/authorization');

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
app.post('/signIn', signInAuthentication(db));
app.post('/register', (req, res) => handleRegister(req, res, db));
app.get('/profile/:id', requireAuth, (req, res) =>
  handleProfileGet(req, res, db),
);
app.post('/profile/:id', requireAuth, (req, res) =>
  handleProfileUpdate(req, res, db),
);
app.put('/image', requireAuth, (req, res) => handleImage(req, res, db));
app.post('/imageUrl', requireAuth, (req, res) => handleApiCall(req, res));

app.listen(PORT, () => {
  console.log('app is running on port ' + PORT);
});
