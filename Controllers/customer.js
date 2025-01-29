const { Router, response } = require('express');
var bodyParser = require('body-parser');
const app = Router();
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
const cors = require('cors');
const multer = require('multer');
const db = require('../Database_connection/db');

var path = require('path');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/temporary_storage/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});


require('dotenv').config();
var upload = multer({ storage: storage });
const msg91OTP = require('msg91-lib').msg91OTP;
const CustomerApiValidator = require('../middlewares/RequestValidator/customer.validator');
const CustomerApiValidatorobj = new CustomerApiValidator();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_VALIDITY = process.env.SESSION_TIMEOUT;
const msg91otp = new msg91OTP({
  authKey: '388243AutttOTXECf63bc5788P1',
  templateId: '63bd363ed6fc0537b36cc522',
});
// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_VALIDITY = process.env.SESSION_TIMEOUT_CUSTOMER;
var corsOptions = {
  origin: [
    'https://dev-company.onepoket.com',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://dev-company-new.onepoket.com',
    'http://dev-company-old.onepoket.com',


    'https://dev-company-user.onepoket.com',
    'https://dev.onepoket.com',
    'https://dev-super-admin.onepoket.com',
  ],
  // origin: [
  //   'https://company.onepoket.com',
  //   'http://localhost:3000',
  //   'https://company-user.onepoket.com',
  //   'https://onepoket.com',
  //   'https://super-admin.onepoket.com',
  // ],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
};
const CustomerManager = require('../Managers/customer_manager');
const customerManager = new CustomerManager();
app.use(cors(corsOptions));
app.post('/customer/productDetails', (req, res) => {
  customerManager
    .CustomerProductDetails(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});


app.post('/resend_registration_otp', async (req, res) => {
  let i = req.body;
  try {
    let number = i.phone_number;
    if (!number || number.length != 10) {
      console.log("num")
      return res.status(400).send("Invalid phone number, please enter 10 digits without +91 or 0")
    }
    let message = 'OTP sent'

    if (process.env.IS_MOCK_OTP === '0') {
      const sms_template_id = "63bd363ed6fc0537b36cc522";
      const response = await customerManager.resendOTP(number, "wreg", sms_template_id); // can be passed without country code and as string
      console.log(response);
      message = response

    }
    res.send({ data: message });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });

  }
});
app.post('/send_registration_otp', async (req, res) => {
  let i = req.body;
  try {
    let test = 0;
    if (req.body.test) {
      test = req.body.test
    }
    let number = "" + i.phone_number;
    console.log(number);
    if (!number || number.length != 10) {
      console.log("num")
      return res.status(400).send("Invalid phone number, please enter 10 digits without +91 or 0")
    }
    let message = { message: 'OTP sent', otp: process.env.MOCK_OTP }
    // let number = '91' + i.phone_number;
    if (process.env.IS_MOCK_OTP === '0') {
      const sms_template_id = "63bd363ed6fc0537b36cc522";
      const response = await customerManager.sendRegistrationOTP(number, "wreg", test, sms_template_id); // can be passed without country code and as string
      console.log(response);
      message = response
    }
    // sdk
    //   .sendotp({
    //     template_id: '63bd363ed6fc0537b36cc522',
    //     mobile: '917007375070',
    //   })
    //   .then(({ data }) => console.log(data))
    //   .catch((err) => console.error(err.message)); // can be passed without country code and as string
    // console.log(response);
    res.send({ data: message });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
});

app.post('/customer/submit_installation_form', CustomerApiValidatorobj.validateInstallationFormRequest, (req, res) => {
  customerManager
    .SaveProductInstallationFormData(req.body)
    .then((result) => {
      res.send("Saved Form Data");
    })
    .catch((err) => {
      console.log("error" + err)
      res.status(400).send(err);
    });
});

app.post('/customer/get_installation_data', (req, res) => {
  console.log(req.body)
  customerManager.fetchInstallationFormDataByAlphanumeric(req.body)
    .then((result) => {

      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err)
      res.status(404).send(err);
    });
});

