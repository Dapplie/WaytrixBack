const jwt = require('jsonwebtoken');
const WaytrixUser = require('../models/Auth'); 

// Middleware function to verify JWT token
const TableAndCustomerAuth = (req, res, next) => {
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
        const user = await WaytrixUser.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if role matches "customer" or "table"
        if (decoded.role !== 'customer' && decoded.role !== 'table') {
            return res.status(403).json({ message: 'Unauthorized access.' });
        }

        // Check if smsVerified and verified are true
        if (!user.smsVerified || !user.verified) {
            return res.status(403).json({ message: 'User not authorized.' });
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

// Middleware function to verify JWT token
const ValetAuth = (req, res, next) => {
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
          const user = await WaytrixUser.findById(decoded.userId);
  
          if (!user) {
              return res.status(404).json({ message: 'User not found.' });
          }
  
          // Check if role matches "customer" or "table"
          if (decoded.role !== 'valet' ) {
              return res.status(403).json({ message: 'Unauthorized access.' });
          }
  
          // Check if smsVerified and verified are true
          // if (!user.smsVerified || !user.verified) {
          //     return res.status(403).json({ message: 'User not authorized.' });
          // }
  
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

  const WaiterAuth = (req, res, next) => {
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
            const user = await WaytrixUser.findById(decoded.userId);
    
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
    
            // Check if role matches "customer" or "table"
            if (decoded.role !== 'waiter' ) {
                return res.status(403).json({ message: 'Unauthorized access.' });
            }
    
            // Check if smsVerified and verified are true
            // if (!user.smsVerified || !user.verified) {
            //     return res.status(403).json({ message: 'User not authorized.' });
            // }
    
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

    const RestoAuth = (req, res, next) => {
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
              const user = await WaytrixUser.findById(decoded.userId);
      
              if (!user) {
                  return res.status(404).json({ message: 'User not found.' });
              }
      
              // Check if role matches "customer" or "table"
              if (decoded.role !== 'resto' ) {
                  return res.status(403).json({ message: 'Unauthorized access.' });
              }
      
              // Check if smsVerified and verified are true
              // if (!user.smsVerified || !user.verified) {
              //     return res.status(403).json({ message: 'User not authorized.' });
              // }
      
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

      const WaytrixAuth = (req, res, next) => {
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
                const user = await WaytrixUser.findById(decoded.userId);
        
                if (!user) {
                    return res.status(404).json({ message: 'User not found.' });
                }
        
                // Check if role matches "customer" or "table"
                if (decoded.role !== 'waytrix' ) {
                    return res.status(403).json({ message: 'Unauthorized access.' });
                }
        
                // Check if smsVerified and verified are true
                // if (!user.smsVerified || !user.verified) {
                //     return res.status(403).json({ message: 'User not authorized.' });
                // }
        
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

        const AnyAuth = (req, res, next) => {
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
                  const user = await WaytrixUser.findById(decoded.userId);
          
                  if (!user) {
                      return res.status(404).json({ message: 'User not found.' });
                  }
          
                  // Check if role matches "customer" or "table"
                  if (decoded.role !== 'waytrix' && decoded.role !== 'resto' && decoded.role !== 'table' && decoded.role !== 'customer' && decoded.role !== 'valet' && decoded.role !== 'waiter' ) {
                      return res.status(403).json({ message: 'Unauthorized access.' });
                  }
          
                  // Check if smsVerified and verified are true
                  // if (!user.smsVerified || !user.verified) {
                  //     return res.status(403).json({ message: 'User not authorized.' });
                  // }
          
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
          const TableAuth = (req, res, next) => {
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
                    const user = await WaytrixUser.findById(decoded.userId);
            
                    if (!user) {
                        return res.status(404).json({ message: 'User not found.' });
                    }
            
                    // Check if role matches "customer" or "table"
                    if (decoded.role !== 'table' ) {
                        return res.status(403).json({ message: 'Unauthorized access.' });
                    }
            
                    // Check if smsVerified and verified are true
                    // if (!user.smsVerified || !user.verified) {
                    //     return res.status(403).json({ message: 'User not authorized.' });
                    // }
            
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
            const CustomerAuth = (req, res, next) => {
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
                        const user = await WaytrixUser.findById(decoded.userId);
                
                        if (!user) {
                            return res.status(404).json({ message: 'User not found.' });
                        }
                
                        // Check if role matches "customer" or "table"
                        if (decoded.role !== 'customer' ) {
                            return res.status(403).json({ message: 'Unauthorized access.' });
                        }
                
                        // Check if smsVerified and verified are true
                        // if (!user.smsVerified || !user.verified) {
                        //     return res.status(403).json({ message: 'User not authorized.' });
                        // }
                
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

module.exports = {TableAndCustomerAuth, CustomerAuth,ValetAuth,TableAuth, WaiterAuth, RestoAuth, WaytrixAuth, AnyAuth};
