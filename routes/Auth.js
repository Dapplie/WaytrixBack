const express = require('express');
const {signup, login, verifyUser, generateForgotKey, updatePassword, signupTableValet, getTableAccounts, signupWaiter, GetTableLocations, getRestoInfo, GetWaytersByRestoId, GetTablesByRestoId, update_waiter_tableId_array, signupResto, delete_resto, getNumberOfWaitersByRestoId, getNumberOfTablesByRestoId, getTablesByRestoId, deleteTable, updateTable, getValetAccounts, deleteValet, updateValet, getTotalVideoLengthByRestoId, getAllVideosByRestoId, deleteVideoByTableId, updateVideoOrder, getWaitersByRestoId, deleteWaiter, updateWaiter, getTableNameByTableId, getPartnerNameByPartnerId, addTablet, getMaleCustomerCountByAgeGroup, getFemaleCustomerCountByAgeGroup, incrementTotalTimesSigned, getMaleCustomerCountByAgeGroupTotalSigned, getFemaleCustomerCountByAgeGroupTotalSigned, getRestoNameById} = require('../controllers/Auth');
const { RestoAuth, WaytrixAuth } = require('../middleware/Auth');
const { partner_login } = require('../controllers/PartnerAccount');


const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);

Router.post('/verifyUser', verifyUser);
Router.post('/generateForgotKey', generateForgotKey);
// GetTableLocations
Router.get('/GetTableLocations',WaytrixAuth, GetTableLocations);
// nop
Router.post('/updatePassword', updatePassword);
// signupTableValet
Router.post('/signupTableValet',WaytrixAuth, signupTableValet);
// partner_login
Router.post('/partner_login', partner_login);
Router.post('/getTablesByRestoId', getTablesByRestoId);

Router.get('/getTableAccounts',WaytrixAuth, getTableAccounts);
Router.get('/valet-accounts', getValetAccounts);

Router.post('/getRestoInfo',WaytrixAuth, getRestoInfo);
Router.post('/signupWaiter',WaytrixAuth, signupWaiter);

Router.post('/GetWaytersByRestoId', RestoAuth, GetWaytersByRestoId);
Router.post('/update_table', updateTable);
Router.post('/GetTablesByRestoId',RestoAuth, GetTablesByRestoId);
Router.post('/update_waiter_tableId_array', update_waiter_tableId_array);
Router.post('/signupResto',WaytrixAuth, signupResto);
Router.post('/delete_resto',WaytrixAuth, delete_resto);
Router.post('/getNumberOfWaitersByRestoId', getNumberOfWaitersByRestoId);
Router.post('/getNumberOfTablesByRestoId', getNumberOfTablesByRestoId);
// Delete table route
Router.delete('/delete-table', deleteTable);
Router.post('/videos-length', getTotalVideoLengthByRestoId);
Router.post('/update_valet', updateValet);
Router.delete('/delete-valet', deleteValet);
Router.delete('/deleteVideoByTableId', deleteVideoByTableId);
Router.get('/getAllVideosByRestoId', getAllVideosByRestoId);
Router.patch('/updateVideoOrder', updateVideoOrder);
Router.post('/waiters', getWaitersByRestoId);
Router.post('/updateWaiter', updateWaiter);
Router.delete('/delete-waiter', deleteWaiter);
Router.post('/getTableNameByTableId', getTableNameByTableId);
Router.post('/getPartnerNameByPartnerId', getPartnerNameByPartnerId);
Router.post('/addTablet', addTablet);
Router.post('/getMaleCustomerCountByAgeGroup', getMaleCustomerCountByAgeGroup);
Router.post('/getFemaleCustomerCountByAgeGroup', getFemaleCustomerCountByAgeGroup);
Router.post('/incrementTotalTimesSigned', incrementTotalTimesSigned);
Router.post('/getMaleCustomerCountByAgeGroupTotalSigned', getMaleCustomerCountByAgeGroupTotalSigned);
Router.post('/getFemaleCustomerCountByAgeGroupTotalSigned', getFemaleCustomerCountByAgeGroupTotalSigned);
Router.post('/getRestoNameById', getRestoNameById);
module.exports = Router;
