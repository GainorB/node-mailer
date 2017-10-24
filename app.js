// DEPENDENCIES
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

// NODE MAILER
const from = '"Nodemailer Contact" <info@gainorbostwick.com>';

// SETUP NODEMAILER
function setup() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

// INIT EXPRESS
const app = express();

// VIEW ENGINE
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// SETUP STATIC FILES
app.use('/public', express.static(path.join(__dirname, 'public')));

// BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('contact');
});

app.post('/send', (req, res) => {
  const { name, company, phone, message } = req.body;

  // INITIALIZE TRANSPORT
  const transport = setup();

  // CONTENT OF THE EMAIL
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
      <li>Name: ${name}</li>
      <li>Company: ${company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${message}</p>
  `;

  // OBJECT REPRESENTING THE EMAIL WE WILL BE SENDING
  const email = {
    from,
    to: 'gainorbostwick@gmail.com',
    subject: 'Node Contact Request',
    html: output
  };

  if (name === '' || company === '' || req.body.email === '' || phone === '' || message === '') {
    res.render('contact', { msg: 'Error: please fill in all the fields' });
  } else {
    // THIS FUNCTION SENDS THE EMAIL
    transport.sendMail(email, (error, info) => {
      if (error) {
        res.render('contact', { msg: error });
      } else {
        res.render('contact', { msg: 'Email has been sent!' });
      }
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
