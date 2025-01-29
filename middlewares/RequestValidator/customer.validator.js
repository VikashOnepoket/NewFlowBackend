const { request } = require('https');

class customerApiValidator {
  // Middleware function to validate the request
  validateAvailWarrantyRequest(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = ['name', 'alphanumeric', 'phone_number', 'email'];
    console.log('register validator');

    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (
      missingFields.length === 0 &&
      req.files &&
      req.files.invoice &&
      req.body.phone_number.length == 10
    ) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      if (!req.files || !req.files.invoice) {
        errorMessage += ' | Missing avatarUrl file(s)';
      }

      if (req.body.phone_number.length != 10)
        errorMessage +=
          ' | Phone Number length should be 10 without country code';

      return res.status(400).send(errorMessage);
    }
  }


  validateInstallationFormRequest(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = ['alphanumeric',
      'contact_name',
      'contact_number',
      'contact_address',
      'installation_date',
      'installation_time'];
    console.log('register validator');

    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (
      missingFields.length === 0 &&
      req.body.contact_number.length == 10
    ) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      // if (!req.files || !req.files.invoice) {
      //   errorMessage += ' | Missing avatarUrl file(s)';
      // }

      if (req.body.contact_number.length != 10)
        errorMessage +=
          ' | Phone Number length should be 10 without country code';

      return res.status(400).send(errorMessage);
    }
  }
}

module.exports = customerApiValidator;
