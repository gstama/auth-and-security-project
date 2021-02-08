require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
});

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res, next) => {
  res.render('home');
});

app
  .route('/login')
  .get((req, res, next) => {
    res.render('login');
  })
  .post((req, res, next) => {
    User.findOne({ email: req.body.username }, (err, foundUser) => {
      if (err) {
        log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === req.body.password) {
            res.render('secrets');
          }
        }
      }
    });
  });

app
  .route('/register')
  .get((req, res, next) => {
    res.render('register');
  })
  .post((req, res, next) => {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });

    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render('secrets');
      }
    });
  });

app.listen(3000, () => {
  console.log('Server started!');
});