app.post('/resend_otp', async (req, res) => {
  let i = req.body;
  try {
    let number = i.phone_number;
    if (!number || number.length != 10) {
      console.log("num")
      return res.status(400).send("Invalid phone number, please enter 10 digits without +91 or 0")
    }
    let message = 'OTP sent'

    if (process.env.VERIFY_LOGIN_OTP === '0') {
      const sms_template_id = "63bd363ed6fc0537b36cc522";
      const response = await customerManager.resendOTP(number, "login", sms_template_id); // can be passed without country code and as string
      console.log(response);
      message = response

    }
    res.send({ data: message });
  } catch (error) {
    console.log(error);

    // res.status(400).send(error) 
    res.status(400).send({ error: error });

  }
});
app.post('/otp', async (req, res) => {
  let i = req.body;

  try {
    let test = 0;
    if (req.body.test) {
      test = req.body.test
    }
    let number = i.phone_number;
    console.log(number);
    if (!number || number.length != 10) {
      return res.status(400).send("Invalid phone number, please enter 10 digits without +91 or 0")
    }
    let message = 'OTP sent'


    const sms_template_id = "63bd363ed6fc0537b36cc522";
    console.log(sms_template_id);
    const response = await customerManager.sendOTP(number, "login", test, sms_template_id) // can be passed without country code and as string
    console.log(response);
    message = response


    res.send({ data: response });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
});


app.post('/verify', async (req, res) => {
  let i = req.body;
  let number = i.phone_number;
  console.log(number)
  try {
    if (process.env.VERIFY_LOGIN_OTP === '0') {
      // console.log(process.env.VERIFY_OTP + 'pros');
      var response = await customerManager.verifyOTP(number, i.otp, "login")
    } else {
      if (i.otp == process.env.MOCK_OTP) var response = 'OTP verified';
      else res.status(400).send({ error: 'Wrong OTP!' });
    }
    console.log(response);
  } catch (error) {
    console.log(error);

    // else{
    //   error_m
    // }

    res.status(400).send(error);
  }

  if (response) {
    console.log('in response');
    db.query(
      'select * from customerSeller_user where phone_number=?',
      [i.phone_number],
      (err, result) => {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          if (result.length < 1) {
            res.send({ message: 'User not registered', status: false });
          } else {
            if (result[0].role == 'customer') {
              db.query(
                'select * from customer_details where business_id=?',
                [result[0].id],
                (err, result1) => {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  } else {
                    console.log(result1);
                    var accessToken = jwt.sign(
                      { userId: result1[0].business_id },
                      JWT_SECRET,
                      {
                        expiresIn: process.env.SESSION_TIMEOUT_CUSTOMER,
                      }
                    );
                    res
                      .cookie('accessToken', accessToken, {
                        httpOnly: true,
                        secure: true,
                      })
                      .status(200)
                      .json({
                        accessToken,
                        status: true,
                        user: {
                          role: 'customer',
                          email: result1[0].email,
                          id: result1[0].business_id,
                          avatarUrl: result1[0].avatarImage,
                          name: result1[0].name,
                          date_of_birth: result1[0].date_of_birth,
                          mobile: result[0].phone_number,
                        },
                      });
                  }
                }
              );
            } else if (result[0].role == 'seller') {
              db.query(
                'select * from seller_details where business_id=?',
                [result[0].id],
                (err, result1) => {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  } else {
                    var accessToken = jwt.sign(
                      { userId: result1[0].business_id },
                      JWT_SECRET,
                      {
                        expiresIn: process.env.SESSION_TIMEOUT_CUSTOMER,
                      }
                    );
                    res
                      .cookie('accessToken', accessToken, {
                        httpOnly: true,
                        secure: true,
                      })
                      .status(200)
                      .json({
                        accessToken,
                        status: true,
                        user: {
                          role: 'seller',
                          email: result1[0].email,
                          id: result1[0].business_id,
                          avatarUrl: result1[0].avatarImage,
                          address: result1[0].address,
                          gst: result1[0].gst,
                          mobile: result[0].phone_number,
                          shop_name: result[0].shop_name,
                          owner_name: result[0].owner_name,
                          state: result[0].state,
                          city: result[0].city,
                        },
                      });
                  }
                }
              );
            }
          }
        }
      }
    );
  }

  // setTimeout(() => {
  //   res.status(400).send({ message: 'Wrong OTP!' });
  // }, 400);
});
app.post('/customer_logout', (req, res) => {
  let i = req.body;
  res.clearCookie(i.token);
  res.send({ message: 'Successfully signed out' });
});


app.post('/update_invoice', upload.fields([{ name: 'invoice', maxCount: 1 }]), async (req, res) => {
  let customer_id = req.body.customer_id;
  let alphanumeric = req.body.alphanumeric;
  let p_img = req.files.invoice[0];
  let InvoiceNumber = req.body.invoiceNumber;

  if (!InvoiceNumber) {
    return res.status(400).send("Unable to fetch invoice number!");
  } else {
    micro_service.AddImage(p_img, 'warranty_invoice').then((invoiceUrl) => {
      
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting MySQL connection from pool', err);
          return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(`update warranty_availed_data set invoiceNumber=?, invoice = ? where customer_id =? AND alphanumeric =?`, [InvoiceNumber, invoiceUrl, customer_id, alphanumeric], (error) => {
          if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
          }

          res.status(200).json({ message: 'File uploaded successfully' });
        });
      });

    })

  }

}
);





module.exports = app;
