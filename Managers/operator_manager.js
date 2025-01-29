const jwt = require('jsonwebtoken');
const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP';
const OperatorRepository = require('../Repositories/operator_repository');
const operator_repo = new OperatorRepository();
const MicroService = require('../MicroServices/services');
const CompanyRepository = require('../Repositories/company_repository');
const company_repo = new CompanyRepository();
const QRCreditRepository = require('../Repositories/QR_credits_Repository');
const qrCreditRepository = new QRCreditRepository();
const db = require('../Database_connection/db');
const { resolve } = require('path');
const micro_service = new MicroService();
const Company_user_token_expiry = process.env.SESSION_TIMEOUT_COMPANY_USER;
const PDFTemplatesRepository = require('../Repositories/PDFTemplates_repository');
const PDFTemplatesRepositoryobj = new PDFTemplatesRepository();

class OperatorManager {
  // PrintQR(body){
  //     return new Promise((resolve,reject)=>{
  //         console.log("mng")
  //         operator_repo.alphanumeric(body.quantity, body.serial_no, body.factory_operator_id, body.product_id)
  //         .then((QRImagesUnsorted)=>{
  //                 operator_repo.SortQRImages(QRImagesUnsorted)
  //                 .then((QRImages)=>{
  //                     console.log(QRImages)
  //                         operator_repo.SaveFactoryOperatorActionHistory(body.quantity, body.serial_no, body.factory_operator_id, body.product_id,body.QR_copies,body.QR_size).then(()=>{
  //                             micro_service.Createpdf(QRImages,body.QR_copies,'product').then((pdfUrl)=>{
  //                                 let pdf = pdfUrl;
  //                                 console.log(pdfUrl)
  //                                 operator_repo.SavePdf(body.serial_no,body.quantity,pdfUrl,body.factory_operator_id).then(()=>{
  //                                     console.log("savepdf->"+pdfUrl)
  //                                     return resolve(pdfUrl)
  //                                 })
  //                                 .catch((error)=>{
  //                                     return reject(error)
  //                                 })
  //                             })
  //                             .catch((error)=>{
  //                                 return reject(error)
  //                             })
  //                         })
  //                         .catch((error)=>{
  //                             return reject(error)
  //                         })
  //                 })
  //                 .catch((err)=>{
  //                     return reject(err)
  //                 })
  //         })
  //         .catch((error)=>{
  //             return reject(error)
  //         })
  //     })
  // }
  // PrintQR=async(body)=>{
  //     try{
  //         console.log("mng")
  //         let starting_id = await operator_repo.alphanumeric(body.quantity, body.serial_no, body.factory_operator_id, body.product_id)
  //         console.log("st"+starting_id)
  //         let QRImages = await operator_repo.GetQrImages(starting_id)
  //         await operator_repo.SaveFactoryOperatorActionHistory(body.quantity, body.serial_no, body.factory_operator_id, body.product_id,body.QR_copies,body.QR_size)
  //         let pdfUrl = await micro_service.Createpdf(QRImages,body.QR_copies,'product')
  //         await operator_repo.SavePdf(body.serial_no,body.quantity,pdfUrl,body.factory_operator_id)
  //         return pdfUrl
  //     }
  //     catch(err){
  //         return err
  //     }

  // }
  // PrintQR(body, initial_credits, user) {
  //   return new Promise((resolve, reject) => {
  //     console.log('mng');
  //     company_repo
  //       .CheckIfFactoryProductExists(user.factory_id, body.product_id)
  //       .then((tempData) => {
  //         PDFTemplatesRepositoryobj.GetTemplateDataByID(body.template_id)
  //           .then((tempData) => {
  //             operator_repo
  //               .alphanumeric(
  //                 body.quantity,
  //                 body.serial_no,
  //                 user.id,
  //                 body.product_id
  //               )
  //               .then((QRImagesUnsorted) => {
  //                 operator_repo
  //                   .SortQRImages(QRImagesUnsorted)
  //                   .then((QRImages) => {
  //                     // console.log(QRImages);
  //                     const qrlength = QRImages.length;
  //                     const last_serial_no =
  //                       QRImages[qrlength - 1].serial_number;
  //                     operator_repo
  //                       .SaveFactoryOperatorActionHistory(
  //                         body.quantity,
  //                         body.serial_no,
  //                         user.id,
  //                         body.product_id,
  //                         body.QR_copies,
  //                         body.QR_size,
  //                         last_serial_no,
  //                         body.template_id
  //                       )

