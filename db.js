const mongoose = require('mongoose');
require('dotenv').config();
mongoose
  .connect('mongodb+srv://Daps2:ZsizM3RV14jAUGka@cluster0.4mztk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('database connected successfully.'))
  .catch((err) => console.log('Error while connecting to database'));
