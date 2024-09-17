const express = require('express');
const {signup, login, verifyUser, generateForgotKey, updatePassword, signupTableValet, getTableAccounts, signupWaiter} = require('../controllers/Auth');
const { BooleanButtons, getButtonsByTableId, AddBooleanButtons, AddMenu, SearchMenuByTableId, AddCar, requestCar, GetRequestedCars, deleteCar, AddOrder, DeleteOrders, GetOrdersByWaiterId, AddCustomButtons, getCustomButtonsByTableId, getRestoSpecificCustomButtons, deleteCustomButton, get_resto_id_from_valet_id, get_resto_id_from_table_id, set_count_down_valet, get_count_down_valet } = require('../controllers/Buttons');
const { RestoAuth, WaytrixAuth, TableAuth, ValetAuth, WaiterAuth, CustomerAuth } = require('../middleware/Auth');

const ButtonsRouter = express.Router();

// get_count_down_valet
ButtonsRouter.post('/AddBooleanButtons',WaytrixAuth, AddBooleanButtons);
ButtonsRouter.post('/getButtonsByTableId',TableAuth, getButtonsByTableId);
ButtonsRouter.post('/AddMenu',RestoAuth, AddMenu);
ButtonsRouter.post('/SearchMenuByTableId',TableAuth, SearchMenuByTableId);
ButtonsRouter.post('/AddCar',  AddCar);
ButtonsRouter.post('/requestCar',TableAuth, requestCar);
ButtonsRouter.post('/GetRequestedCars',ValetAuth, GetRequestedCars);
ButtonsRouter.post('/deleteCar',ValetAuth, deleteCar);
ButtonsRouter.post('/AddOrder',TableAuth, AddOrder);
ButtonsRouter.post('/DeleteOrders',WaiterAuth, DeleteOrders);
ButtonsRouter.post('/GetOrdersByWaiterId',WaiterAuth, GetOrdersByWaiterId);
ButtonsRouter.post('/AddCustomButtons',WaytrixAuth, AddCustomButtons);
ButtonsRouter.post('/getCustomButtonsByTableId',TableAuth, getCustomButtonsByTableId);
ButtonsRouter.post('/getRestoSpecificCustomButtons',WaytrixAuth, getRestoSpecificCustomButtons);
ButtonsRouter.post('/deleteCustomButton',WaytrixAuth, deleteCustomButton);
ButtonsRouter.post('/get_resto_id_from_valet_id', get_resto_id_from_valet_id);
ButtonsRouter.post('/get_resto_id_from_table_id', get_resto_id_from_table_id);
ButtonsRouter.post('/set_count_down_valet', set_count_down_valet);
ButtonsRouter.post('/get_count_down_valet', get_count_down_valet);





module.exports = ButtonsRouter;
