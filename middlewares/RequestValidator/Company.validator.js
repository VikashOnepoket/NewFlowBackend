const { request } = require('https');

class CompanyApiValidator {
  // Middleware function to validate the request
  validateRequestAddProduct(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'product_name',
      'productModel',
      'category',
      'warranty',
      'token',
      'additionalInfo',
      'purchaseOptions',
      'productDescription',
      'showManufactureDate',
      'company_logo',
    ];

    console.log('Company validator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0 && req.files && req.files.productImage) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      if (!req.files || !req.files.productImage) {
        errorMessage += ' | Missing Product Image';
      }
      return res.status(400).send(errorMessage);
    }
  }
  validateRequestEditProduct(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'product_name',
      'productModel',
      'category',
      'warranty',
      'token',
      'additionalInfo',
      'purchaseOptions',
      'productDescription',
      'showManufactureDate',
      'company_logo',
    ];

    console.log('Company validator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      //   if (!req.files || !req.files.newImages) {
      //     errorMessage += ' | Missing Product Image';
      //   }
      return res.status(400).send(errorMessage);
    }
  }

  validateRequestAddCompanyUser(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'name',
      'email',
      'password',
      'token',
      'factory_id',
      'user_access',
    ];

    console.log('Company-user add validator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      //   if (!req.files || !req.files.newImages) {
      //     errorMessage += ' | Missing Product Image';
      //   }
      return res.status(400).send(errorMessage);
    }
  }
  validateRequestEditCompanyUser(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = [
      'name',
      'email',
      'token',
      'factory_id',
      'user_access',
    ];

    console.log('Company-user edit validator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      //   if (!req.files || !req.files.newImages) {
      //     errorMessage += ' | Missing Product Image';
      //   }
      return res.status(400).send(errorMessage);
    }
  }
  validateRequestAddFactory(req, res, next) {
    console.log(req.body);
    // Check if all expected body fields are present
    const expectedFields = ['factory_name', 'token'];

    console.log('Company-user add validator');
    const missingFields = expectedFields.filter((field) => !req.body[field]);
    console.log(missingFields);
    if (missingFields.length === 0) {
      console.log('all fields present');
      // All expected fields are present, and avatarUrl files are attached, request is valid
      next(); // Pass the request to the next middleware or route handler
    } else {
      console.log('inside missing');
      let errorMessage = 'Missing fields: ' + missingFields.join(', ');

      //   if (!req.files || !req.files.newImages) {
      //     errorMessage += ' | Missing Product Image';
      //   }
      return res.status(400).send(errorMessage);
    }
  }
}

module.exports = CompanyApiValidator;
