const jwt = require('jsonwebtoken');
const { resolve } = require('path');
const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP';
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
const GateKeeperRepository = require('../Repositories/gateKeeper_respository');
const gatekeeper_repo = new GateKeeperRepository();
const Company_user_token_expiry = process.env.SESSION_TIMEOUT_COMPANY_USER;
const InvalidateTokensRepo = require('../Repositories/invalidatedtokens.repository');
const InvalidateTokensRepoobj = new InvalidateTokensRepo();
const sendMail = require('../MicroServices/email');

class GateKeeperManager {
  Login(body) {
    return new Promise((resolve, reject) => {
      gatekeeper_repo
        .Login(body)
        .then((result1) => {
          gatekeeper_repo
            .UserAccess(result1[0].id)
            .then((user_access) => {
              micro_service
                .GenerateCompanyUserToken(
                  result1[0].id,
                  user_access,
                  process.env.SESSION_TIMEOUT_COMPANY_USER
                )
                .then((accessToken) => {
                  let user = {
                    id: result1[0].id,
                    name: result1[0].name,
                    company_id: result1[0].company_id,
                    company_name:result1[0].company_name,
                    factory_name:result1[0].factory_name,
                    email: result1[0].email,
                    factory_id: result1[0].factory_id,
                    user_access: user_access,
                  };
                  return resolve({ user, accessToken });
                });
            })
            .catch((err) => {
              return reject(err);
            });
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  ChangeCompanyUserPassword(id, old_password, new_password) {
    return new Promise((resolve, reject) => {
      gatekeeper_repo
        .getCompanyUserPassword(id)
        .then((company_pass) => {
          // if (old_password === company_pass) {
          micro_service
            .VerifyPasswordChange(company_pass, old_password)
            .then(() => {
              gatekeeper_repo
                .updateCompanyUserPassword(id, new_password)
                .then((data) => {
                  return resolve(data);
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

  forgetPassword = async (body) => {
    try {
      const { email } = body;

      // Find the user in the simulated database (replace with database query)
      const user = await gatekeeper_repo.doesCompanyUserExist(email);

      // if (!userexits) {
      //   // res.status(404).json({ message: 'User not found' });
      //   throw new Error('Email Not Found!');
      // }
      console.log(user, 'exi');

      // const user = await company_repo.GetCompanyDetails(
      //   userexits[0].business_id
      // );
      // console.log(user);
      if (user && user.length > 0) {
        const deleteAllTokens = await InvalidateTokensRepoobj.DeleteTokenByID(
          user[0].id,
          'FP',
          'CU'
        );
        const token = await InvalidateTokensRepoobj.InsertNewRecord(
          user[0].id,
          'FP',
          'CU'
        );
        const resetToken = micro_service.generateResetToken(
          user[0].id,
          token.insertId,
          user[0].company_id,
          0
        );

        const link = `${process.env.COMPANY_USER_URL}/reset_user_password?token=${resetToken}&forget_password=true`;

        const info = sendMail({
          toEmail: email,
          subject: 'Reset Your Password',
          // text: `${emailFrom} shared a file with you.`,
          html: require('../templates/forget-password.template')({
            user: user[0].name,
            link: link,
          }),
        })
          .then(() => {
            return true;
          })
          .catch((err) => {
            throw new Error(err);
          });
        if (info) return link;
      } else {
        throw new Error('User Details Not found');
      }
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  };

  resetPassword = async (body) => {
    const { token, newPassword } = body;

    try {
      // Verify the token
      const decoded = await micro_service.VerifyLinkToken(token);
      const userId = decoded.userId;
      const tokenId = decoded.tokenId;

      console.log(userId);
      // Find the user in the simulated database (replace with database query)
      const tokenData = await InvalidateTokensRepoobj.GetToken(
        userId,
        tokenId,
        'CU'
      );

      if (tokenData && tokenData.length > 0) {
        // const status = await company_repo.updateEmailVerifiedStatus(userId);
        const user = await gatekeeper_repo.updateCompanyUserPassword(
          userId,
          newPassword
        );

        // res.json({ success: true });
        // return user;
        const deletestatus = await InvalidateTokensRepoobj.DeleteToken(
          userId,
          tokenId,
          'CU'
        );

        // res.json({ success: true });
        return user;
      } else {
        throw new Error('Link Expired');
      }
    } catch (error) {
      // res.status(400).json({ message: error.message });
      throw new Error(error);
    }
  };

  Identity(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          console.log('then');
          gatekeeper_repo
            .Identity(user_id)
            .then((result1) => {
              gatekeeper_repo
                .UserAccess(user_id)
                .then((user_access) => {
                  let user = {
                    id: result1[0].id,
                    name: result1[0].name,
                    company_id: result1[0].company_id,
                    company_name:result1[0].company_name,
                    factory_name:result1[0].factory_name,
                    email: result1[0].email,
                    factory_id: result1[0].factory_id,
                    user_access: user_access,
                  };
                  return resolve(user);
                })
                .catch((err) => {
                  console.log(err + '----err1');
                  return reject(err);
                });
            })
            .catch((err) => {
              console.log(err + '---');
              return reject(err);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  GateKeeperHistory(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('gatekeeper')) {
            gatekeeper_repo
              .BufferHistory(user_id)
              .then((result) => {
                return resolve(result);
              })
              .catch((err) => {
                return reject(err);
              });
          } else {
            return reject('Access denied!');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  ScanQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(async ({ user_id, user_access }) => {
          console.log('hi');
          let alphanumeric;

          micro_service
            .GetAphanumericfromShortendUrl(body.shortId)
            .then((alpha) => {
              alphanumeric = alpha;

              if (user_access.includes('gatekeeper')) {
                if (alphanumeric) {
                  gatekeeper_repo
                    .CheckGateKeeperBuffer(alphanumeric)
                    .then(() => {
                      gatekeeper_repo
                        .ScanQR(user_id, body, alphanumeric)
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
                } else {
                  return reject('Unable to Scan,Invalid Alphanumeric');
                }
              } else {
                return reject('Access denied');
              }
            })
            .catch((err) => {
              return reject('Unable to fetch ALphaNumeric');
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  // micro_service.VerifyCompanyUserJWT(body.token)
  //         .then(({user_id,user_access})=>{
  //             if(user_access.includes("gatekeeper")){

  //             }
  //             else{

  //             }
  //         })
  dispatch(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('gatekeeper')) {
            if (body.alphanumeric[0] == 'M' && body.alphanumeric[1] == '-') {
              gatekeeper_repo
                .GetMasterQRContents(body.alphanumeric)
                .then((result) => {
                  if (result.length == 0) {
                    return resolve('No product linked to this QR.');
                  } else {
                    gatekeeper_repo
                      .RegisterTransaction(user_id, body)
                      .then((transaction_id) => {
                        gatekeeper_repo
                          .TransactionDataEntry(transaction_id, result)
                          .then(() => {
                            gatekeeper_repo
                              .UpdateEncodedProduct(result)
                              .then(() => {
                                return resolve('Products dispatched');
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
                })
                .catch((err) => {
                  return reject(err);
                });
            } else {
              let result = [];
              result.push(body.alphanumeric);
              gatekeeper_repo
                .RegisterTransaction(user_id, body)
                .then((transaction_id) => {
                  gatekeeper_repo
                    .TransactionDataEntry(transaction_id, result)
                    .then(() => {
                      gatekeeper_repo
                        .UpdateEncodedProduct(result)
                        .then(() => {
                          return resolve('Product dispatched');
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
          } else {
            return reject('Access denied');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  Dispatch(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('gatekeeper')) {
            gatekeeper_repo
              .GetGateKeeperBuffer(user_id)
              .then((data) => {
                gatekeeper_repo
                  .RegisterTransaction(user_id, body)
                  .then((transaction_id) => {
                    for (let i = 0; i < data.length; i++) {
                      if (
                        data[i].alphanumeric[0] == 'M' &&
                        data[i].alphanumeric[1] == '-'
                      ) {
                        gatekeeper_repo
                          .GetMasterQRContents(data[i].alphanumeric)
                          .then((result) => {
                            gatekeeper_repo
                              .TransactionDataEntry(transaction_id, result)
                              .then(() => {
                                gatekeeper_repo
                                  .ClearBuffer(user_id)
                                  .then(() => {
                                    gatekeeper_repo
                                      .UpdateMasterQRStatus(
                                        data[i].alphanumeric
                                      )
                                      .then(() => {
                                        console.log('Products dispatched');
                                      })
                                      .catch((err) => {
                                        return reject(err);
                                      });
                                  });
                              });
                          })
                          .catch((err) => {
                            return reject(err);
                          });
                      } else {
                        let result = [];
                        console.log(data[i].alphanumeric+"d1")
                        result.push({"alphanumeric":data[i].alphanumeric});
                        gatekeeper_repo
                          .TransactionDataEntry(transaction_id, result)
                          .then(() => {
                            gatekeeper_repo.ClearBuffer(user_id).then(() => {
                              console.log('Product dispatched');
                            });
                          })
                          .catch((err) => {
                            return reject(err);
                          });
                      }
                      if (i == data.length - 1) {
                        gatekeeper_repo.ClearBuffer(user_id).then(() => {
                          return resolve();
                        });
                      }
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
  FetchGateKeeperBuffer(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('gatekeeper')) {
            gatekeeper_repo
              .FetchGateKeeperBuffer(user_id)
              .then((result) => {
                return resolve(result);
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
  DeleteQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('gatekeeper')) {
            gatekeeper_repo
              .DeleteQR(body.id)
              .then(() => {
                gatekeeper_repo
                  .FetchGateKeeperBuffer(user_id)
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
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  ClearBuffer(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('gatekeeper')) {
            gatekeeper_repo
              .ClearBuffer(user_id)
              .then(() => {
                return resolve();
              })
              .catch((err) => {
                return reject(err);
              });
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
}

module.exports = GateKeeperManager;
