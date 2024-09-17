const jwt = require('jsonwebtoken');
const WaytrixUser = require('../models/Auth'); 
const WaytrixPartners = require('../models/Partners');

// Middleware function to verify JWT token
const PartnerAuth = (req, res, next) => {
// Get token from headers
const token = req.headers['authorization'];

// Check if token is present
if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
}

try {
    // Verify token
    const decoded = jwt.verify(token, 'your_jwt_secret');

    // Asynchronous operation inside try-catch
    async function checkUser() {
        // Check if userId exists in database
        const user = await WaytrixPartners.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if role matches "customer" or "table"
        if (decoded.role !== 'partner' ) {
            return res.status(403).json({ message: 'Unauthorized access.' });
        }

        

        // Attach decoded payload to request object
        req.user = decoded;
        next(); // Proceed to next middleware
    }

    // Call the async function
    checkUser().catch(err => {
        console.error('Error checking user:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    });
    
} catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
}
};



module.exports = {PartnerAuth};
