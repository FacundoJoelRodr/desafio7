import express from 'express';
import passport from 'passport';
import expressSession from 'express-session';
import MongoStore from 'connect-mongo';
import handlebars from 'express-handlebars';
import path from 'path';
import { __dirname } from './utils.js';
import productRouter from './routers/api/products.router.js';
import cartRouter from './routers/api/carts.router.js';
import emailRouter from './routers/api/email.router.js';

import viewSessionRouter from './routers/views/views.router.js';
import sessionRouter from './routers/api/sessions.router.js';
import User from './models/user.model.js';
import { init as initPassaportConfig } from './config/passport.config.js';
import config from './config.js';
import { Exception } from './utils.js';
import { URI } from './db/mongodb.js';
import cookieParser from 'cookie-parser';
const app = express();

const SESSION_SECRET = config.session_secret;

app.use(
  expressSession({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: URI,
      mongoOptions: {},
      ttl: 120000,
    }),
  })
);

app.get('/', (req, res) => {
  res.redirect('/api/login');
});

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'ADMIN' });

    if (!existingAdmin) {
      const adminUser = new User({
        first_name: 'ADMIN',
        last_name: 'ADMIN',
        email: 'adminCoder@coder.com',
        password: 'adminCod3r123',
        role: 'ADMIN',
      });

      const newUser = await adminUser.save();
      console.log('Usuario administrador creado con éxito:', newUser);
    }
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
  }
};

createAdminUser();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'handlebars');

initPassaportConfig();

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', productRouter);
app.use('/api', cartRouter);
app.use('/api', viewSessionRouter);
app.use('/api', sessionRouter,);
app.use('/api', emailRouter);

app.use((error, req, res, next) => {
  if (error instanceof Exception) {
    res
      .status(500)
      .json({ error: 'Ha ocurrido un error interno del servidor' });
  } else {
    const message = `Ha ocurrido un error desconocido: ${error.message}`;
    console.error(message);
    res.status(500).json({ status: 'error', message });
  }
});
export default app;