  //                       .then(() => {
  //                         micro_service
  //                           .CreateCustomPdf(
  //                             tempData,
  //                             QRImages,
  //                             body.QR_copies,
  //                             'product'
  //                           )
  //                           .then((pdfUrl) => {
  //                             let pdf = pdfUrl;
  //                             console.log(pdfUrl);
  //                             operator_repo
  //                               .SavePdf(
  //                                 body.serial_no,
  //                                 body.quantity,
  //                                 pdfUrl,
  //                                 user.id,
  //                                 body.template_id
  //                               )
  //                               .then(() => {
  //                                 console.log('savepdf->' + pdfUrl);
  //                                 console.log(
  //                                   'Ded ' + process.env.CREDIT_DEDUCTION_CHECK
  //                                 );
  //                                 if (
  //                                   process.env.CREDIT_DEDUCTION_CHECK === '1'
  //                                 ) {
  //                                   console.log('deduction started');
  //                                   qrCreditRepository
  //                                     .insertQRCreditTransaction({
  //                                       business_id: user.company_id,
  //                                       transaction_remarks: `<p>Credits consumed for generating QR <a href="${pdfUrl}" target="_blank">pdf</a></p>`,
  //                                       pdf_url: pdfUrl,
  //                                       created_on: new Date(),
  //                                       amount: body.quantity,
  //                                       is_credited: 0,
  //                                       is_debited: 1,
  //                                       debited_by: user.id,
  //                                       remaining_credits:
  //                                         initial_credits - body.quantity,
  //                                       transaction_type: 'debit',
  //                                     })
  //                                     .then(() => {
  //                                       console.log(
  //                                         'qr_credits_transaction_saved'
  //                                       );

  //                                       const remaining_credits =
  //                                         initial_credits - body.quantity;
  //                                       company_repo
  //                                         .UpdateQrCredits(
  //                                           user.company_id,
  //                                           remaining_credits
  //                                         )
  //                                         .then(() => {
  //                                           console.log(
  //                                             'updated_company_credits'
  //                                           );
  //                                           return resolve(pdfUrl);
  //                                         })
  //                                         .catch((err) => {
  //                                           console.log(err);

  //                                           return reject(err);
  //                                         });
  //                                     })
  //                                     .catch((err) => {
  //                                       console.log(err);
  //                                       return reject(err);
  //                                     });
  //                                 } else {
  //                                   return resolve(pdfUrl);
  //                                 }
  //                               })
  //                               .catch((error) => {
  //                                 console.log('1');
  //                                 return reject(error);
  //                               });
  //                           })
  //                           .catch((error) => {
  //                             console.log('2');
  //                             return reject(error);
  //                           });
  //                         // })
  //                         // .catch((err) => {
  //                         //   return reject(err);
  //                         // })
  //                       })
  //                       .catch((error) => {
  //                         console.log('3');
  //                         return reject(error);
  //                       });
  //                   })
  //                   .catch((err) => {
  //                     console.log(err);
  //                     return reject(err);
  //                   });
  //               })
  //               .catch((error) => {
  //                 console.log('5');
  //                 return reject(error);
  //               });
  //           })
  //           .catch((err) => {
  //             return reject(err);
  //           });
  //       })
  //       .catch((err) => {
  //         return reject(err);
  //       });
  //   });
  // }

