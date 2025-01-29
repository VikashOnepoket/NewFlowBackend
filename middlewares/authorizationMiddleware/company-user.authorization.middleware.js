const MicroService = require('../../MicroServices/services');
// const { resolve } = require('path


const micro_service = new MicroService();
class AuthMiddleware {
  verifyCompanyUserToken = (req, res, next) => {
    console.log(req.body.token);
    let accessToken = req.body.token;
    var company_id;
    micro_service
      .VerifyCompanyUserJWT(accessToken)
      .then((data) => {
        req.user = data;
        next();
      })
      .catch((err) => {
        console.log(err + 'midd');
        res.status(500).send(err);
      });
  };
}

module.exports = AuthMiddleware;
