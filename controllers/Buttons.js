const WaytrixButtons = require('../models/Buttons'); 
const WaytrixMenu = require('../models/Menu')
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const WaytrixOrders = require('../models/Orders');
const waytrixCustomButtons = require('../models/CustomButtons');
const WaytrixUser = require('../models/Auth'); 
const WaytrixCar = require('../models/AddCarsValet');

const get_count_down_valet = async (req, res) => {
    try {
        const { timerId } = req.body;
console.log(req.body)
        // Find the record where timerId matches _id and timer is true
        const record = await WaytrixCar.findOne({ _id: timerId , timer:true});

        if (!record) {
            return res.status(404).send('Record not found');
        }

        // Assuming timerNum is the field to be sent back
        res.status(200).json({ timer: record.timeNum });
    } catch (error) {
        console.error('Error in get_count_down_valet:', error);
        res.status(500).send('Server Error');
    }
}
const set_count_down_valet = async (req, res) => {
    const { _id, timeNum } = req.body;
console.log(req.body)
    try {
        // Find the WaytrixCar record by _id and update or add timeNum and timer
        const result = await WaytrixCar.updateOne(
            { _id: _id }, // Filter by _id
            { $set: { timeNum: timeNum, timer: true } }, // Update or set timeNum and set timer to true
            { upsert: true } // Create a new document if _id doesn't exist
        );

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }}
const get_resto_id_from_table_id = async (req, res) => {
    const { tableId } = req.body;
// console.log(tableId)
    try {
        const user = await WaytrixUser.findOne({ _id: tableId });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ restoId: user.restoId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}
const get_resto_id_from_valet_id = async (req, res) => {
    try {
        const { valetId } = req.body;
    
        // Search for the valetId in the WaytrixUser database
        const user = await WaytrixUser.findOne({ _id: valetId });
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Extract the restoId from the user record
        const restoId = user.restoId;
    
        // Return the restoId in the response
        res.json({ restoId });
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
}

const deleteCustomButton = async (req, res) => {
    const { _id } = req.body;

    try {
        // Assuming waytrixCustomButtons is your Mongoose model
        const deletedButton = await waytrixCustomButtons.findByIdAndDelete(_id);

        if (!deletedButton) {
            return res.status(404).json({ message: "Button not found" });
        }

        res.status(200).json({ message: "Button deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
const getRestoSpecificCustomButtons = async (req, res) => {
    const { restoId } = req.body;

    try {
        const customButtons = await waytrixCustomButtons.find({ restoId });
        res.status(200).json(customButtons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
const getCustomButtonsByTableId = async (req, res) => {
    try {
        const { tableId } = req.body;
console.log(req.body)
        // Find the user record with the provided tableId
        const userRecord = await WaytrixUser.findOne({ _id: tableId });

        if (!userRecord) {
            return res.status(404).json({ message: 'User record not found' });
        }

        // Extract the restoId from the user record
        const { restoId } = userRecord;
        console.log(restoId)

        // Find the button records with the extracted restoId
        const buttonRecords = await waytrixCustomButtons.find({ restoId });

        if (!buttonRecords || buttonRecords.length === 0) {
            return res.status(404).json({ message: 'Button records not found' });
        }

        // Send a success response with the button records
        res.status(200).json( buttonRecords );
    } catch (error) {
        // Send an error response
        res.status(500).json({ message: 'Error retrieving button records', error: error.message });
    }
}
const AddCustomButtons = async (req, res) => {
    const { restoId, order, svgLink } = req.body;

    try {
        // Create a new instance of the model with the data from req.body
        const newCustomButton = new waytrixCustomButtons({
            restoId,
            order,
            svgLink
        });

        // Save the new instance to the database
        await newCustomButton.save();

        res.status(201).json({ message: 'Custom button added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const GetOrdersByWaiterId = async (req, res) => {
    const { waiterId } = req.body;
    console.log(req.body)

    try {
        // Find orders in WaytrixOrders where waiterId matches req.body waiterId
        const orders = await WaytrixOrders.find({ waiterId });

        res.send(orders);
    } catch (error) {
        console.error('Error fetching orders by waiterId:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

const DeleteOrders = async (req, res) => {
    const { _id } = req.body;

    try {
        // Find the order with the given _id and extract deleteId
        const order = await WaytrixOrders.findOne({ _id });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const { deleteId } = order;

        // Delete all records in WaytrixOrders with matching deleteId
        const deleteResult = await WaytrixOrders.deleteMany({ deleteId });

        res.json({ message: `Deleted ${deleteResult.deletedCount} orders` });
    } catch (error) {
        console.error('Error deleting orders:', error);
        res.status(500).json({ error: 'Failed to delete orders' });
    }
};

const AddOrder = async (req, res) => {
    const { tableId, order, restoId } = req.body;
console.log(req.body)
    try {
        // Fetch user name based on tableId
        const user = await WaytrixUser.findOne({ _id: tableId });
        const tableName = user.name; // Assuming 'name' is the field containing the user's name

        // Fetch all user IDs based on tableId
        const users = await WaytrixUser.find({ tableId: tableId }, '_id');

        // Generate a unique deleteId for the group of records
        const deleteId = new Date().getTime().toString(); // Example: Using timestamp as deleteId

        // Prepare data to be saved in WaytrixOrders
        const ordersData = users.map(user => ({
            tableId: tableId,
            waiterId: user._id,
            order: order,
            tableName: tableName,
            restoId: restoId,
            deleteId: deleteId // Assigning deleteId to each record
        }));

        // Insert orders into WaytrixOrders
        const orders = await WaytrixOrders.insertMany(ordersData);

        res.status(201).json({ message: 'Orders added successfully', orders: orders });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Failed to add order' });
    }
}
const deleteCar = async (req, res) => {
    const { _id } = req.body;
  console.log(req.body)
    try {
      // Assuming _id is a string or ObjectId
      const deletedCar = await WaytrixCar.findByIdAndDelete(_id);
  
      if (!deletedCar) {
        return res.status(404).json({ error: 'Car not found' });
      }
  
      return res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
const GetRequestedCars = async (req, res) => {
    const { restoId } = req.body;
  console.log(req.body);
    try {
      // Assuming valetId is a string or ObjectId
      const requestedCars = await WaytrixCar.find({ restoId });
  
      return res.status(200).json(requestedCars);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
const requestCar = async (req, res) => {
    const { _id, restoId } = req.body;
    console.log(req.body)


    try {
        const result = await WaytrixCar.findOneAndUpdate(
            { ticketNum: _id, restoId: restoId },
            { requested: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: 'Car not found' });
        }

        // Extract _id from the updated document
        const timerId = {timerId:result._id};

        return res.status(200).json(timerId);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
}
const AddCar = async (req, res) => {
    // DELETED valetId,
    // ticketNum, restoId, carName,  color
    const { ticketNum, restoId, carName, color } = req.body;
    console.log(req.body);

    try {
        // Check if a record with the same restoId and ticketNum already exists
        const existingCar = await WaytrixCar.findOne({ restoId, ticketNum });

        if (existingCar) {
            return res.status(400).json({ error: 'Car with the same restoId and ticketNum already exists' });
        }

        const newCar = new WaytrixCar({
            requested: false,
            restoId,
            ticketNum,
            carName,
            color,
            customerId: '9',
            timer: false
        });

        await newCar.save();

        res.status(201).json({ _id: newCar.ticketNum, timerId: newCar._id });
    } catch (error) {
        console.error('Error adding car:', error);
        res.status(500).json({ error: 'Failed to add car' });
    }
}
const SearchMenuByTableId = async (req, res) => {
    try {
        const { tableId } = req.body;
        console.log(req.body)
        const { ObjectId } = mongoose.Types;
const user = await WaytrixUser.findOne({ _id: new ObjectId(tableId) });
        // const user = await WaytrixUser.findOne({ _id: new ObjectId(tableId) });




        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { restoId } = user;
        const menu = await WaytrixMenu.findOne({ restoId });
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        res.send(menu);
    } catch (error) {
        console.error('Error searching menu by tableId:', error);
        res.status(500).json({ message: 'Failed to search menu' });
    }
};
const AddMenu = async (req, res) => {
    console.log(req.body)
    try {
        const { restoId, imageLink } = req.body;
        let existingMenu = await WaytrixMenu.findOne({ restoId });
        if (existingMenu) {
            existingMenu.imageLink = imageLink;
            await existingMenu.save();
            res.status(200).json({ message: 'Menu updated successfully', menu: existingMenu });
        } else {
            const newMenu = new WaytrixMenu({ restoId, imageLink });
            await newMenu.save();
            res.status(201).json({ message: 'Menu added successfully', menu: newMenu });
        }
    } catch (error) {
        console.error('Error adding/updating menu:', error);
        res.status(500).json({ message: 'Failed to add/update menu' });
    }
};

const getButtonsByTableId = async (req, res) => {
    try {
        const { tableId } = req.body;
console.log(req.body)
        // Find the user record with the provided tableId
        const userRecord = await WaytrixUser.findOne({ _id: tableId });

        if (!userRecord) {
            return res.status(404).json({ message: 'User record not found' });
        }

        // Extract the restoId from the user record
        const { restoId } = userRecord;

        // Find the button records with the extracted restoId
        const buttonRecords = await WaytrixButtons.find({ restoId });

        if (!buttonRecords || buttonRecords.length === 0) {
            return res.status(404).json({ message: 'Button records not found' });
        }

        // Send a success response with the button records
        res.status(200).json( buttonRecords );
    } catch (error) {
        // Send an error response
        res.status(500).json({ message: 'Error retrieving button records', error: error.message });
    }
}

const AddBooleanButtons = async (req, res) => {
    try {
        const { restoId, Napkins, Sugar, Salt, Oil, GlassOfIce, EmptyGlass, SousPlat, Bill, ShishaCharcoal, Toothpick, Ketchup } = req.body;

        // Check if a record with the same restoId already exists
        let buttonRecord = await WaytrixButtons.findOne({ restoId });

        if (buttonRecord) {
            // Update the existing record
            buttonRecord.Napkins = Napkins;
            buttonRecord.Sugar = Sugar;
            buttonRecord.Salt = Salt;
            buttonRecord.Oil = Oil;
            buttonRecord.GlassOfIce = GlassOfIce;
            buttonRecord.EmptyGlass = EmptyGlass;
            buttonRecord.SousPlat = SousPlat;
            buttonRecord.Bill = Bill;
            buttonRecord.ShishaCharcoal = ShishaCharcoal;
            buttonRecord.Toothpick = Toothpick;
            buttonRecord.Ketchup = Ketchup;

            await buttonRecord.save();

            // Send a success response
            res.status(200).json(buttonRecord);
        } else {
            // Create a new record with the provided data
            const newButtonRecord = new WaytrixButtons({
                restoId,
                Napkins,
                Sugar,
                Salt,
                Oil,
                GlassOfIce,
                EmptyGlass,
                SousPlat,
                Bill,
                ShishaCharcoal,
                Toothpick,
                Ketchup
            });

            // Save the record to the database
            await newButtonRecord.save();

            // Send a success response
            res.status(201).json(newButtonRecord);
        }
    } catch (error) {
        // Send an error response
        res.status(500).json({ message: 'Error adding or updating record', error: error.message });
    }
}

module.exports = {AddBooleanButtons,get_count_down_valet,set_count_down_valet,get_resto_id_from_table_id,get_resto_id_from_valet_id, getButtonsByTableId,deleteCustomButton, getRestoSpecificCustomButtons, getCustomButtonsByTableId, AddCustomButtons, AddMenu,AddOrder,DeleteOrders,GetOrdersByWaiterId, SearchMenuByTableId,deleteCar, AddCar, requestCar, GetRequestedCars}