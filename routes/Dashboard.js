const express = require('express');
const { WaytrixAuth, TableAuth, AnyAuth, RestoAuth } = require('../middleware/Auth');
const { total_resto_num_for_waytrix, total_table_num_for_waytrix, total_Adds_num_for_waytrix, total_waiter_num_for_waytrix, total_cars_num_for_waytrix, total_customers_num_for_waytrix, total_customers_info_for_waytrix, add_contact_us_click, get_total_contact_us_click_for_waytrix, total_valet_num_for_waytrix, total_tablet_num_for_waytrix } = require('../controllers/Dashborad');
const { get_survey_num_by_restoId } = require('../controllers/RestoDashboard');

const DashboardRouter = express.Router();
// get_survey_num_by_restoId
DashboardRouter.get('/total_resto_num_for_waytrix',WaytrixAuth, total_resto_num_for_waytrix);
DashboardRouter.get('/total_table_num_for_waytrix',WaytrixAuth, total_table_num_for_waytrix);
DashboardRouter.get('/total_Adds_num_for_waytrix',WaytrixAuth, total_Adds_num_for_waytrix);
DashboardRouter.get('/total_waiter_num_for_waytrix',WaytrixAuth, total_waiter_num_for_waytrix);
DashboardRouter.get('/total_cars_num_for_waytrix',WaytrixAuth, total_cars_num_for_waytrix);
DashboardRouter.get('/total_customers_info_for_waytrix',WaytrixAuth, total_customers_info_for_waytrix);
DashboardRouter.post('/add_contact_us_click', add_contact_us_click);
DashboardRouter.get('/get_total_contact_us_click_for_waytrix',WaytrixAuth, get_total_contact_us_click_for_waytrix);
DashboardRouter.get('/total_valet_num_for_waytrix',WaytrixAuth, total_valet_num_for_waytrix);
DashboardRouter.get('/total_tablet_num_for_waytrix',WaytrixAuth, total_tablet_num_for_waytrix);

// RestoDash
DashboardRouter.post('/get_survey_num_by_restoId',RestoAuth, get_survey_num_by_restoId);



module.exports = DashboardRouter;
