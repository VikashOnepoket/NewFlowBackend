const { Router } = require('express');
const QRCode = require('qrcode');
const app = Router();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const PDFDocument = require('pdfkit');
var random = require('random-string-alphanumeric-generator');
const db = require('../Database_connection/db');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var path = require('path');
const e = require('express');
const tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/temporary_storage/images');
    // cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});


const CustomerApiValidator = require('../middlewares/RequestValidator/customer.validator');
const CustomerApiValidatorobj = new CustomerApiValidator();
const CompanyUserApiValidator = require('../middlewares/RequestValidator/company-user.validator');
const CompanyUserApiValidatorobj = new CompanyUserApiValidator();
const CommonHelper = require('../CommonHelper/helper');
const commonHelperObj = new CommonHelper();
require('dotenv').config();
var upload = multer({ storage: storage });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_VALIDITY = process.env.SESSION_TIMEOUT_CUSTOMER;

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

app.use(cors(corsOptions));
const OperatorManager = require('../Managers/operator_manager');
const CompanyManager = require('../Managers/company_manager');
const companyManager = new CompanyManager();
const CustomerManager = require('../Managers/customer_manager');
const customerManager = new CustomerManager();
const operatorManager = new OperatorManager();
const CompanyRepository = require('../Repositories/company_repository');
const companyRepository = new CompanyRepository();
const GateKeeperManager = require('../Managers/gateKeeper_manager');
const CustomerRepository = require('../Repositories/customer_repository');
const customerRepoobj = new CustomerRepository()
const gatekeeper_manager = new GateKeeperManager();
const micro_service = require('../MicroServices/services')
const micro_serviceobj = new micro_service()
function pdf(result2) {
  console.log(result2[0].qr_image);
  const doc = new PDFDocument();
  let alpha = random.randomAlphanumeric(5);
  let name = alpha + '.pdf';
  let path = '/var/www/pdf/' + name;
  doc.pipe(fs.createWriteStream(path));

  for (let j = 0; j < result2.length; j++) {
    console.log(result2[j].qr_image);
    let ab = result2[j].qr_image.split('/');
    let target = '/var/www/qr/' + ab[4];
    console.log(target);
    doc.image(target, {
      fit: [350, 350],
      align: 'center',
      valign: 'center',
    });
    // let sequence_alpha=result2[j].alphanumeric
    // doc.text(sequence_alpha,150,400)
    // let url="https://billfy-verify.netlify.app/"+sequence_alpha
    // doc.text(url,150,450)
    if (j != result2.length - 1) {
      doc.addPage();
    }
  }
  doc.end();
  let response = 'https://dev-api.billfy.in/pdf/' + name;
  // let response = name
  return response;
}
const again = (product_id, serial_number) => {
  let alpha = random.randomAlphanumeric(10);
  db.query(
    'insert into encoded_qr(alphanumeric,product_id,serial_number) values (?,?,?)',
    [alpha, product_id, serial_number],
    (err, result) => {
      if (err) {
        again(product_id);
      } else {
        console.log(result);
        console.log('inserted');
        return;
      }
    }
  );
};
var alphanumeric = async (
  quantity,
  serial_no,
  factory_operator_id,
  product_id
) => {
  return new Promise((resolve, reject) => {
    console.log('alpha');
    db.query('select id from QR order by id desc limit 1', (err, result2) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result2);
        let starting_id = result2[0].id;
        console.log(starting_id);
        for (let j = 1; j <= quantity; j++) {
          let serial_number = parseInt(serial_no) + j - 1;
          let alpha = random.randomAlphanumeric(10);
          db.query(
            'insert into encoded_product(alphanumeric,product_id,serial_number) values (?,?,?)',
            [alpha, product_id, serial_number],
            (err, result) => {
              if (err) {
                console.log('trying again');
                again(product_id, serial_number);
              } else {
                console.log(result);
                console.log('inserted');
                let filename = '/var/www/qr/P' + alpha + '.png';
                let path = 'https://api-dev.billfy.in/qr/P' + alpha + '.png';
                // let data = "https://billfy.in/"+alpha
                // let data = "https://billfy-verify.netlify.app/"+alpha
                let data = 'https://dev.billfy.in/registration/' + alpha;
                QRCode.toFile(filename, data).then((qr) => {
                  db.query(
                    'insert into QR(product_id,qr_image,factory_operator_id,serial_number) values (?,?,?,?)',
                    [product_id, path, factory_operator_id, serial_number],
                    (err, result) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log('QR inserted' + j);
                        console.log(quantity);
                        console.log(j);
                        if (j == quantity) {
                          return resolve(starting_id);
                        }
                      }
                    }
                  );
                });
              }
            }
          );
        }
      }
    });
  });
};
app.post('/factory_operator_history', (req, res) => {
  let i = req.body;
  console.log(i);
  operatorManager
    .GetFactoryOperatorHistory(i)
    .then((result) => {
      if (result == 'No data available') {
        res.status(404).send(result);
      } else {
        res.send(result[0]);
      }
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/factory_operator_QR_history', (req, res) => {
  let i = req.body;
  operatorManager
    .FactoryOperatorPdfHistory(i)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      if (err == 'Authentication failed') {
        res.status(400).send(err);
      } else {
        res.status(404).send(err);
      }
    });
});

