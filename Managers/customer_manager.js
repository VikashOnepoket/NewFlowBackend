const CustomerRepository = require('../Repositories/customer_repository');
const customer_repo = new CustomerRepository();
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
const Company_customer_token_expiry = process.env.SESSION_TIMEOUT_CUSTOMER;
const sendMail = require('../MicroServices/email');

class CustomerManager {
  AvailWarranty(body, p_img, product_id) {
    return new Promise((resolve, reject) => {
      console.log(body, "body");


      customer_repo
        .isUserRegistered(body.phone_number)
        .then(({ status, result }) => {
          if (status == false) {
            customer_repo
              .RegisterUserWhileAvailingWarranty(body)
              .then((customer_id) => {


                customer_repo
                  .AvailWarranty(
                    body,
                    customer_id,
                    p_img,
                    product_id
                  )
                  .then(({ result3 }) => {
                    customer_repo
                      .GetProductDetails(body.alphanumeric)
                      .then(({ details, product_id }) => {
                        // customer_repo.PurchaseReviewLink(product_id,body.purchased_from)
                        //     .then((link)=>{
                        //         console.log("link_result")
                        //         console.log(link)
                        //         return resolve({customer_id,result3,link})
                        //     })
                        // console.log(details)
                        customer_repo
                          .SendMail(
                            body.email,
                            body.name,
                            details.product_name,
                            details.brand_name,
                            details.serial_number,
                            details.warranty_period
                          )
                          .then(() => {
                            console.log('mail sent');
                            customer_repo
                              .PurchaseReviewLink(
                                product_id,
                                body.purchased_from
                              )
                              .then((link) => {
                                console.log('link_result');
                                console.log(link);
                                return resolve({
                                  customer_id,
                                  result3,
                                  link,
                                });
                              });
                          })
                          .catch((error) => {
                            console.log(error);
                            // return reject(error)
                          });
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    // return reject(error)
                  });
              })
              // .catch((err) => {
              //   return reject(err);
              // });
              // })
              .catch((error) => {
                console.log(error);
                // return reject(error)
              });
          } else if (status == true) {
            let customer_id = result[0].id;
            // customer_repo
            //   .GetEncodedProductData(body.alphanumeric)
            //   .then((encodedProductData) => {
            // console.log(encodedProductData);
            // if (!encodedProductData || encodedProductData.length < 1) {
            //   return reject('Product Not Found!');
            // }
            customer_repo
              .AvailWarranty(
                body,
                customer_id,
                p_img,
                product_id
              )
              .then(({ result3 }) => {
                customer_repo
                  .GetProductDetails(body.alphanumeric)
                  .then(({ details, product_id }) => {
                    // customer_repo.PurchaseReviewLink(product_id,body.purchased_from)
                    //         .then((link)=>{
                    //             console.log(link)
                    //             return resolve({customer_id,result3,link})
                    //         })
                    customer_repo
                      .SendMail(
                        body.email,
                        body.name,
                        details.product_name,
                        details.brand_name,
                        details.serial_number,
                        details.warranty_period
                      )
                      .then(() => {
                        customer_repo
                          .PurchaseReviewLink(
                            product_id,
                            body.purchased_from
                          )
                          .then((link) => {
                            console.log(link);
                            return resolve({ customer_id, result3, link });
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        // return reject(error)
                      });
                  });
              })
              .catch((error) => {
                console.log(error);
                return reject(error);
              });
            // })
            // .catch((err) => {
            //   return reject(err);
            // });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
  SendTestEmail(body) {
    return new Promise((resolve, reject) => {
      customer_repo
        .SendTestMail(body.toEmail, body.subject, body.message)
        .then(() => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  CustomerProducts(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((customer_id) => {
          console.log(customer_id);
          customer_repo
            .GetCustomerProducts(customer_id)
            .then((result) => {
              return resolve(result); // by vikash
              // customer_repo
              //   .GetCustomerProductImages(result)
              //   .then((details) => {
              //     return resolve(details);
              //   })
              //   .catch((err) => {
              //     return reject(err);
              //   });
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
  CustomerProductDetails(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((customer_id) => {
          customer_repo
            .CustomerProductDetails(body.alphanumeric, customer_id)
            .then((result) => {
              return resolve(result);
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


  fetchInstallationFormDataByAlphanumeric(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((customer_id) => {
          customer_repo.getInstallationFormDataByAlphanumeric(body.alphanumeric).then((alpha_data) => {
            let result = {}
            if (alpha_data.length >= 1) {
              result = {
                is_form_submitted: 1,
                form_data: alpha_data[0]
              }
            }
            else {
              result = {
                is_form_submitted: 0,
                form_data: []
              }
            }
            return resolve(result)
          })
        }).catch((err) => {
          console.log(err)
          return reject(err)
        })

    })
  }


  SaveProductInstallationFormData(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((customer_id) => {
          customer_repo.getInstallationFormDataByAlphanumeric(body.alphanumeric).then((alpha_data) => {
            if (alpha_data.length >= 1) {
              return reject("Installation Request already made for this product!")
            }

            customer_repo.findWarrantyAvailedCustomer(body.alphanumeric, customer_id)
              .then((result) => {
                if (result.length <= 0) {
                  return reject("Product Does not belong to you!")
                }

                const { installation_time } = body;

                // Create a Date object with a specific date (January 1, 1970) and the provided time
                // const dateWithSpecificTime = new Date(`${body.installation_date}T${installation_time}`);
                // console.log(dateWithSpecificTime)
                // const dateWithSpecificTime = new Date(`${body.installation_date}T${installation_time}`);
                // console.log(dateWithSpecificTime)

                customer_repo.GetEncodedProductData(body.alphanumeric).then((encodedProdData) => {
                  if (!encodedProdData || encodedProdData.length < 1) {
                    return res.status(400).send("Invalid Alphanumeric")
                  }



                  customer_repo.GetProductCompanyId(encodedProdData[0].product_id
                  ).then((compdata) => {

                    if (compdata && compdata.length > 0) {

                      const use_installation_form = parseInt(compdata[0].use_installation_form)
                      const product_installation_required = parseInt(compdata[0].installation_details)
                      const send_mail = parseInt(compdata[0].send_installation_mail)
                      if (!use_installation_form || !product_installation_required) {
                        return reject("Installation form not allowed for this product")
                      }

                      customer_repo.SaveInstallationFormData({ fk_wad_id: result[0].wad_id, ...body, other_details: body.other_details ? body.other_details : '', customer_id: customer_id, request_date_time: new Date(), installation_date: new Date(body.installation_date), installation_time: installation_time }).then((res2) => {
                        console.log(res2)
                        if (send_mail) {

                          customer_repo.getInstallationMailCredentials(compdata[0].company_id).then((emailData) => {
                            if (emailData && emailData.length > 0) {

                              const info = sendMail({
                                toEmail: emailData[0].helpline_email,
                                subject: 'New Installation Service Request',
                                // text: `${emailFrom} shared a file with you.`,
                                html: require('../templates/installation-mail.template')({
                                  ...body,
                                  product_name: compdata[0].product_name,
                                  product_serial_no: encodedProdData[0].serial_number,
                                  invoice_link: result[0].invoice_link

                                }),
                              })
                                .then(() => {
                                  return true;
                                })
                                .catch((err) => {
                                  console.log(err + "erroro")
                                  throw new Error(err);
                                });

                            }



                          }).catch((err) => {
                            throw new Error(err);

                          })





                        }


                        return resolve(res2);
                      }).catch((err) => {
                        console.log(err)
                        return reject(err)
                      })

                    }
                    else {
                      return reject("Invalid Request!")
                    }

                  }).catch((err) => {
                    return reject(err)
                  })

                }).catch((err) => { return reject(err) })

              })
              .catch((err) => {
                console.log(err)
                return reject(err);
              });
          }).catch((err) => { return reject(err) })

        })
        .catch((err) => {
          console.log(err)
          return reject(err);
        });
    });
  }


  CustomerSellerDetails(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((id) => {
          customer_repo
            .GetSpecificRole(id)
            .then(({ role, phone_number }) => {
              if (role == 'customer') {
                customer_repo
                  .GetCustomerDetails(id, phone_number)
                  .then((user) => {
                    micro_service
                      .GenerateToken(id, process.env.SESSION_TIMEOUT_CUSTOMER)
                      .then((accessToken) => {
                        return resolve({ accessToken, user });
                      })
                      .catch((err) => {
                        return reject(err);
                      });
                  })
                  .catch((err) => {
                    return reject(err);
                  });
              } else if (role == 'seller') {
                customer_repo
                  .GetSellerDetails(id, phone_number)
                  .then((user) => {
                    micro_service
                      .GenerateToken(id, process.env.SESSION_TIMEOUT_CUSTOMER)
                      .then((accessToken) => {
                        return resolve({ accessToken, user });
                      })
                      .catch((err) => {
                        return reject(err);
                      });
                  });
              }
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
  isWarrantyAvailed(body) {
    return new Promise((resolve, reject) => {
      customer_repo
        .GetEncodedProductData(body.alphanumeric)
        .then((encodedProductData) => {
          let product_id = encodedProductData[0].product_id;
          let dynamic_qr = encodedProductData[0].dynamic_qr;



          if (!encodedProductData || encodedProductData.length < 1) {
            return res.status(400).send("Invalid Alphanumeric")
          }


          if (dynamic_qr == "1") {

            customer_repo.InsertScanData(encodedProductData, body.alphanumeric).then((scanData) => {
              customer_repo
                .GetProductData(product_id)
                .then((productData) => {
                  customer_repo
                    .GetProductImages(product_id)
                    .then((productImages) => {
                      customer_repo
                        .GetProductCategory(product_id)
                        .then((productCategory) => {
                          customer_repo
                            .GetProductVideo(product_id)
                            .then((productVideo) => {
                              customer_repo
                                .GetAdditionalInfo(product_id)
                                .then((productAdditionalInfo) => {
                                  customer_repo
                                    .GetProductLogo(productImages[0].company_id, productData[0].logo_id)
                                    .then((avatarUrl) => {
                                      customer_repo.GetProductCompanyId(encodedProductData[0].product_id
                                      ).then((compdata) => {
                                        let productDetails = {

                                          product_id: encodedProductData[0].product_id,
                                          warranty: encodedProductData[0].warranty,
                                          dynamic_qr: encodedProductData[0].dynamic_qr,
                                          serial_number: encodedProductData[0].serial_number,
                                          added_at: encodedProductData[0].print,
                                          product_name: productData[0].product_name,
                                          product_description: productData[0].description,
                                          product_model: productData[0].model_number,
                                          showManufactureDate: productData[0].show_manufacture_date,
                                          images: productImages,
                                          category: productCategory,
                                          video: productVideo,
                                          additionalInfo: productAdditionalInfo,
                                          //avatarUrl: avatarUrl[0].avatarUrl, by Vikash
                                          avatarUrl: avatarUrl[0].image,
                                          use_otp: 0,
                                          use_mock_otp: 0
                                        };

                                        if (compdata && compdata.length > 0) {
                                          const business_use_otp = parseInt(compdata[0].botp)
                                          const default_use_otp = parseInt(compdata[0].dcotp)
                                          const use_mock_otp = parseInt(compdata[0].use_mock_otp)

                                          productDetails.use_mock_otp = use_mock_otp
                                          productDetails.use_installation_form = compdata[0].use_installation_form
                                          productDetails.is_installation_required = productData[0].is_installation_required

                                          if (business_use_otp) {

                                            if (business_use_otp === 1 || (business_use_otp === 2 && default_use_otp === 1)) {

                                              productDetails.use_otp = 1


                                            }

                                          }

                                        }

                                        return resolve(productDetails)

                                      }).catch((err) => { throw err })



                                    })
                                    .catch((err) => {
                                      return reject(err);
                                    });
                                })
                                .catch((err) => {
                                  return reject(err);
                                });
                            })
                            .catch((err) => {
                              return reject(err);
                            });
                        })
                        .catch((err) => {
                          return reject(err);
                        });
                    })
                    .catch((err) => {
                      return reject(err);
                    });
                })
                .catch((err) => {
                  return reject(err);
                });

            }).catch((err) => {
              return reject(err);
            })

          } else {
            customer_repo.GetProductData(product_id)
              .then((productData) => {
                customer_repo
                  .GetProductImages(product_id)
                  .then((productImages) => {
                    customer_repo
                      .GetProductCategory(product_id)
                      .then((productCategory) => {
                        customer_repo
                          .GetProductVideo(product_id)
                          .then((productVideo) => {
                            customer_repo
                              .GetAdditionalInfo(product_id)
                              .then((productAdditionalInfo) => {
                                customer_repo
                                  .GetProductLogo(productImages[0].company_id, productData[0].logo_id)
                                  .then((avatarUrl) => {
                                    customer_repo.GetProductCompanyId(encodedProductData[0].product_id
                                    ).then((compdata) => {
                                      let productDetails = {

                                        product_id: encodedProductData[0].product_id,
                                        warranty: "unavailed",
                                        dynamic_qr: encodedProductData[0].dynamic_qr,
                                        serial_number: encodedProductData[0].serial_number,
                                        added_at: encodedProductData[0].print,
                                        product_name: productData[0].product_name,
                                        product_description: productData[0].description,
                                        product_model: productData[0].model_number,
                                        showManufactureDate: productData[0].show_manufacture_date,
                                        images: productImages,
                                        category: productCategory,
                                        video: productVideo,
                                        additionalInfo: productAdditionalInfo,
                                        //avatarUrl: avatarUrl[0].avatarUrl, by Vikash
                                        avatarUrl: avatarUrl[0].image,
                                        use_otp: 0,
                                        use_mock_otp: 0
                                      };

                                      if (compdata && compdata.length > 0) {
                                        const business_use_otp = parseInt(compdata[0].botp)
                                        const default_use_otp = parseInt(compdata[0].dcotp)
                                        const use_mock_otp = parseInt(compdata[0].use_mock_otp)

                                        productDetails.use_mock_otp = use_mock_otp
                                        productDetails.use_installation_form = compdata[0].use_installation_form
                                        productDetails.is_installation_required = productData[0].is_installation_required

                                        if (business_use_otp) {

                                          if (business_use_otp === 1 || (business_use_otp === 2 && default_use_otp === 1)) {

                                            productDetails.use_otp = 1


                                          }

                                        }

                                      }

                                      return resolve(productDetails)

                                    }).catch((err) => { throw err })



                                  })
                                  .catch((err) => {
                                    return reject(err);
                                  });
                              })
                              .catch((err) => {
                                return reject(err);
                              });
                          })
                          .catch((err) => {
                            return reject(err);
                          });
                      })
                      .catch((err) => {
                        return reject(err);
                      });
                  })
                  .catch((err) => {
                    return reject(err);
                  });
              })
              .catch((err) => {
                return reject(err);
              });

          }





          // if(encodedProdData[0].warranty==="availed"){
          //   console.log("avail")
          //   return res.status(400).send("Warranty already registered!")
          // }
          // console.log(encodedProductData + 'encode');




        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  sendRegistrationOTP = async (phone, type, test, sms_template_id) => {
    try {

      if (!phone) {
        throw new Error("Invalid phone number, please enter 10 digits without +91 or 0")
      }


      // const userData = await customer_repo.CheckUserBlocked(phone)
      // if (userData.is_blocked) {
      //   throw new Error(`This phone number has Been Blocked for ${process.env.BLOCKING_TIME / (1000 * 60 * 60)} hour(s), please try again later.`)
      // }
      // if (userData.send_otp_count >= process.env.MAX_SEND_OTP_COUNT) {
      //   if (Date.now() - userData.last_otp_sent_at <= process.env.MAX_SEND_OTP_WAIT_TIME) {
      //     throw new Error(`OTP  Send limit exceeded! please try after ${process.env.MAX_SEND_OTP_WAIT_TIME / (1000 * 60 * 60)} hour(s)`)


      //   }

      // }


      const send_otp_count = 0;

      const Otpsend = await micro_service.sendOTP(phone, type, test, sms_template_id)
      console.log(Otpsend + "otpjs")
      //const otpCount = userData.send_otp_count + 1;
      const otpCount = send_otp_count + 1;
      const updateCount = await customer_repo.UpdateSentOTPCount(phone, otpCount)
      //Otpsend.send_count_left = process.env.MAX_SEND_OTP_COUNT - (userData.send_otp_count + 1)
      Otpsend.send_count_left = process.env.MAX_SEND_OTP_COUNT - (send_otp_count + 1)
      return Otpsend

    } catch (err) {
      if (err.message)
        throw err.message
      else
        throw err
    }
  }
  sendOTP = async (phone, type, test, sms_template_id) => {
    try {

      if (!phone) {
        throw new Error("Invalid phone number, please enter 10 digits without +91 or 0")
      }

      const userData = await customer_repo.CheckUserBlocked(phone)
      if (userData.is_blocked) {
        throw new Error(`This phone number has Been Blocked for ${process.env.BLOCKING_TIME / (1000 * 60 * 60)} hour(s), please try again later.`)
      }
      if (userData.send_otp_count >= process.env.MAX_SEND_OTP_COUNT) {
        if (Date.now() - userData.last_otp_sent_at <= process.env.MAX_SEND_OTP_WAIT_TIME) {
          throw new Error(`OTP  Send limit exceeded! please try after ${process.env.MAX_SEND_OTP_WAIT_TIME / (1000 * 60 * 60)} hour(s)`)


        }

      }





      const Otpsend = await micro_service.sendOTP(phone, type, test, sms_template_id)
      console.log(Otpsend + "otpjs")
      const otpCount = userData.send_otp_count + 1;
      const updateCount = await customer_repo.UpdateSentOTPCount(phone, otpCount)
      Otpsend.send_count_left = process.env.MAX_SEND_OTP_COUNT - (userData.send_otp_count + 1)
      return Otpsend

    } catch (err) {
      if (err.message)
        throw err.message
      else
        throw err
    }
  }
  resendOTP = async (phone, type, sms_template_id) => {
    try {


      if (!phone) {
        throw new Error("Invalid phone number, please enter 10 digits without +91 or 0")
      }
      const userData = await customer_repo.CheckUserBlocked(phone)
      if (userData.is_blocked) {
        throw new Error(`This phone number has Been Blocked for ${process.env.BLOCKING_TIME / (1000 * 60 * 60)} hour(s), please try again later.`)
      }
      if (userData.send_otp_count > process.env.MAX_SEND_OTP_COUNT) {
        if (Date.now() - userData.last__sent_at <= process.env.MAX_SEND_OTP_WAIT_TIME) {
          throw new Error(`OTP  Send limit exceeded! please try after ${process.env.MAX_SEND_OTP_WAIT_TIME / (1000 * 60 * 60)} hour(s)`)


        }

      }
      const Otpsend = await micro_service.resendOTP(phone, type, sms_template_id)
      if (Otpsend === "Block User") {
        const BlockUser = await customer_repo.BlockUser(phone)
        throw new Error(`Max resend limit reached! phone number has been blocked for  ${process.env.BLOCKING_TIME / (1000 * 60 * 60)} hour(s),  please try again later.`)
      }


      Otpsend.send_count_left = process.env.MAX_SEND_OTP_COUNT - (userData.send_otp_count)
      return Otpsend

    } catch (err) {
      if (err.message)
        throw err.message
      else
        throw err

    }
  }
  verifyOTP = async (phone, otp, type) => {

    try {
      if (!phone) {
        throw new Error("Invalid phone number, please enter 10 digits without +91 or 0")
      }
      if (!otp) {
        throw new Error("Invalid OTP!")
      }

      const userData = await customer_repo.CheckUserBlocked(phone)
      if (userData.is_blocked) {
        throw new Error(`This phone number has Been Blocked for ${process.env.BLOCKING_TIME / (1000 * 60 * 60)} hour(s), please try again later.`)
      }

      if (userData.send_otp_count > process.env.MAX_SEND_OTP_COUNT) {
        if (Date.now() - userData.last_otp_sent_at <= process.env.MAX_SEND_OTP_WAIT_TIME) {
          throw new Error(`OTP  Send limit exceeded! please try after ${process.env.MAX_SEND_OTP_WAIT_TIME / (1000 * 60 * 60)} hour(s)`)


        }
      }


      const verifyOTP = await micro_service.verifyOTP(phone, otp, type, userData.send_otp_count)

      if (verifyOTP === "Block User") {
        const BlockUser = await customer_repo.BlockUser(phone)
        throw new Error(`Wrong OTP entered! Phone number has been blocked for  ${process.env.BLOCKING_TIME / (1000 * 60 * 60)} hour(s),  please try again later.`)
      }

      // verifyOTP.send_count=userData.send_otp_count
      return verifyOTP
      // return verifyOTP



    } catch (error) {
      console.log(error.message)
      //       if(err.message)
      //   throw err.message
      // else
      let error_mes = {}

      if (error.message) {
        error_mes.message = error.message
      }
      if (error.wrong_OTP_attempts_left >= 0) {
        error_mes.wrong_OTP_attempts_left = error.wrong_OTP_attempts_left
        error_mes.send_attempt_left = error.send_attempt_left
        // error.send_attempt_left=process.env.MAX_SEND_OTP_COUNT-send_otp_count

        error_mes.resend_attempt_left = error.resend_attempt_left
      }
      else if (!error.message) {
        error_mes.message = error
      }
      throw error_mes
    }
  }
}

module.exports = CustomerManager;
