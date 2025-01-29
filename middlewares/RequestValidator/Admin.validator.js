const { body } = require('express-validator');
const { request } = require('https');
const { isNumber } = require('util');

class ApiValidator {
  // Middleware function to validate the request
  validateRequest(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'email',
      'display_name',
      'owner_name',
      'phone',
      'token',
      'address',
      'password',
    ];
    if (req.body.action == 'Register') {
      console.log('register validator');
      const missingFields = expectedFields.filter((field) => !req.body[field]);
      console.log(missingFields);
      if (missingFields.length === 0 && req.files && req.files.avatarUrl) {
        console.log('all fields present');
        // All expected fields are present, and avatarUrl files are attached, request is valid
        next(); // Pass the request to the next middleware or route handler
      } else {
        console.log('inside missing');
        let errorMessage = 'Missing fields: ' + missingFields.join(', ');

        if (!req.files || !req.files.avatarUrl) {
          errorMessage += ' | Missing avatarUrl file(s)';
        }
        return res.status(400).send(errorMessage);
      }
    } else if (req.body.action == 'ADD_Credits') {
      const expectedFields1 = ['credits', 'business_id', 'business_email'];

      console.log('ADD Credits validator');
      const missingFields = expectedFields1.filter((field) => !req.body[field]);

      console.log(!isNaN(req.body.credits));
      if (
        missingFields.length === 0 &&
        !isNaN(req.body.credits) &&
        req.body.credits > 0
      ) {
        console.log('all fields present');
        // All expected fields are present, and avatarUrl files are attached, request is valid
        next(); // Pass the request to the next middleware or route handler
      } else {
        console.log('inside missing');
        let errorMessage = 'Missing fields: ' + missingFields.join(', ');
        if (isNaN(req.body.credits) || req.body.credits <= 0) {
          errorMessage += ' , Please enter a number greater than 0';
        }

        return res.status(400).send(errorMessage);
      }
    } else {
      next();
    }
  }

  validateRequestSaveNewTemplate(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'token',

      'template_name',
      'is_global',
      'is_private',
      'template_pdf',
      'page_height',
      'page_width',
      'labels_in_row',
      'labels_left_margin',
      'lables_height',
      'lables_width',
      'use_rect',
      'rect_top_margin',
      'rect_left_margin',
      'rect_width',
      'rect_height',
      'qr_size',
      'serial_no',

      'qr_left_padding',
      'qr_top_padding',
      'serial_top_margin',
      'font_size',
    ];

    console.log('Save New Template Valdator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      return res.status(400).send(errorMessage);
    }
  }

  validateRequestEditTemplate(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'token',
      'template_id',
      'template_name',
      'is_global',
      'is_private',
      'template_pdf',
      'page_height',
      'page_width',
      'serial_no',
      'labels_in_row',
      'labels_left_margin',
      'lables_height',
      'lables_width',
      'use_rect',
      'rect_top_margin',
      'rect_left_margin',
      'rect_width',
      'rect_height',
      'qr_size',
      'qr_left_padding',
      'qr_top_padding',
      'serial_top_margin',
      'font_size',
    ];

    console.log('Edit Template Valdator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      return res.status(400).send(errorMessage);
    }
  }
}

module.exports = ApiValidator;
