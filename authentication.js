var jwt = require('jsonwebtoken');
var Key = require('./private/key');

module.exports = function(req,res,next){
    try{
        var token = req.session.token;
        var decoded = jwt.verify(token,Key.key());
        req.userData = decoded;
        next();
    }
    catch(error) {
        res.status(401).json({
            message: 'Auth Failed'
        });
    }
};