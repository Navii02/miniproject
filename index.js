const express =require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose')
const path = require('path');

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session) 
require('dotenv').config()
const StudentData = require('./api/studentData')
const Notice = require('./api/Notice')
const Feereminder = require('./api/feereminder')
const CertificateUser=require('./api/usercertificaterequest')
const loginRouter = require('./api/loginRoutes')
const adminRouter = require('./api/AdminRoutes')
const Dashboard=require('./api/Dashboard')
const ImageGallery=require('./api/imagegalary')

const app = express();
const MAX_AGE = 1000 * 60 * 60 * 3 //3hrs
const corsOptions = {
  origin: 'http://localhost:3000',
  optionSuccessStatus:200,
}
mongoose.Promise = global.Promise
mongoose.connect(process.env.DATABASE_CONNECTION_STRING,{
    useNewUrlParser: true,
    
})


// setting up connect-mongodb-session store
const mongoDBstore = new MongoDBStore({
    uri: process.env.DATABASE_CONNECTION_STRING,
    collection: 'studentData',
    
    
  })
  console.log("mongo is connected");
  app.use(
    session({
      secret: 'a1s2d3f4g5h6',
      name: 'session-id', // cookies name to be put in "key" field in postman
      store: mongoDBstore,
      cookie: {
        maxAge: MAX_AGE, // this is when our cookies will expired and the session will not be valid anymore (user will be log out)
        sameSite: false,
        secure: false, // to turn on just in production
      },
      resave: true,
      saveUninitialized: false,
    })
  )
  


app.use(bodyParser.json())
app.use(cors(corsOptions))


/*app.get('/', function(req, res) {
  res.send("Welcome to ee")
})*/
app.use('/api',loginRouter)
app.use('/api',adminRouter)

app.use('/api',StudentData)
app.use('/api',Notice)
app.use('/api',CertificateUser)
app.use('/api',Feereminder)
app.use('/api',Dashboard)
app.use('/api',ImageGallery)

app.use('/uploads', express.static('uploads'));

// Serve the images
app.use('/images', express.static(path.join(__dirname, 'uploads'), {
  fallthrough: false,
  setHeaders: (res, filePath) => {
    if (!filePath.includes('.jpg') && !filePath.includes('.jpeg') && !filePath.includes('.png') && !filePath.includes('.gif')) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).json({ error: 'Image not found' });
    }
  },
}));


app.use('/api', express.static('certificate'));

app.listen(5000, function() {
  console.log("connected to server")
});
module.exports =app
