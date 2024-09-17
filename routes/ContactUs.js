const express = require('express');
const { ContactUs, GetContactUs, AddPartner, GetAllPartners, DeletePartner, AddSurvey, GetAllSurveys, AddPoints, getTotalPoints, AddVoucher, GetAllVouchers, Redeem, UserRedeemInfo } = require('../controllers/ContactUs');
const { RestoAuth, WaytrixAuth, TableAuth, TableAndCustomerAuth, CustomerAuth, AnyAuth } = require('../middleware/Auth');

const ContactUsRouter = express.Router();


ContactUsRouter.post('/ContactUs',TableAuth, ContactUs);
// UserRedeemInfo
ContactUsRouter.post('/GetContactUs',RestoAuth, GetContactUs);
ContactUsRouter.post('/AddPartner',WaytrixAuth, AddPartner);
ContactUsRouter.get('/GetAllPartners',AnyAuth, GetAllPartners);
ContactUsRouter.delete('/DeletePartner',WaytrixAuth, DeletePartner);
ContactUsRouter.post('/AddSurvey', TableAuth, AddSurvey);
ContactUsRouter.post('/GetAllSurveys',RestoAuth, GetAllSurveys);
ContactUsRouter.post('/AddPoints',CustomerAuth, AddPoints);
ContactUsRouter.post('/getTotalPoints',CustomerAuth, getTotalPoints);
ContactUsRouter.post('/AddVoucher',WaytrixAuth, AddVoucher);
ContactUsRouter.post('/GetAllVouchers',CustomerAuth, GetAllVouchers);
ContactUsRouter.post('/Redeem', CustomerAuth, Redeem);
ContactUsRouter.post('/UserRedeemInfo',CustomerAuth, UserRedeemInfo);


module.exports = ContactUsRouter;
