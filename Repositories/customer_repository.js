const db = require('../Database_connection/db');
const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const mandrill = require('mandrill-api');
const mandrillClient = new mandrill.Mandrill('md-sl1DHKaFRHr5yC8dh-50Yg');
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
const MailConstants = require('../MicroServices/mail_constants');
const e = require('cors');
const mail_constants = new MailConstants();
const msg91OTP = require('msg91-lib').msg91OTP;
const msg91otp = new msg91OTP({
  authKey: '388243AutttOTXECf63bc5788P1',
  templateId: '63bd363ed6fc0537b36cc522',
});
const http = require('https');
class CustomerRepository {
  constructor() {
    AWS.config.update({
      accessKeyId: 'YOUR_ACCESS_KEY',
      secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
      region: 'YOUR_AWS_REGION', // e.g., 'us-west-2'
    });
  }
  isUserRegistered(phone_number) {
    return new Promise((resolve, reject) => {
      db.query(
        "select id from customerSeller_user where phone_number=? and role='customer'",
        [phone_number],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            if (result.length < 1) {
              return resolve({ status: false, result: null });
            } else {
              return resolve({ status: true, result });
            }
          }
        }
      );
    });
  }
  RegisterUserWhileAvailingWarranty(i) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into customerSeller_user(role,phone_number) values (?,?)',
        ['customer', i.phone_number],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            db.query(
              "select id from customerSeller_user where phone_number=? and role='customer'",
              [i.phone_number],
              (err, idResult) => {
                if (err) {
                  console.log(err);
                  return reject(err);
                } else {
                  let customer_id = idResult[0].id;
                  db.query(
                    'insert into customer_details(name,business_id,email) values (?,?,?)',
                    [i.name, customer_id, i.email],
                    (err, userDetailsResult) => {
                      console.log(userDetailsResult, "userDetailsResult");
                      if (err) {
                        console.log(err);
                        return reject(err);
                      } else {
                        return resolve(customer_id);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  }


  findWarrantyAvailedCustomer(alphanumeric, customer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select wad.id as wad_id ,invoice as invoice_link from warranty_availed_data wad  where wad.alphanumeric=? and wad.customer_id=?',
        [alphanumeric, customer_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result);
          }
        }
      );
    });
  }


  SaveInstallationFormData({
    fk_wad_id,
    customer_id,
    alphanumeric,
    contact_name,
    contact_number,
    contact_address,
    installation_date,
    installation_time,
    request_date_time,
    other_details
  }) {
    return new Promise((resolve, reject) => {
      let installation_status = "pending";
      const sql = `
        INSERT INTO user_installation_details 
        (fk_wad_id,customer_id, alphanumeric, contact_name, contact_number, contact_address, installation_date, installation_time, request_date_time, other_details, installation_status)
        VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        fk_wad_id,
        customer_id,
        alphanumeric,
        contact_name,
        contact_number,
        contact_address,
        installation_date,
        installation_time,
        request_date_time,
        other_details,
        installation_status
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(result.insertId);
        }
      });
    });
  }
  GetProductCompanyId(product_id) {
    console.log(product_id);
    return new Promise((resolve, reject) => {
      //        'select bu.use_installation_form,bu.send_installation_mail,bu.use_warranty_reg_otp as botp, pd.product_name,pd.is_installation_required,pd.company_id ,dc.use_reg_otp as dcotp ,dc.is_mock_otp as use_mock_otp , dc.mock_otp as mock_otp  from default_config dc,business_user bu inner join (select product_name,company_id,is_installation_required from product_list where id=?)as pd on bu.business_id=pd.company_id where dc.id=1 ', by Vikash
      db.query(
        'select installation_details, product_name, company_id from lp_product_list where product_id =? ',
        [product_id],
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            result2[0].use_installation_form = result2[0].installation_details;
            result2[0].send_installation_mail = result2[0].installation_details;

            console.log("prev-otp-data", result2);
            return resolve(result2);
          }
        }
      );
    });
  }


  // checkSendInstallationMail(product_id) {
  //   console.log(product_id);
  //   return new Promise((resolve, reject) => {
  //     db.query(
  //       'select bu.use_warranty_reg_otp as botp, pd.product_name,pd.company_id ,dc.use_reg_otp as dcotp ,dc.is_mock_otp as use_mock_otp , dc.mock_otp as mock_otp  from default_config dc,business_user bu inner join (select product_name,company_id from product_list where id=?)as pd on bu.business_id=pd.company_id where dc.id=1 ',
  //       [product_id],
  //       (err, result2) => {
  //         if (err) {
  //           return reject(err);
  //         } else {
  //           console.log(result2);
  //           return resolve(result2);
  //         }
  //       }
  //     );
  //   });
  // }
  AvailWarranty(i, customer_id, p_img, product_id) {
    return new Promise((resolve, reject) => {
      micro_service
        .AddImage(p_img, 'warranty_invoice')
        .then((invoiceUrl) => {
          let source, city, state, country, latitude, longitude
          if (i.purchased_from == 'Other') {
            i.purchased_from = 'Other:' + i.other_source;
          }

          let current_dateTime = new Date();
          this.GetProductCompanyId(product_id)
            .then((comp) => {
              db.query(
                'insert into warranty_availed_data(company_id,customer_id,alphanumeric,name,phone_number,email,purchased_from,invoice,product_id,created_on,source,IP_city,IP_state,IP_country,longitude,latitude, invoiceNumber, dynamic_qr) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?)',
                [
                  comp[0].company_id,
                  customer_id,
                  i.alphanumeric,
                  i.name,
                  i.phone_number,
                  i.email,
                  i.purchased_from,
                  invoiceUrl,
                  product_id,
                  current_dateTime,
                  i.source,
                  i.IP_city,
                  i.IP_state,
                  i.IP_country,
                  i.longitude,
                  i.latitude,
                  i.invoiceNumber,
                  i.dynamic_qr
                ],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return reject(err);
                  } else {
                    db.query(
                      "update lp_encoded_product set warranty='availed' where alphanumeric=?",
                      [i.alphanumeric],
                      (err, result2) => {
                        if (err) {
                          console.log(err);
                          return reject(err);
                        } else {
                          db.query(
                            'update lp_encoded_product set warranty_registered=? where alphanumeric=?',
                            [new Date(), i.alphanumeric],
                            (err, result4) => {
                              if (err) {
                                console.log(err);
                                return reject(err);
                              } else {
                                db.query(
                                  'SELECT * from customer_details where business_id=?',
                                  [customer_id],
                                  (err, result3) => {
                                    console.log(result3, "result3");
                                    if (err) {
                                      console.log(err);
                                      return reject(err);
                                    } else {
                                      return resolve({ result3 });
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            })
            .catch((err) => {
              return reject(err);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  GetProductDetails(alphanumeric) {
    return new Promise((resolve, reject) => {
      let details = {
        serial_number: null,
        product_name: null,
        brand_name: null,
        warranty_period: null,
      };
      console.log(alphanumeric);
      db.query(
        'select product_id, serial_number from lp_encoded_product where alphanumeric=?',
        [alphanumeric],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            details.serial_number = result[0].serial_number;
            let product_id = result[0].product_id;
            db.query(
              'select product_name,company_id from lp_product_list where product_id=?',
              [result[0].product_id],
              (err, result2) => {
                if (err) {
                  console.log(err);
                } else {
                  //  'select display_name from company_details where business_id=?', by Vikash
                  details.product_name = result2[0].product_name;
                  db.query(
                    'select company_name from landing_page_user where id=?',
                    [result2[0].company_id],
                    (err, result3) => {
                      if (err) {
                        console.log(err);
                      } else {
                        details.brand_name = result3[0].company_name;
                        //'select year,month from warranty where product_id=?',
                        db.query(
                          'select warranty_years as year, warranty_months as month from lp_product_list where product_id=?', [result[0].product_id],
                          (err, result4) => {
                            if (err) {
                              console.log(err);
                            } else {
                              let year = parseInt(result4[0].year);
                              let month = parseInt(result4[0].month);
                              if (
                                (year == 0 || year == null || isNaN(year)) &&
                                month == 1
                              )
                                details.warranty_period = `${month} month`;
                              else if (
                                (year == 0 || year == null || isNaN(year)) &&
                                month != 1
                              )
                                details.warranty_period = `${month} months`;
                              else if (
                                (year != 0 || year != null || year != 1) &&
                                (month == 0 || month == null || isNaN(month))
                              )
                                details.warranty_period = `${year} years`;
                              else if (
                                year == 1 &&
                                (month == 0 || month == null || isNaN(month))
                              )
                                details.warranty_period = `${year} year`;
                              else if (year == 1 && month == 1)
                                details.warranty_period = `${year} year and ${month} month`;
                              else if ((year != 1 || year != 0) && month == 1)
                                details.warranty_period = `${year} years and ${month} month`;
                              else if (year == 1 && (month != 1 || month != 0))
                                details.warranty_period = `${year} year and ${month} months`;
                              else
                                details.warranty_period = `${year} years and ${month} months`;
                              console.log(details);
                              return resolve({ details, product_id });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  }
  SendMail(
    email,
    customer_name,
    product_name,
    brand_name,
    serial_number,
    warranty_period
  ) {
    return new Promise(async (resolve, reject) => {
      const options = {
        method: 'POST',
        hostname: 'api.msg91.com',
        port: null,
        path: '/api/v5/email/send',
        headers: {
          'Content-Type': 'application/JSON',
          Accept: 'application/json',
          authkey: '388243AVWN4rSDNWk649efe0fP1',
        },
      };

      const req = http.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          console.log(body.toString());
          return resolve();
        });
      });
      let res = {
        to: [
          {
            name: customer_name,
            email: email,
          },
        ],
        from: {
          name: 'Onepoket',
          email: 'no-reply@mail.onepoket.com',
        },
        domain: 'mail.onepoket.com',
        template_id: 'Warranty_registration',
        variables: {
          VAR1: product_name,
          VAR2: customer_name,
          VAR3: product_name,
          VAR4: product_name,
          VAR5: serial_number,
          VAR6: warranty_period,
          VAR7: 'https://onepoket.com',
          VAR8: brand_name,
        },
      };
      req.write(JSON.stringify(res));
      req.end();
    });
  }

  PurchaseReviewLink(product_id, purchase_from) {
    return new Promise((resolve, reject) => {
      console.log(product_id);
      console.log(purchase_from);
      db.query(
        'select link from lp_purchase_options where product_id=? and title=?',
        [product_id, purchase_from],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            let link = '';
            if (result.length != 0) {
              link = result[0].link;
            }
            return resolve(link);
          }
        }
      );
    });
  }
  SendTestMail(toEmail, subject, message) {
    return new Promise((resolve, reject) => {
      const http = require('https');

      const options = {
        method: 'POST',
        hostname: 'api.msg91.com',
        port: null,
        path: '/api/v5/email/send',
        headers: {
          'Content-Type': 'application/JSON',
          Accept: 'application/json',
          authkey: '388243AVWN4rSDNWk649efe0fP1',
        },
      };

      const req = http.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          console.log(body.toString());
        });
      });
      let res = {
        to: [
          {
            name: 'Swapnil',

            email: ' swapnil@onepoket.com',
          },
        ],

        from: {
          name: 'Onepoket',

          email: 'no-reply@mail.onepoket.com',
        },

        domain: 'mail.onepoket.com',

        template_id: 'Warranty_registration',

        variables: {
          VAR1: 'VAR1 VALUE',

          VAR2: 'VAR2 VALUE',

          VAR3: 'VAR2 VALUE',

          VAR4: 'VAR2 VALUE',

          VAR5: 'VAR2 VALUE',

          VAR6: 'VAR2 VALUE',

          VAR7: 'VAR2 VALUE',

          VAR8: 'VAR2 VALUE',
        },
      };
      req.write(JSON.stringify(res));
      req.end();
    });
  }
  GetCustomerProducts(customer_id) {
    return new Promise((resolve, reject) => {
      //'select product_list.product_name,product_list.id,company_details.display_name as company_name,company_details.business_id as company_id,warranty_availed_data.alphanumeric from warranty_availed_data JOIN product_list on warranty_availed_data.product_id=product_list.id JOIN company_details on product_list.company_id=company_details.business_id WHERE warranty_availed_data.customer_id=? order by warranty_availed_data.created_on', by Vikash

      db.query(
        'select lp_product_list.product_image, lp_product_list.product_name,lp_product_list.product_id, landing_page_user.company_name,landing_page_user.id as company_id, warranty_availed_data.created_on, warranty_availed_data.alphanumeric, warranty_availed_data.invoiceNumber from warranty_availed_data JOIN lp_product_list on warranty_availed_data.product_id=lp_product_list.product_id JOIN landing_page_user on lp_product_list.company_id=landing_page_user.id WHERE warranty_availed_data.customer_id=? order by warranty_availed_data.created_on',
        [customer_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result);
          }
        }
      );
    });
  }
  GetCustomerProductImages(result) {
    return new Promise((resolve, reject) => {
      let response = [];
      for (let i = 0; i < result.length; i++) {
        db.query(
          'select product_image from lp_product_list where product_id=?',
          [result[i].product_id],
          (err, ImageResult) => {
            if (err) {
              return reject(err);
            } else {
              const resultData = ImageResult.map(image => ({
                product_image: image.product_image ? `data:image/jpeg;base64,${image.product_image.toString('base64')}` : null // Convert binary data to Base64
              }));
              result[i].images = resultData[0].product_image;
              if (i == result.length - 1) {
                return resolve(result);
              }
            }
          }
        );
      }
    });
  }
  GetSpecificRole(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from customerSeller_user where id=?',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            let role = result[0].role;
            let phone_number = result[0].phone_number;
            return resolve({ role, phone_number });
          }
        }
      );
    });
  }

  CheckUserBlocked(phone_number) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from customerSeller_user where phone_number=?',
        [phone_number],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            if (result && result.length <= 0) {
              return reject("User Not Registered!")
            }
            return resolve(result[0])
            // else{

            // }

          }
        }
      );
    });
  }
  BlockUser(phone_number) {
    return new Promise((resolve, reject) => {
      const blockTime = new Date()
      db.query(
        'update  customerSeller_user set is_blocked=1,blocked_at=? where phone_number=?',
        [blockTime, phone_number],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {

            db.query(
              `UPDATE otp SET resend_count=0,unsuccessful_attempt=0 WHERE phone = ?`,
              [phone_number],
              (err, result) => {
                if (err) {
                  return reject(err);
                } else {

                  return resolve(result)

                }
              })


          }
        }
      );
    });
  }

  UnBlockUser() {
    return new Promise((resolve, reject) => {
      const blockTime = process.env.BLOCKING_TIME / 1000
      db.query(
        'update  customerSeller_user set is_blocked=0,blocked_at=NULL,send_otp_count=0,last_otp_sent_at=NULL where  TIMESTAMPDIFF(SECOND, blocked_at, NOW()) >= ? and is_blocked=1',
        [blockTime],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {

            return resolve(result)


          }
        }
      );
    });
  }

  ResetSentOTPCount() {
    return new Promise((resolve, reject) => {
      const blockTime = process.env.MAX_SEND_OTP_WAIT_TIME / 1000
      db.query(
        'update  customerSeller_user set send_otp_count=0,last_otp_sent_at=NULL where  TIMESTAMPDIFF(SECOND, last_otp_sent_at, NOW()) >= ?',
        [blockTime],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {

            return resolve(result)


          }
        }
      );
    });
  }

  UpdateSentOTPCount(phone, count) {
    return new Promise((resolve, reject) => {
      const last_sent_at = new Date()

      db.query(
        'update  customerSeller_user set send_otp_count=?,last_otp_sent_at=? where phone_number=?',
        [count, last_sent_at, phone],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {

            return resolve(result)


          }
        }
      );
    })

  }


  GetCustomerDetails(id, phone_number) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from customer_details where business_id=?',
        [id],
        (err, result1) => {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            console.log(result1);
            let user = {
              role: 'customer',
              email: result1[0].email,
              id: result1[0].business_id,
              avatarUrl: result1[0].avatarImage,
              name: result1[0].name,
              date_of_birth: result1[0].date_of_birth,
              phone_number: phone_number,
            };
            return resolve(user);
          }
        }
      );
    });
  }
  GetSellerDetails(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from seller_details where business_id=?',
        [id],
        (err, result1) => {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            let user = {
              role: 'seller',
              email: result1[0].email,
              id: result1[0].business_id,
              avatarUrl: result1[0].avatarImage,
              address: result1[0].address,
              gst: result1[0].gst,
              phone_number: phone_number,
              shop_name: result1[0].shop_name,
              owner_name: result1[0].owner_name,
              state: result1[0].state,
              city: result1[0].city,
            };
            return resolve(user);
          }
        }
      );
    });
  }
  CustomerProductDetails(alphanumeric, customer_id) {
    return new Promise((resolve, reject) => {
      //'select bu.use_installation_form,pl.is_installation_required,pl.product_desc_for_customer, wad.created_on,w.year,w.month,pl.product_name,pi.image,cd.display_name as company_name,cd.helpline_number,cd.helpline_email from warranty_availed_data wad join  product_list pl on pl.id = wad.product_id join warranty w on pl.id = w.product_id join company_details cd on pl.company_id = cd.business_id join business_user bu on bu.business_id=pl.company_id  join product_image pi on pi.product_id=pl.id where wad.alphanumeric=? and wad.customer_id=?', by vikash

      db.query(
        'select pl.product_id, pl.company_id, pl.installation_details as is_installation_required,pl.model_number as product_model, pl.description as product_description, pl.product_desc_for_customer, wad.customer_id, wad.created_on, wad.invoice, wad.invoiceNumber, pl.warranty_years as year,pl.warranty_years as month,pl.product_name,pl.product_image,lpu.company_name,lpu.phone_number as helpline_number,lpu.email as helpline_email from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id join landing_page_user lpu on pl.company_id = lpu.id  where wad.alphanumeric=? and wad.customer_id=?',
        [alphanumeric, customer_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result);
          }
        }
      );
    });
  }
  InsertScanData(encodedProductData, alphanumeric) {
    return new Promise((resolve, reject) => {

      db.query(
        ' insert into total_qr_scans(fk_encoded_product_id,alphanumeric,scanned_at) values(?,?,?)',
        [encodedProductData[0].id, alphanumeric, new Date()], (err, total_scan) => {
          if (err) {
            return reject(err);

          } else {
            if (encodedProductData[0].warranty === "availed") {
              db.query(
                ' insert into red_qr_scans(fk_encoded_product_id,alphanumeric,scanned_at) values(?,?,?)',
                [encodedProductData[0].id, alphanumeric, new Date()], (err, red_qr_scans) => {
                  if (err) {
                    return reject(err);

                  } else {
                    return resolve(encodedProductData);

                  }
                })
            }
            else {
              return resolve(encodedProductData);

            }



          }
        })
    })

  }
  GetEncodedProductData(alphanumeric) {
    //'select id, product_id,warranty,serial_number,print  from encoded_product where alphanumeric=?', by vikash

    return new Promise((resolve, reject) => {
      db.query(
        'select id, product_id,warranty,serial_number,print, dynamic_qr from lp_encoded_product where alphanumeric=?',
        [alphanumeric],
        (err, encodedProductData) => {
          console.log(encodedProductData);
          if (err) {
            return reject(err);
          } else {
            if (encodedProductData && encodedProductData.length > 0) {
              // let total_qr_scans=Number(encodedProductData[0].total_qr_scans)+1
              // let red_qr_scans=Number(red_qr_scans)+1

              return resolve(encodedProductData)

            }
            else {
              return reject("Invalid alphanumeric")
            }
          }
        }
      );
    });
  }
  GetProductData(product_id) {
    return new Promise((resolve, reject) => {
      // 'select product_name,product_description,product_model,id,showManufactureDate,logo from product_list where id=?', By Vikash

      db.query(
        'select product_name, description, model_number, product_id, show_manufacture_date, logo_id, installation_details as is_installation_required, model_number from lp_product_list where product_id=?',
        [product_id],
        (err, productData) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(productData);
          }
        }
      );
    });
  }
  GetProductImages(product_id) {
    return new Promise((resolve, reject) => {
      //'select * from product_image where product_id=?', by vikash
      db.query(
        'select product_image, company_id from lp_product_list where product_id=?',
        [product_id],
        (err, productImages) => {
          if (err) {
            return reject(err);
          } else {
            const images = productImages.map(image => ({
              company_id: image.company_id,
              image: image.product_image ? `data:image/jpeg;base64,${image.product_image.toString('base64')}` : null // Convert binary data to Base64
            }));
            return resolve(images);
          }
        }
      );
    });
  }
  GetProductCategory(product_id) {
    return new Promise((resolve, reject) => {
      //'select * from product_category where product_id=?', by Vikash
      db.query(
        'select category_title from lp_product_list where product_id=?',
        [product_id],
        (err, productCategory) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(productCategory);
          }
        }
      );
    });
  }
  GetProductVideo(product_id) {
    return new Promise((resolve, reject) => {
      // 'select * from product_videos where product_id=?', by Vikash
      db.query(
        'select product_video_link from lp_product_list where product_id=?',
        [product_id],
        (err, productVideo) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(productVideo);
          }
        }
      );
    });
  }
  GetAdditionalInfo(product_id) {
    return new Promise((resolve, reject) => {
      //'select * from additional_info where product_id=?', by Vikash
      db.query(
        'select * from lp_additional_info where product_id=?',
        [product_id],
        (err, productAdditionalInfo) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(productAdditionalInfo);
          }
        }
      );
    });
  }
  GetProductLogo(company_id, logo) {
    return new Promise((resolve, reject) => {
      if (logo == null) {
        // 'select avatarUrl from company_details where business_id in(select company_id from product_list where id=?)', by Vikash
        // db.query(
        //   'select image from image where company_id in(select company_id from lp_product_list where product_id=?)',
        //   [product_id],
        //   (err, avatar) => {
        //     if (err) {
        //       return reject(err);
        //     } else {
        //       const avatarUrl = avatar.map(image => ({
        //         image: image.image ? `data:image/jpeg;base64,${image.image.toString('base64')}`: null // Convert binary data to Base64
        //       }));
        //       return resolve(avatarUrl);
        //     }
        //   }
        // );
        let message = "Logo is required";
        console.log(message);
        return reject(message);
      } else {
        //'select logo as avatarUrl from company_logo where id=?', by Vikash
        db.query(
          'select image from image where id=? AND company_id=?',
          [logo, company_id],
          (err, logo_image) => {
            if (err) {
              return reject(err);
            } else {
              const avatarUrl = logo_image.map(image => ({
                image: image.image ? `data:image/jpeg;base64,${image.image.toString('base64')}` : null // Convert binary data to Base64
              }));
              return resolve(avatarUrl);
            }
          }
        );
      }
    });
  }

  getInstallationMailCredentials(business_id) {
    console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select helpline_email from landing_page_user where id=?',
        [business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result)
            return resolve(result)

          }
        }
      );


    });
  }

  getInstallationFormDataByAlphanumeric(alphanumeric) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select * from user_installation_details where alphanumeric=?',
        [alphanumeric],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result)
            return resolve(result)

          }
        }
      );


    });
  }


}

module.exports = CustomerRepository;


