const express = require('express');
const cors = require('cors');
const AuthRoutes = require('./routes/Auth');
const multer_router = require("./routes/Multer")
const VideoRoutes = require('./routes/Video');
const ContactUsRoutes = require('./routes/ContactUs');
const ButtonsRoutes = require('./routes/Buttons');
const DashBoardRoutes = require('./routes/Dashboard');
const PartnerAccountRoutes = require('./routes/PartnerAccount');

// const cookieParser = require('cookie-parser');
// const extractTokenMiddleware = require('./middleware/Auth'); 

require('./db');
const os = require('os');

const PORT = process.env.PORT || 3030;

const app = express();

app.use(cors());
app.use(express.json());

const IP_ADDRESS = getPrivateIpAddress();

function getPrivateIpAddress() {
    const interfaces = os.networkInterfaces();
    for (let interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (let i = 0; i < interfaceInfo.length; i++) {
            const info = interfaceInfo[i];
            if (!info.internal && info.family === 'IPv4') {
                return info.address;
            }
        }
    }
    return '127.0.0.1'; 
}
// app.use(cookieParser());

// PartnerAccountRoutes
app.use('/api/Auth', AuthRoutes);
app.use('/api/DashBoardRoutes', DashBoardRoutes);
app.use('/api/PartnerAccountRoutes', PartnerAccountRoutes);

// app.use(extractTokenMiddleware);
app.use('/api/VideoRoutes', VideoRoutes);
app.use('/api/ContactUsRoutes', ContactUsRoutes);
app.use('/api/ButtonsRoutes', ButtonsRoutes);

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
app.use('/uploads', express.static('uploads'));
app.use('/upload', multer_router)

app.use(bodyParser.urlencoded({extended:true}))
app.use(upload.array())
app.post('/insertTrackDetails', function(req,res){
  console.log(req.body);
  res.send('REquested data received. check in console!!!')
})
app.use(express.urlencoded({extended:true}))

app.use((error, req, res, next) => {
  if (error) {
    const message = error.message || 'Something went wrong. Try again later.';
    const status = error.status || 500;
    return res.status(status).send(message);
  }
});

// app.listen(PORT,IP_ADDRESS,  () => {
//   console.log(`server started on http://${IP_ADDRESS}:${PORT}`);
// });

// app.listen(PORT, 'localhost', () => {
//   console.log(`Server started on http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${PORT}`);
});
