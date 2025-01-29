const jwt = require('jsonwebtoken');
const { resolve } = require('path');
const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP';
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
const PackerRepository = require('../Repositories/packer_repository');
const GateKeeperRepository = require('../Repositories/gateKeeper_respository');
const OperatorRepository = require('../Repositories/operator_repository');
const CompanyRepository = require('../Repositories/company_repository');
const gatekeeper_repo = new GateKeeperRepository();
const operator_repo = new OperatorRepository();
const company_repo = new CompanyRepository();

const packer_repo = new PackerRepository();
class PackerManager {
  Scan(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(async ({ user_id, user_access }) => {
          console.log('hi');
          let alphanumeric;
          console.log(body.shortId + 'shortId');
          micro_service
            .GetAphanumericfromShortendUrl(body.shortId)
            .then((alpha) => {
              alphanumeric = alpha;

              if (user_access.includes('packer')) {
                gatekeeper_repo
                  .Identity(user_id)
                  .then((Idata) => {
                    operator_repo
                      .GetProductId(alphanumeric)
                      .then((data) => {
                        const companyId = Idata[0].company_id;
                        company_repo
                          .checkIfProductExits(data, companyId)
                          .then((data) => {
                            gatekeeper_repo.CheckGateKeeperBuffer(alphanumeric).then(()=>{

                              packer_repo
                              .CheckProductQR(alphanumeric)
                              .then(() => {
                                packer_repo
                                  .UpdateBuffer(user_id, alphanumeric)
                                  .then(() => {
                                    packer_repo
                                      .BufferHistory(user_id)
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
                              })
                              .catch((err) => {
                                return reject(err);
                              });
                            }).catch((err)=>{return reject(err)})
                           
                          })
                          .catch((err) => {
                            return reject('Invalid QR!');
                          });
                      })
                      .catch((err) => {
                        return reject(err);
                      });
                  })
                  .catch((err) => {
                    return reject(err);
                  });
                console.log(alphanumeric);
              } else {
                return reject('Access denied');
              }
            })
            .catch((err) => {
              return reject('Unable to fetch ALphaNumeric');
            });
        })
        .catch((error) => {
          return reject('User not authenticated!');
        });
    });
  }
  ScanMasterQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(async ({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            console.log('hi');
            let alphanumeric;
            micro_service
              .GetAphanumericfromShortendUrl(body.shortId)
              .then((alpha) => {
                alphanumeric = alpha;

                packer_repo
                  .CheckMasterQR(alphanumeric)
                  .then(() => {
                    packer_repo
                      .CheckForExistingMasterQR(user_id)
                      .then((result) => {
                        if (result == true) {
                          return resolve('Master QR already scanned.');
                        } else {
                          packer_repo
                            .ScanMasterQR(user_id, body, alphanumeric)
                            .then((serial_number) => {
                              return resolve(serial_number);
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
              })
              .catch((err) => {
                return reject('Unable to fetch ALphaNumeric');
              });
          } else {
            return reject('Access denied');
          }
        });
    });
  }
  Dispatch(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo
              .GetBuffer(user_id)
              .then((result) => {
                packer_repo
                  .Dispatch(user_id, result)
                  .then(() => {
                    packer_repo
                      .UpdateEncodedProduct(result)
                      .then(() => {
                        packer_repo
                          .ResolveBuffer(user_id)
                          .then(() => {
                            return resolve();
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
          } else {
            return reject('Access denied');
          }
        })
        .catch((error) => {
          return reject('User not authenticated!');
        });
    });
  }
  packerHistory(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo
              .BufferHistory(user_id)
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
  clearBuffer(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo
              .ResolveBuffer(user_id)
              .then(() => {
                console.log('hi1');
                return resolve();
              })
              .catch((err) => {
                return reject(err);
              });
          } else {
            return reject('Access denied');
          }
        });
    });
  }
  LinkQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo.GetMasterAlphanumeric(user_id).then((alphanumeric) => {
              packer_repo
                .GetMasterQRid(alphanumeric)
                .then((master_QR_id) => {
                  packer_repo
                    .GetMasterQRData(master_QR_id)
                    .then((QRData) => {
                      console.log(QRData);
                      if (QRData.length == 0) {
                        packer_repo
                          .GetBuffer(user_id)
                          .then((result) => {
                            packer_repo
                              .SaveMasterQRData(result, master_QR_id,user_id)
                              .then(() => {
                                packer_repo
                                  .ResolveMasterBuffer(user_id)
                                  .then(() => {
                                    packer_repo
                                      .ResolveBuffer(user_id)
                                      .then(() => {
                                        return resolve('Linked successfully');
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
                      } else {
                        return resolve('QR already scanned!');
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
          } else {
            return reject('Access denied');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  RemoveQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo
              .RemoveQR(body.id)
              .then(() => {
                packer_repo
                  .BufferHistory(user_id)
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
            return reject('Access denied');
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  RemoveMasterQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo
              .ResolveMasterBuffer(user_id)
              .then(() => {
                return resolve('Master QR deleted');
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
  GetCurrentMasterQR(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyCompanyUserJWT(body.token)
        .then(({ user_id, user_access }) => {
          if (user_access.includes('packer')) {
            packer_repo
              .GetCurrentMasterQR(user_id)
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
}

module.exports = PackerManager;
