module.exports = class validatorCls {
  constructor() {
    const { check, query, param, body } = require('express-validator');
    this.check = check;
    this.query = query;
    this.param = param;
    this.body = body;
  }

  printQRValidator() {
    return [
      this.check('token')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a valid Token'),
      this.check('product_id')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a Valid Product-ID'),

      this.check('quantity')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please provide valid quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity should be more than 0'),

      this.check('serial_no')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please provide valid serial_no'),
      this.check('QR_copies')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please provide valid quantity')

        .isInt({ min: 1 })
        .withMessage('QR copies should be more than 0'),
    ];
  }

  printMasterQRValidator() {
    return [
      this.check('token')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a valid Token'),

      this.check('quantity')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please provide valid quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity should be more than 0'),
      this.check('QR_copies')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please provide valid quantity')

        .isInt({ min: 1 })
        .withMessage('QR copies should be more than 0'),
    ];
  }
  gateKeeperDispatchValidator() {
    return [
      this.check('token')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a valid Token'),
      this.check('shipped_to')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a Shipping Address'),
      this.check('bill_number')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a Valid Bill number'),
      this.check('vehicle_number')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please Provide a valid Vehicle Number'),
    ];
  }
};
