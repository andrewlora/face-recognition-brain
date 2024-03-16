const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
const PORT = 3001;
const dataBase = {
  users: [
    {
      id: '123',
      name: 'john',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date(),
    },
    {
      id: '1234',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date(),
    },
  ],
  login: [{}],
};
app.get('/', (req, res) => {
  res.send(dataBase.users);
});
app.post('/signIn', (req, res) => {
  if (
    req.body.email === dataBase.users[0].email &&
    req.body.password === dataBase.users[0].password
  ) {
    res.json(dataBase.users[0]);
  } else {
    res.status(400).json('Error logging in');
  }
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const newUser = {
    id: '12345',
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date(),
  };
  dataBase.users.push(newUser);
  res.json(newUser);
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  dataBase.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) res.status(404).json('not found user');
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  dataBase.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) res.status(404).json('not found user');
});

app.listen(PORT, () => {
  console.log('app is running on port ' + PORT);
});
