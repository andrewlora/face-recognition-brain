const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Redis Setup
const { createClient } = require('redis');

// You will want to update your host to the proper address in production
// New for Redis v4+
// Read the migration guide here: https://github.com/redis/node-redis/blob/HEAD/docs/v3-to-v4.md
const redisClient = createClient({
  url: process.env.REDIS_URI,
});

// New for Redis v4+
// Read the migration guide here: https://github.com/redis/node-redis/blob/HEAD/docs/v3-to-v4.md
async function redisConnect() {
  return await redisClient.connect();
}
redisConnect();

const signToken = (username) => {
  const jwtPayload = { username };
  return jwt.sign(jwtPayload, 'JWT_SECRET_KEY', { expiresIn: '2 days' });
};

const setToken = async (key, value) => {
  await redisClient.set(key, value);
};

const getToken = async (key) => {
  return await redisClient.get(key);
};

const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: 'true', userId: id, token, user };
    })
    .catch(console.log);
};

const getHash = (password) => {
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
};

const getBearer = (req) => {
  const { authorization } = req.headers;
  return authorization ? authorization.split(' ')[1] : undefined;
};

const getAuthTokenId = async (res, bearer) => {
  return await redisClient.get(bearer, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send('Unauthorized');
    }
    return res.json({ id: reply });
  });
};

const signInAuthentication = (db) => (req, res) => {
  const bearer = getBearer(req, res);
  return bearer
    ? getAuthTokenId(res, bearer)
    : handleSignIn(db, req, res)
        .then((data) =>
          data.id && data.email ? createSession(data) : Promise.reject(data),
        )
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
};

const requireAuth = async (req, res, next) => {
  try {
    const bearer = getBearer(req);
    if (!bearer) return res.status(401).send('Unauthorized');
    let value = await getToken(bearer);
    if (!value) return res.status(401).send('Unauthorized');
    next();
  } catch (error) {
    return res.status(400).send(error);
  }
};

const handleRegister = (req, res, db) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = getHash(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return trx('users')
          .returning('*')
          .insert({
            // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
            // loginEmail[0] --> this used to return the email
            // TO
            // loginEmail[0].email --> this now returns the email
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json('unable to register'));
};

const handleSignIn = (db, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }
  return db
    .select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => user[0])
          .catch((err) => res.status(400).json('unable to get user'));
      } else {
        return Promise.reject('wrong credentials');
      }
    })
    .catch((err) => err);
};

module.exports = {
  requireAuth,
  handleRegister,
  signInAuthentication,
};