app.post(
  '/print_QR',
  CompanyUserApiValidatorobj.printQRValidator(),
  commonHelperObj.checkforerrors,
  async (req, res) => {
    let i = req.body;
    console.log(i);
    if (parseInt(i.quantity) >= parseInt(process.env.QR_QUANTITY)) {
      res
        .status(400)
        .send(
          `You can generate PDF with ${process.env.QR_OVERALL - 1
          } QRs max! Please try with lesser number of QRs.`
        );
    } else if (parseInt(i.QR_copies) >= parseInt(process.env.QR_COPIES)) {
      res
        .status(400)
        .send(
          `You can generate PDF with ${process.env.QR_OVERALL - 1
          } QRs max! Please try with lesser number of QRs.`
        );
    } else if (
      parseInt(i.QR_copies) * parseInt(i.quantity) >=
      parseInt(process.env.QR_OVERALL)
    ) {
      res
        .status(400)
        .send(
          `You can generate PDF with ${process.env.QR_OVERALL - 1
          } QRs max! Please try with lesser number of QRs.`
        );
    } else {
      // operatorManager.PrintQR(i)
      // .then((result)=>{
      //     console.log("mng"+result)
      //     setTimeout(()=>{
      //         res.send(result)
      //     },500)

      // })
      // .catch((err)=>{
      //     console.log(err)
      //     res.send(err)
      // })

      gatekeeper_manager
        .Identity(req.body)
        .then(async (user) => {
          try {
            console.log(user);

            const userTypeToCheck = 'factory_operator';

            const containsFactoryOperator = user.user_access.some(
              (user) => user.user_type === userTypeToCheck
            );
            console.log(containsFactoryOperator);
            if (containsFactoryOperator) {
              const credits_remaining =
                await companyRepository.GetRemainingCompanyQRCredits(
                  user.company_id
                );

              console.log('cred', credits_remaining);
              if (process.env.CREDIT_BALANCE_CHECK === '1') {
                //   console.log('Inside-Credit Balance');
                if (credits_remaining >= i.quantity) {
                  operatorManager
                    .PrintQR(req.body, credits_remaining, user)
                    .then((result) => {
                      console.log('mng' + result);
                      setTimeout(() => {
                        res.send(result);
                      }, 500);
                    })
                    .catch((err) => {
                      console.log(err);
                      if (err.message) {
                        res.status(400).send(err.message);
                      }
                      else {
                        res.status(400).send(err);

                      }
                    });
                } else res.status(400).send('Insufficient credits');
              } else {
                operatorManager
                  .PrintQR(req.body, credits_remaining, user)
                  .then((result) => {
                    console.log('mng' + result);
                    setTimeout(() => {
                      res.send(result);
                    }, 500);
                  })
                  .catch((err) => {
                    console.log(err);
                    // res.status(400).send(err);
                    if (err.message) {
                      res.status(400).send(err.message);
                    }
                    else {
                      res.status(400).send(err);

                    }
                  });
              }
            } else {
              res.status(401).send('Acess Denied');
            }
          } catch (err) {
            console.log(err);
            res.status(401).send(err);
          }
        })
        .catch((err) => {
          res.status(401).send(err);
        });
    }

    //   const credits_remaining =
    //     await companyRepository.GetRemainingCompanyQRCredits(i.business_id);
    //   console.log(credits_remaining);
    //   if (process.env.CREDIT_BALANCE_CHECK === '1') {
    //     //   console.log('Inside-Credit Balance');

    //     if (credits_remaining >= i.quantity) {
    //       operatorManager
    //         .PrintQR(i, credits_remaining)
    //         .then((result) => {
    //           console.log('mng' + result);
    //           setTimeout(() => {
    //             res.send(result);
    //           }, 500);
    //         })
    //         .catch((err) => {
    //           console.log(err);
    //           res.send(err);
    //         });
    //     } else res.json({ success: false, message: 'Insufficient credits' });
    //   } else {
    //     operatorManager
    //       .PrintQR(i, credits_remaining)
    //       .then((result) => {
    //         console.log('mng' + result);
    //         setTimeout(() => {
    //           res.send(result);
    //         }, 500);
    //       })
    //       .catch((err) => {
    //         console.log(err);
    //         res.send(err);
    //       });
    //   }
    // }
  }
);