  PrintQR(body, initial_credits, user) {
    return new Promise((resolve, reject) => {
      console.log('mng');
      PDFTemplatesRepositoryobj.GetTemplateDataByID(body.template_id)
        .then((tempData) => {
          operator_repo
            .alphanumeric(
              body.quantity,
              body.serial_no,
              user.id,
              body.product_id,
              body.dynamic_qr
            )
            .then((QRImagesUnsorted) => {
              operator_repo
                .SortQRImages(QRImagesUnsorted)
                .then((QRImages) => {
                  // console.log(QRImages);
                  const qrlength = QRImages.length;
                  const last_serial_no = QRImages[qrlength - 1].serial_number;
                  operator_repo
                    .SaveFactoryOperatorActionHistory(
                      body.quantity,
                      body.serial_no,
                      user.id,
                      body.product_id,
                      body.QR_copies,
                      body.QR_size,
                      last_serial_no,
                      body.template_id
                    )

                    .then(() => {
                      micro_service
                        .CreateCustomPdf(
                          tempData,
                          QRImages,
                          body.QR_copies,
                          'product'
                        )
                        .then((pdfUrl) => {
                          let pdf = pdfUrl;
                          console.log(pdfUrl);
                          operator_repo
                            .SavePdf(
                              body.serial_no,
                              body.quantity,
                              pdfUrl,
                              user.id,
                              body.template_id
                            )
                            .then(() => {
                              console.log('savepdf->' + pdfUrl);
                              console.log(
                                'Ded ' + process.env.CREDIT_DEDUCTION_CHECK
                              );
                              if (process.env.CREDIT_DEDUCTION_CHECK === '1') {
                                console.log('deduction started');

                                qrCreditRepository
                                  .insertQRCreditTransaction({
                                    business_id: user.company_id,
                                    transaction_remarks: `<p>Credits consumed for generating QR <a href="${pdfUrl}" target="_blank">pdf</a></p>`,
                                    pdf_url: pdfUrl,
                                    created_on: new Date(),
                                    amount: body.quantity,
                                    is_credited: 0,
                                    is_debited: 1,
                                    debited_by: user.id,
                                    product_id: body.product_id,
                                    remaining_credits:
                                      initial_credits - body.quantity,
                                    transaction_type: 'debit',
                                  })
                                  .then(() => {
                                    console.log('qr_credits_transaction_saved');

                                    const remaining_credits =
                                      initial_credits - body.quantity;
                                    company_repo
                                      .UpdateQrCredits(
                                        user.company_id,
                                        remaining_credits
                                      )
                                      .then(() => {
                                        console.log('updated_company_credits');
                                        return resolve(pdfUrl);
                                      })
                                      .catch((err) => {
                                        console.log(err);

                                        return reject(err);
                                      });
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    return reject(err);
                                  });
                              } else {
                                return resolve(pdfUrl);
                              }
                            })
                            .catch((error) => {
                              console.log('1');
                              // return reject(error); vikash_qr
                            });
                        })
                        .catch((error) => {
                          console.log('2');
                          return reject(error);
                        });
                      // })
                      // .catch((err) => {
                      //   return reject(err);
                      // })
                    })
                    .catch((error) => {
                      console.log('3');
                      return reject(error);
                    });
                })
                .catch((err) => {
                  console.log(err);
                  return reject(err);
                });
            })
            .catch((error) => {
              console.log('5');
              return reject(error);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  // GetFactoryOperatorHistory(body) {
  //   return new Promise((resolve, reject) => {
  //     micro_service
  //       .VerifyCompanyUserJWT(body.token)
  //       .then(({ user_id, user_access }) => {
  //         if (user_access.includes('factory_operator')) {
  //           operator_repo
  //             .GetFactoryOperatorActionHistory(user_id, body.product_id)
  //             .then((result) => {
  //               resolve(result);
  //             })
  //             .catch((err) => {
  //               reject(err);
  //             });
  //         } else {
  //           return reject('Access denied');
  //         }
  //       })
  //       .catch((err) => {
  //         return reject(err);
  //       });
  //   });
  // }

  GetFactoryOperatorHistory(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('factory_operator')) {
            operator_repo
              .GetFactoryOperatorActionHistory(user_id, body.product_id)
              .then((result) => {
                resolve(result);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            return reject('Access denied');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  FactoryOperatorPdfHistory(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('factory_operator')) {
            operator_repo
              .PdfHistory(user_id)
              .then((result) => {
                resolve(result);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            return reject('Access denied');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  ProductPurchaseOptions(alphanumeric) {
    return new Promise((resolve, reject) => {
      operator_repo
        .GetProductId(alphanumeric)
        .then((product_id) => {
          operator_repo
            .ProductPurchaseOptions(product_id)
            .then((result) => {
              return resolve(result);
            })
            .catch((err) => {
              return reject(result);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  // PrintMasterQR(body) {
  //   return new Promise((resolve, reject) => {
  //     micro_service
  //       .VerifyCompanyUserJWT(body.token)
  //       .then(({ user_id, user_access }) => {
  //         if (user_access.includes('factory_operator')) {
  //           operator_repo
  //             .GetLastMasterQRId()
  //             .then((starting_id) => {
  //               if (body.serial_no == '') {
  //                 operator_repo
  //                   .GetDefaultMasterQRSerial()
  //                   .then((serial_no) => {
  //                     console.log(serial_no + 'default ser');
  //                     operator_repo
  //                       .SaveMasterQR(body.quantity, serial_no, user_id)
  //                       .then((QRImageData) => {
  //                         console.log('mng called');
  //                         operator_repo
  //                           .SortQRImages(QRImageData)
  //                           .then((SortedQRImageData) => {
  //                             console.log(SortedQRImageData);

  //                             PDFTemplatesRepositoryobj.GetTemplateDataByID(
  //                               body.template_id
  //                             )
  //                               .then((tempData) => {
  //                                 micro_service
  //                                   .CreateCustomPdf(
  //                                     tempData,
  //                                     SortedQRImageData,
  //                                     body.QR_copies,
  //                                     'master'
  //                                   )
  //                                   .then((pdfUrl) => {
  //                                     return resolve(pdfUrl);
  //                                   })
  //                                   .catch((err) => {
  //                                     return reject(err);
  //                                   });
  //                               })
  //                               .catch((err) => {
  //                                 return reject(err);
  //                               });
  //                           })
  //                           .catch((err) => {
  //                             return reject(err);
  //                           });
  //                       })
  //                       // .then(() => {
  //                       //   console.log('mng called');
  //                       //   operator_repo
  //                       //     .GetMasterQR(starting_id)
  //                       //     .then((QR) => {
  //                       //       console.log(QR);
  //                       //       micro_service
  //                       //         .Createpdf(QR, body.QR_copies, 'master')
  //                       //         .then((pdfUrl) => {
  //                       //           return resolve(pdfUrl);
  //                       //         })
  //                       //         .catch((err) => {
  //                       //           return reject(err);
  //                       //         });
  //                       //     })
  //                       //     .catch((err) => {
  //                       //       return reject(err);
  //                       //     });
  //                       // })
  //                       .catch((err) => {
  //                         return reject(err);
  //                       });
  //                   })
  //                   .catch((err) => {
  //                     return reject(err);
  //                   });
  //               } else {
  //                 // console.log(starting_id)
  //                 operator_repo
  //                   .SaveMasterQR(body.quantity, body.serial_no, user_id)
  //                   .then((QRImageData) => {
  //                     console.log('mng called');
  //                     operator_repo
  //                       .SortQRImages(QRImageData)
  //                       .then((SortedQRImageData) => {
  //                         console.log(SortedQRImageData);

  //                         PDFTemplatesRepositoryobj.GetTemplateDataByID(
  //                           body.template_id
  //                         )
  //                           .then((tempData) => {
  //                             micro_service
  //                               .CreateCustomPdf(
  //                                 tempData,
  //                                 SortedQRImageData,
  //                                 body.QR_copies,
  //                                 'master'
  //                               )
  //                               .then((pdfUrl) => {
  //                                 return resolve(pdfUrl);
  //                               })
  //                               .catch((err) => {
  //                                 return reject(err);
  //                               });
  //                           })
  //                           .catch((err) => {
  //                             return reject(err);
  //                           });
  //                       })
  //                       .catch((err) => {
  //                         return reject(err);
  //                       });
  //                   })
  //                   .catch((err) => {
  //                     console.log(err);
  //                     return reject(err);
  //                   });
  //               }
  //             })
  //             .catch((err) => {
  //               return reject(err);
  //             });
  //         } else {
  //           return reject('Access denied');
  //         }
  //       })
  //       .catch((err) => {
  //         return reject(err);
  //       });
  //   });
  // }

  PrintMasterQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('factory_operator')) {
            PDFTemplatesRepositoryobj.GetTemplateDataByID(body.template_id)
              .then((tempData) => {
                operator_repo
                  .GetLastMasterQRId()
                  .then((starting_id) => {
                    if (body.serial_no == '') {
                      operator_repo
                        .GetDefaultMasterQRSerial()
                        .then((serial_no) => {
                          console.log(serial_no + 'default ser');
                          operator_repo
                            .SaveMasterQR(body.quantity, serial_no, user_id)
                            .then((QRImageData) => {
                              console.log('mng called');
                              operator_repo
                                .SortQRImages(QRImageData)
                                .then((SortedQRImageData) => {
                                  console.log(SortedQRImageData);

                                  micro_service
                                    .CreateCustomPdf(
                                      tempData,
                                      SortedQRImageData,
                                      body.QR_copies,
                                      'master'
                                    )
                                    .then((pdfUrl) => {
                                      return resolve(pdfUrl);
                                    })
                                    .catch((err) => {
                                      return reject(err);
                                    });
                                  // })
                                  // .catch((err) => {
                                  //   return reject(err);
                                  // });
                                })
                                .catch((err) => {
                                  return reject(err);
                                });
                            })
                            // .then(() => {
                            //   console.log('mng called');
                            //   operator_repo
                            //     .GetMasterQR(starting_id)
                            //     .then((QR) => {
                            //       console.log(QR);
                            //       micro_service
                            //         .Createpdf(QR, body.QR_copies, 'master')
                            //         .then((pdfUrl) => {
                            //           return resolve(pdfUrl);
                            //         })
                            //         .catch((err) => {
                            //           return reject(err);
                            //         });
                            //     })
                            //     .catch((err) => {
                            //       return reject(err);
                            //     });
                            // })
                            .catch((err) => {
                              return reject(err);
                            });
                        })
                        .catch((err) => {
                          return reject(err);
                        });
                    } else {
                      // console.log(starting_id)
                      operator_repo
                        .SaveMasterQR(body.quantity, body.serial_no, user_id)
                        .then((QRImageData) => {
                          console.log('mng called');
                          operator_repo
                            .SortQRImages(QRImageData)
                            .then((SortedQRImageData) => {
                              console.log(SortedQRImageData);

                              // PDFTemplatesRepositoryobj.GetTemplateDataByID(
                              //   body.template_id
                              // )
                              // .then((tempData) => {
                              micro_service
                                .CreateCustomPdf(
                                  tempData,
                                  SortedQRImageData,
                                  body.QR_copies,
                                  'master'
                                )
                                .then((pdfUrl) => {
                                  return resolve(pdfUrl);
                                })
                                .catch((err) => {
                                  return reject(err);
                                });
                              // })
                              // .catch((err) => {
                              //   return reject(err);
                              // });
                            })
                            .catch((err) => {
                              return reject(err);
                            });
                        })
                        .catch((err) => {
                          console.log(err);
                          return reject(err);
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
          } else {
            return reject('Access denied');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  PrintCustomQR(body) {
    return new Promise((resolve, reject) => {
      operator_repo
        .CustomQR(body.quantity)
        .then((result) => {
          micro_service
            .CreateCustomPdf(
              result,
              body.QR_copies,
              'custom',
              body.length,
              body.width,
              body.marginTop,
              body.marginBottom,
              body.marginLeft,
              body.marginRight,
              body.pageCapacity,
              body.QRSize,
              body.printSerial
            )
            .then((location) => {
              return resolve(location);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  LoadFactoryOperator(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((id) => {
          operator_repo
            .LoadFactoryOperator(id)
            .then((user) => {
              micro_service
                .GenerateToken(user.id, Company_user_token_expiry)
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
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

}

module.exports = OperatorManager;
