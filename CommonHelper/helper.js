module.exports = class Helper {
  constructor() {
    const { validationResult } = require('express-validator');
    this.validationResult = validationResult;
  }

  checkforerrors = async (req, res, next) => {
    const errors = this.validationResult(req);
    if (!errors.isEmpty()) {
      var errorVal = errors.array();

      //   response_raws.data = errors.array();

      res.status(400);

      res.send({ Error: errorVal });
    } else {
      //console.log("next")
      next();
    }
  };
};
