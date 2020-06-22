const usersController = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../../models');
const { JWTVerifier } = require('../../lib/passport');
const jwt = require('jsonwebtoken');
usersController.post('/', (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, bcrypt.genSaltSync(10),(err, hashed)=>{
    if(err) {
      throw err;
    }
    db.Users.create({ email, password : hashed })
      .then(user => res.json(user))
      .catch(err => res.json(err));
  });
});

usersController.get('/me', JWTVerifier, (req, res) => {
  res.json(req.user);
});

usersController.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.Users.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(401).send('Unauthorized');
      }
      bcrypt.compare(password, user.password, (err, result)=>{
        if (err){
          throw err;
        }else if(!result){
          return res.status(401).send('Unauthorized');
        }
        res.json({
          token: jwt.sign({ sub: user.id }, process.env.JWT_SECRET),
          user
        });

      });
    });
});

module.exports = usersController;
