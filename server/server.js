const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config({ path: ['.env.local', '.env'] });
console.log(process.env);
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var corsOptions = {
  origin: 'http://localhost:' + process.env.NODE_DOCKER_PORT,
};

app.use(cors(corsOptions));
app.use(cors());
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const PORT = process.env.NODE_DOCKER_PORT || 8080;

app.get('/', (req, res) => {
  knex
    .select('*')
    .from('users')
    .then((data) => {
      console.log('database info:', data);
      res.send(data);
    });
});
app.post('/signIn', (req, res) => {
  res.status(400).json('Error logging in');
});

app.post('/register', (req, res) => {
  const { email, name } = req.body;
  knex('users')
    .returning('*')
    .insert({
      name: name,
      email: email,
      joined: new Date(),
    })
    .then((user) => {
      res.json(user[0]);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json('Unable to register');
    });
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  console.log('/profile/', id);
  knex('users')
    .where('id', id)
    .then((user) => {
      if (user?.length) {
        res.json(user[0]);
      }
      res.status(404).json('not found user');
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json('Error getting user');
    });
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  knex('users')
    .where('id', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      console.log(entries);
      res.json(entries[0]);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json('Unable to get entries');
    });
});

app.listen(PORT, () => {
  console.log('app is running on port ' + PORT);
});
