const MicroService = require('../../MicroServices/services');
// const { resolve } = require('path
const micro_service = new MicroService();
class AuthMiddleware {
  verifyAdminToken = (req, res, next) => {
    console.log(req.body.token);
    let accessToken = req.body.token;
    var admin_id;
    micro_service
      .VerifyJWT(accessToken)
      .then((admin_id) => {
        req.user = { admin_id: admin_id };
        next();
      })
      .catch((err) => {
        console.log(err + 'midd');
        res.status(500).send(err);
      });
  };
}

module.exports = AuthMiddleware;
