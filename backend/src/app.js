const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser'); // Évitez la redondance
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./connection/database');

const authRouter = require('./routes/authRouter');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Routes
app.use('/api/users', authRouter); // Assurez-vous d'ajouter un préfixe pour les routes d'authentification

module.exports = app;