app.post('/isWarrantyAvailed', (req, res) => {
  customerManager
    .isWarrantyAvailed(req.body)
    .then((productDetails) => {
      res.status(200).send(productDetails);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.post(
  '/avail_warranty',
  upload.fields([{ name: 'invoice', maxCount: 1 }]),
  CustomerApiValidatorobj.validateAvailWarrantyRequest,
  async (req, res) => {
    let i = req.body;
    //let asin_or_fsn = i.asin_or_fsn;

    console.log(i);
    // let p_img="https://dev-api.billfy.in/pictures/"+req.files.invoice[0].filename;


    let p_img = req.files.invoice[0];

    let isInvoiceNumber = req.body.invoiceNumber;
    let review_link;
    let msg;

    if (i.comparedData == false) {
      msg = "pending";
    }

    //making review url
    if(i.purchased_from == "Flipkart" || i.purchased_from == "flipkart" || i.purchased_from == "FLIPKART"){
      review_link = `https://www.flipkart.com/casio-mtp-v005d-1budf-enticer-men-s-analog-watch-men/write-review/itmf7328sp6xwdar?pid=${i.asin_or_fsn}&lid=LSTWATF73274E6YYSHUPCX11G&source=od_det&otracker=orders`;
    }else if(i.purchased_from == "Amazon" || i.purchased_from == "amazon" || i.purchased_from == "AMAZON"){
      review_link = `https://www.amazon.in/review/create-review/?ie=UTF8&channel=glance-detail&asin=${i.asin_or_fsn}`;
    }


    customerRepoobj.GetEncodedProductData(req.body.alphanumeric).then((encodedProdData) => {
      if (!encodedProdData || encodedProdData.length < 1) {
        return res.status(400).send("Invalid Alphanumeric")
      }

      if (encodedProdData[0].dynamic_qr == "1") {
        if (encodedProdData[0].warranty === "availed") {
          console.log("avail")
          return res.status(400).send("Warranty already registered!")
        }

      }

      // console.log(encodedProductData + 'encode');
      customerRepoobj.GetProductCompanyId(encodedProdData[0].product_id
      ).then((compdata) => {

        if (compdata && compdata.length > 0) {
          //const business_use_otp = parseInt(compdata[0].botp) by Vikash
          const business_use_otp = parseInt("1")
          // const default_use_otp = parseInt(compdata[0].dcotp)
          // const use_mock_otp = parseInt(compdata[0].use_mock_otp)
          const use_mock_otp = parseInt("1")
          //const mock_otp = compdata[0].mock_otp by Vikas
          const mock_otp = "1234"

          if (business_use_otp) {
            //if (business_use_otp === 1 || (business_use_otp === 2 && default_use_otp === 1)) { by Vikash


            if (business_use_otp === 1) {
              const phone_number = req.body.phone_number
              //const otp = req.body.otp ? req.body.otp : '1234' by Vikash
              const otp = req.body.otp
              if (!otp) {
                return res.status(400).send("otp is required")
              }
              else {
                if (use_mock_otp) {
                  //if (otp != mock_otp) { by vikash
                  if (otp == mock_otp) {
                    res.status(400).send({ error: "Wrong OTP!" })
                  }
                  else {
                    customerManager
                      .AvailWarranty(i, p_img, encodedProdData[0].product_id)
                      .then(({ customer_id, result3, link }) => {
                        console.log(link);
                        var accessToken = jwt.sign({ userId: customer_id }, JWT_SECRET, {
                          expiresIn: process.env.SESSION_TIMEOUT_CUSTOMER,
                        });
                        console.log(accessToken);
                        return res
                          .cookie('accessToken', accessToken, {
                            httpOnly: true,
                            secure: true,
                          })
                          .status(200)
                          .json({
                            accessToken,
                            user: {
                              role: 'customer',
                              id: result3[0].uid,
                              name: result3[0].name,
                              date_of_birth: result3[0].date_of_birth,
                              mobile: result3[0].mobile,
                              email: result3[0].email,
                            },
                            review_url: review_link,
                            use_installation_form: compdata[0].use_installation_form,
                            is_installation_required: compdata[0].is_installation_required,
                            alert_message: msg
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        return res.status(404).send(error);
                      });
                  }
                }
                else {
                  console.log("in bs")
                  customerManager.verifyOTP(req.body.phone_number, otp, "wreg").then((verified) => {
                    customerManager
                      .AvailWarranty(i, p_img, encodedProdData[0].product_id)
                      .then(({ customer_id, result3, link }) => {
                        console.log(link);
                        var accessToken = jwt.sign({ userId: customer_id }, JWT_SECRET, {
                          expiresIn: process.env.SESSION_TIMEOUT_CUSTOMER,
                        });
                        console.log(accessToken);
                        console.log(result3);
                        return res
                          .cookie('accessToken', accessToken, {
                            httpOnly: true,
                            secure: true,
                          })
                          .status(200)
                          .json({
                            accessToken,
                            user: {
                              role: 'customer',
                              id: result3[0].uid,
                              name: result3[0].name,
                              date_of_birth: result3[0].date_of_birth,
                              mobile: result3[0].mobile,
                              email: result3[0].email,
                            },
                            review_url: link,
                            use_installation_form: compdata[0].use_installation_form,
                            is_installation_required: compdata[0].is_installation_required
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        return res.status(404).send(error);
                      });

                  }).catch((err) => {
                    console.log("tatat" + err)
                    return res.status(400).send(err)
                  })
                }

              }
            }
            else {
              customerManager
                .AvailWarranty(i, p_img, encodedProdData[0].product_id)
                .then(({ customer_id, result3, link }) => {
                  console.log(link);
                  var accessToken = jwt.sign({ userId: customer_id }, JWT_SECRET, {
                    expiresIn: process.env.SESSION_TIMEOUT_CUSTOMER,
                  });
                  console.log(accessToken);
                  console.log(result3);
                  return res
                    .cookie('accessToken', accessToken, {
                      httpOnly: true,
                      secure: true,
                    })
                    .status(200)
                    .json({
                      accessToken,
                      user: {
                        role: 'customer',
                        id: result3[0].uid,
                        name: result3[0].name,
                        date_of_birth: result3[0].date_of_birth,
                        mobile: result3[0].mobile,
                        email: result3[0].email,
                      },
                      review_url: link,
                      use_installation_form: compdata[0].use_installation_form,
                      is_installation_required: compdata[0].is_installation_required
                    });
                })
                .catch((error) => {
                  console.log(error);
                  return res.status(404).send(error);
                });
            }


          }

          else {
            customerManager
              .AvailWarranty(i, p_img, encodedProdData[0].product_id)
              .then(({ customer_id, result3, link }) => {
                console.log(link);
                var accessToken = jwt.sign({ userId: customer_id }, JWT_SECRET, {
                  expiresIn: process.env.SESSION_TIMEOUT_CUSTOMER,
                });
                console.log(accessToken);
                console.log(result3);
                return res
                  .cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: true,
                  })
                  .status(200)
                  .json({
                    accessToken,
                    user: {
                      role: 'customer',
                      id: result3[0].uid,
                      name: result3[0].name,
                      date_of_birth: result3[0].date_of_birth,
                      mobile: result3[0].mobile,
                      email: result3[0].email,
                    },
                    review_url: link,
                    use_installation_form: compdata[0].use_installation_form,
                    is_installation_required: compdata[0].is_installation_required
                  });
              })
              .catch((error) => {
                console.log(error);
                return res.status(404).send(error);
              });
          }

        }
        else {
          return reject("Invalid Request")
        }

      }).catch((err) => {
        return res.status(404).send(err);
      })
    }).catch((err) => {
      return res.status(404).send(err);
    })

  }
);

app.post('/customerProducts', (req, res) => {
  console.log(req.body);
  customerManager
    .CustomerProducts(req.body)
    .then((result) => {
      console.log("customer_Product_result");
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.get('/product_purchase_options', (req, res) => {
  operatorManager
    .ProductPurchaseOptions(req.query.alphanumeric)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post(
  '/print_masterQR',
  CompanyUserApiValidatorobj.printMasterQRValidator(),
  commonHelperObj.checkforerrors,
  (req, res) => {
    let i = req.body;
    console.log(i);

    if (parseInt(i.quantity) >= parseInt(process.env.QR_QUANTITY)) {
      res
        .status(400)
        .send(
          `You can generate PDF with ${process.env.QR_OVERALL - 1
          } QRs max! Please try with lesser number of QRs.`
        );
    } else if (parseInt(i.QR_copies) >= parseInt(process.env.QR_COPIES)) {
      res
        .status(400)
        .send(
          `You can generate PDF with ${process.env.QR_OVERALL - 1
          } QRs max! Please try with lesser number of QRs.`
        );
    } else if (
      parseInt(i.QR_copies) * parseInt(i.quantity) >=
      parseInt(process.env.QR_OVERALL)
    ) {
      res
        .status(400)
        .send(
          `You can generate PDF with ${process.env.QR_OVERALL - 1
          } QRs max! Please try with lesser number of QRs.`
        );
    } else {
      operatorManager
        .PrintMasterQR(req.body)
        .then((pdfUrl) => {
          res.status(200).send(pdfUrl);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send(err.message);
        });
    }
  }
);
app.post('/print_custom_QR', (req, res) => {
  operatorManager
    .PrintCustomQR(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/send_email', (req, res) => {
  customerManager
    .SendTestEmail(req.body)
    .then(() => {
      res.status(200).send('Success');
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/customerSeller_token', (req, res) => {
  customerManager
    .CustomerSellerDetails(req.body)
    .then(({ accessToken, user }) => {
      res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .json({
          accessToken,
          status: true,
          user: user,
        });
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/load_factory_operator', (req, res) => {
  operatorManager
    .LoadFactoryOperator(req.body)
    .then(({ accessToken, user }) => {
      res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
        })
        .status(200)
        .json({
          accessToken,
          user,
        });
    });
});

const storage2 = multer.memoryStorage(); // store file in memory
const upload2 = multer({ storage: storage2 });

app.post('/get_invoice', upload2.single('invoice'), async (req, res) => {
  try {
    const { file } = req;
    const asin_or_fsn = req.body.asin_or_fsn;


    const fileType = file.mimetype;
    let invoiceNumber = null;
    let extractedData = null;
    let extractedText = null;

    if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png') {
      // Handle JPG/JPEG images
      extractedData = await extractFromImage(file.buffer);
      extractedText = extractedData.textData;
      invoiceNumber = extractedData.getInvoiceNumber;


    } else if (fileType === 'application/pdf') {
      // Handle PDF files
      extractedData = await extractFromPDF(file.buffer);
      extractedText = extractedData.textData;
      invoiceNumber = extractedData.getInvoiceNumber;
    }

    const comparedData = extractedText.includes(asin_or_fsn);

    if (invoiceNumber) {
      return res.status(200).send({ invoiceNumber, comparedData });
    } else {
      return res.status(200).send({ invoiceNumber: "" , comparedData});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});


// app.post('/get_asin', upload2.single('invoice'), async (req, res) => {
//   try {
//     const { file } = req;
//     const ASIN = "B0CKVRWCHJ";

//     const fileType = file.mimetype;
//     let invoiceNumber = null;

//     if (fileType === 'application/pdf') {


//       // Handle PDF files
//       let extractedData = await extractFromPDF(file.buffer);
//       var extractedText = extractedData.textData;
//       invoiceNumber = extractedData.getInvoiceNumber;
//     }

//     const comparedData = extractedText.includes(ASIN);

//     if (invoiceNumber) {
//       return res.status(200).send({ invoiceNumber, comparedData  });
//     } else {
//       return res.status(200).send({ invoiceNumber: "" , comparedData});
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ message: 'Internal server error' });
//   }
// });



// Helper function to extract invoice number from text
const extractInvoiceNumber = (text) => {
  // Basic regex for finding invoice number (this can be customized)

  const match = text?.match(/(?:Invoice\s*(?:No|Number|#)\s*[:\-]?\s*([A-Za-z0-9\-#]+))/i);
  return match ? match[1] : '';
};


// OCR Function for images (JPG, JPEG)
const extractFromImage = (imageBuffer) => {
  return new Promise((resolve, reject) => {
    tesseract.recognize(imageBuffer, 'eng', {
    })
      .then(({ data: { text } }) => {
        const getInvoiceNumber = extractInvoiceNumber(text);
        let Data ={
          getInvoiceNumber,
          textData: text
        }
        resolve(Data);
      })
      .catch(reject);
  });
};

// PDF extraction function
const extractFromPDF = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    pdfParse(pdfBuffer)
      .then((data) => {
        const getInvoiceNumber = extractInvoiceNumber(data.text);
        let Data ={
          getInvoiceNumber,
          textData: data.text
        }
        resolve(Data);
      })
      .catch(reject);
  });
};


// Preprocess the image (convert to grayscale, apply thresholding)
// const preprocessImage = (imageBuffer) => {
//   return sharp(imageBuffer)
//     .grayscale()               // Convert image to grayscale
//     .normalize()               // Improve contrast
//     .threshold(128)            // Apply thresholding
//     .toBuffer();              // Return the processed image buffer
// };


module.exports = app;
