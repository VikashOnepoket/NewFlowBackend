const CompanyRepository = require('../Repositories/company_repository');
const jwt = require('jsonwebtoken');
const InvalidateTokensRepo = require('../Repositories/invalidatedtokens.repository');
const InvalidateTokensRepoobj = new InvalidateTokensRepo();
const { promise } = require('../Database_connection/db');
const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP';
const json2csv = require('json2csv').parse;
const company_repo = new CompanyRepository();
const MicroService = require('../MicroServices/services');
const { resolve } = require('path');
const micro_service = new MicroService();
const sendMail = require('../MicroServices/email');
const OperatorRepository = require('../Repositories/operator_repository');
const { decode } = require('punycode');
const { isNumber } = require('util');

const operator_repo = new OperatorRepository();

class CompanyManager {
  Login(body) {
    return new Promise((resolve, reject) => {
      // company_repo
      //   .doesUserExist(body.email)
      //   .then((result) => {
      //     // console.log(result)
      //     let is_root=0,is_dash_user=0

      //     if(result.length>0){
      //         is_root=1
      //     }
      company_repo.doesDasboardEmailAlreadyExist(body.email).then((dash_user) => {

        console.log(dash_user)

        if (dash_user.length <= 0) {
          return reject("User not registered!");
        } else {
          company_repo
            .isDashboardUserCredentialsValid(body.email, body.password, dash_user[0].company_id)
            .then((result) => {
              if (result == 'Invalid credentials!') {
                return reject(result);
              } else {
                if (result[0].role == 'company') {
                  company_repo
                    .GetCompanyDetails(result[0].company_id)
                    .then((result1) => {
                      this.getDashBoardUserProfileData(result[0].id, result[0].company_id).then((dash_profile_data) => {

                        let details = {


                          company_details: {
                            role: 'company',
                            company_email: result[0].company_email,
                            // email:body.email,
                            business_id: result[0].business_id,

                            passwordChanged: result[0].passwordChanged,
                            send_installation_mail: result[0].send_installation_mail,
                            use_installation_form: result[0].use_installation_form,
                            avatarUrl: result1[0].avatarUrl,
                            display_name: result1[0].display_name,
                            owner_name: result1[0].owner_name,
                            phone: result1[0].phone,
                            address: result1[0].address,
                            credits_remaining: result[0].credits_remaining
                          },
                          user_details: dash_profile_data
                        };
                        return resolve(details);

                      }).catch((err) => {
                        return reject(err);
                      })

                    })
                    .catch((err) => {
                      return reject(err);
                    });
                } else if (result[0].role == 'distributor') {
                  company_repo
                    .GetDistributorDetails(result[0].company_id)
                    .then((result2) => {
                      let details = {
                        role: 'distributor',
                        email: body.email,
                        id: result[0].business_id,
                        GST_no: result2[0].GST_no,
                        enterprise_name: result2[0].enterprise_name,
                        owner_name: result2[0].owner_name,
                        phone: result2[0].phone,
                        address: result2[0].address,
                        PAN: result2[0].PAN,
                        pincode: result2[0].pincode,
                        state: result2[0].state,
                        aadhar_no: result2[0].aadhar_no,
                      };
                      return resolve(details);
                    })
                    .catch((err) => {
                      return reject(err);
                    });
                }
              }
            })
            .catch((err) => {
              return reject(err);
            });
        }


      }).catch((err) => { return reject(err) })


      // })
      // .catch((err) => {
      //   return reject(err);
      // });
    });
  }

  getDashBoardUserProfileData = async (id, business_id) => {
    try {
      console.log(business_id)
      const userRole = await company_repo.doesDashboardUserExistById(id)
      console.log(userRole[0])
      const permissionsData = await company_repo.getDashboardRolePermissionsNameById({ role_id: userRole[0].fk_role_id }, business_id)
      console.log(permissionsData)
      const permissions = permissionsData.map((permission) => {
        return permission.permission_name
      })
      let user_role
      // const is_root=0
      if (userRole[0].is_root) {

        user_role = "root"
      }
      else {
        user_role = userRole[0].role_name
      }
      const data = {
        user_name: userRole[0].name,
        user_id: userRole[0].id,
        user_email: userRole[0].email,
        is_root: userRole[0].is_root,
        user_role_name: user_role,
        permissions: permissions
      }
      return data


    } catch (err) { throw err }

  }

  ChangePassword(business_id, user_id, old_password, new_password) {
    return new Promise((resolve, reject) => {
      company_repo
        .getDashboardUserPassword(user_id, business_id)
        .then((company_pass) => {
          // if (old_password === company_pass) {
          micro_service
            .VerifyPasswordChange(company_pass, old_password)
            .then(() => {
              if (company_pass[0].is_root) {
                company_repo
                  .updateCompanyPassword(business_id, new_password)
                .then((data) => {
                  company_repo
                    .updateDashboardUserPassword(user_id, business_id, new_password)
                    .then((data) => {
                      return resolve(data);
                    }).catch((err) => {
                      return reject(err);

                    })
                })
                .catch((err) => {
                  return reject(err);
                });
              }
              else {
                company_repo
                  .updateDashboardUserPassword(user_id, business_id, new_password)
                  .then((data) => {
                    return resolve(data);
                  }).catch((err) => {
                    return reject(err);

                  })
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

  ChangeNewPassword(business_id, user_id, new_password) {
    return new Promise((resolve, reject) => {
      console.log(new_password)
      console.log(business_id)
      company_repo
        .doesUserExistById(user_id, business_id)
        .then((company_details) => {
          if (company_details[0].passwordChanged) {
            return reject("Password reset already done! ");
          }

          if (company_details[0].is_root) {
            company_repo
              .updateCompanyPassword(business_id, new_password)
            .then((data) => {
              company_repo
                .updateDashboardUserPassword(user_id, business_id, new_password)
                .then((data) => {
                  return resolve(data);
                }).catch((err) => {
                  return reject(err);

                })
            })
            .catch((err) => {
              return reject(err);
            });
          }
          else {
            throw new Error("Not a root account!")
          }

          //     // if (old_password === company_pass) {
          //     micro_service
          //       .VerifyPasswordChange(company_pass, old_password)
          //       .then(() => {
          // company_repo
          //   .updateCompanyPassword(user_id,business_id, new_password)
          //   .then((data) => {
          //     return resolve(data);
          //   })
          //   .catch((err) => {
          //     return reject(err);
          //   });
        })
        .catch((err) => {
          return reject(err);
        });
      // })
      // .catch((err) => {
      //   return reject(err);
      // });
    });
  }

  forgetPassword = async (body) => {
    try {
      const { email } = body;

      // Find the user in the simulated database (replace with database query)
      const user = await company_repo.doesDasboardEmailAlreadyExist(email);

      // if (!userexits) {
      //   // res.status(404).json({ message: 'User not found' });
      //   throw new Error('Email Not Found!');
      // }
      // console.log(userexits, 'exi');

      // const user = await company_repo.GetCompanyDetails(
      //   userexits[0].business_id
      // );
      console.log(user);
      if (user && user.length > 0) {
        const deleteAllTokens = await InvalidateTokensRepoobj.DeleteTokenByID(
          user[0].id,
          'FP',
          'CB'
        );
        const token = await InvalidateTokensRepoobj.InsertNewRecord(
          user[0].id,
          'FP',
          'CB'
        );
        const resetToken = micro_service.generateResetToken(
          user[0].id,
          token.insertId,
          user[0].company_id,
          user[0].is_root

        );

        const link = `${process.env.CLIENT_URL}/reset_password?token=${resetToken}&forget_password=true`;

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

  changeEmail = async (body, business_id, user_id) => {
    try {
      const { newEmail } = body;

      // Find the user in the simulated database (replace with database query)
      const userExist = await company_repo.doesDasboardEmailAlreadyExistUpdate(
        newEmail,
        user_id
      );

      if (userExist && userExist.length >= 1) {
        throw new Error("Cannot Update User! Email already Exists!")
      }

      const isMailVerified = await company_repo.CheckIfEmailVerified(
        newEmail,
        business_id
      );

      // if (!userexits) {
      //   // res.status(404).json({ message: 'User not found' });
      //   throw new Error('Email Not Found!');
      // }
      // console.log(userexits, 'exi');

      // const user = await company_repo.GetCompanyDetails(business_id);
      const user = await company_repo.doesDashboardUserExistById(user_id)
      console.log(user);
      if (user && user.length > 0) {
        const deleteAllTokens = await InvalidateTokensRepoobj.DeleteTokenByID(
          user_id,
          'VE',
          'CB'
        );
        const token = await InvalidateTokensRepoobj.InsertNewEmailRecord(
          user_id,
          'VE',

          newEmail,
          'CB'
        );
        const resetToken = micro_service.generateResetToken(
          user_id,
          token.insertId,
          user[0].company_id,
          user[0].is_root
        );

        const link = `${process.env.CLIENT_URL}/verify-email?token=${resetToken}&reset_email=true`;

        const info = sendMail({
          toEmail: newEmail,
          subject: 'Verify Your Email',
          // text: `${emailFrom} shared a file with you.`,
          html: require('../templates/verify-email.template')({
            user: user[0].name,
            link: link,
          }),
        })
          .then(async () => {
            try {
              // const updated = await company_repo.updateEmail(
              //   newEmail,
              //   business_id
              // );
              return true;
            } catch (err) {
              throw new Error(err);
            }
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

  verifyEmail = async (body) => {
    const { token } = body;

    try {
      // Verify the token
      const decoded = await micro_service.VerifyLinkToken(token);
      const userId = decoded.userId;
      const tokenId = decoded.tokenId;
      const is_root = decoded.is_root
      const company_id = decoded.company_id
      console.log(decoded)
      console.log(userId);
      const tokenData = await InvalidateTokensRepoobj.GetToken(
        userId,
        tokenId,
        'CB'
      );
      console.log(tokenData)
      if (tokenData && tokenData.length > 0) {
        const newEmail = tokenData[0].email;
        if (is_root) {
          const status = await company_repo.updateEmail(newEmail, company_id);

        }
        const status = await company_repo.updateDashBoardUserEmail(newEmail, company_id, userId);

        const deletestatus = await InvalidateTokensRepoobj.DeleteToken(
          userId,
          tokenId,
          'CB'
        );

        // res.json({ success: true });
        return status;
      } else {
        throw new Error('Link Expired');
      }
      // Find the user in the simulated database (replace with database query)
    } catch (error) {
      // res.status(400).json({ message: error.message });
      throw new Error(error);
    }
  };
  resetPassword = async (body) => {
    const { token, newPassword } = body;

    try {
      // Verify the token
      const decoded = await micro_service.VerifyLinkToken(token);
      const userId = decoded.userId;
      const tokenId = decoded.tokenId;
      const is_root = decoded.is_root
      const company_id = decoded.company_id


      console.log(userId);
      // Find the user in the simulated database (replace with database query)
      const tokenData = await InvalidateTokensRepoobj.GetToken(
        userId,
        tokenId,
        'CB'
      );
      console.log(decoded)

      if (tokenData && tokenData.length > 0) {
        // const is_root=await company_repo.getDashboardUserDataByID()
        // const userdata=  await  company_repo
        // .doesUserExistById(user_id,business_id)
        // const status = await company_repo.updateEmailVerifiedStatus(userId);
        if (is_root) {
          const user = await company_repo.updateCompanyPassword(
            company_id,
            newPassword
          );
        }

        const updateDashUserPass = await company_repo.updateDashboardUserPassword(userId, company_id, newPassword)



        // res.json({ success: true });
        // return user;
        const deletestatus = await InvalidateTokensRepoobj.DeleteToken(
          userId,
          tokenId,
          'CB'
        );

        // res.json({ success: true });
        return "updated password";
      } else {
        throw new Error('Link Expired');
      }
    } catch (error) {
      // res.status(400).json({ message: error.message });
      throw new Error(error);
    }
  };

  HashAllPasword(body) {
    return new Promise((resolve, reject) => {
      company_repo
        .GetAllCompanyCredentials()
        .then((companyData) => {
          for (let i = 0; i < companyData.length; i++) {
            company_repo
              .updateCompanyPassword(
                companyData[i].business_id,
                companyData[i].password
              )
              .then((data) => {
                return;
              })
              .catch((err) => {
                return reject(err);
              });
          }
          return resolve('Hashed Pass');
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  EditCompany(body, company_id, logos) {
    return new Promise((resolve, reject) => {
      company_repo
        .UpdateCompanyDetails(body, company_id)
        .then(() => {
          console.log('cmp called');
          if (logos.length > 0) {
            console.log(logos);
            company_repo
              .UpdateAvatar(company_id, logos)
              .then((result) => {
                company_repo
                  .CompanyDetails(company_id)
                  .then((result1) => {
                    return resolve(result1);
                  })
                  .catch((error) => {
                    return reject(error);
                  });
              })
              .catch((error) => {
                return reject(error);
              });
          } else {
            console.log('else');
            company_repo
              .CompanyDetails(company_id)
              .then((result) => {
                return resolve(result);
              })
              .catch((error) => {
                return reject(error);
              });
          }
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }
  CompanyCustomers(body, company_id) {
    console.log('manager called');
    console.log(body);
    // console.log(company_id);
    return new Promise((resolve, reject) => {
      let accessToken = body.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     return reject('Authentication failed');
      //   } else {
      //     company_id = decoded.company_id;
      //     console.log(company_id);
      //   }
      // });
      console.log(company_id + "company_id");
      let customer_list = [];
      let total_count = 0,
        total_page = 0;
      if (!body.key || body.key == '') {
        console.log('without');
        company_repo
          .CompanyCustomersWithoutKey(body, company_id)
          .then((result) => {
            console.log('in ' + result);
            customer_list = result;
            company_repo
              .CompanyCustomersWithoutKeyTotalCount(body, company_id)
              .then((result) => {
                console.log('in ' + result);
                total_count = result;
                const pageSize = body.items_per_page || 10; // Number of blogs per page

                total_page = Math.ceil(total_count / pageSize);
                return resolve({ customer_list, total_count, total_page });
              })
              .catch((err) => {
                console.log(err + 'heyey');
                return reject(err);
              });
          })
          .catch((err) => {
            return reject(err);
          });
      } else {
        console.log('with');
        company_repo
          .CompanyCustomersWithKey(body, company_id)
          .then((result) => {
            console.log('in ' + result);
            customer_list = result;

            company_repo
              .CompanyCustomersWithKeyTotalCount(body, company_id)
              .then((result) => {
                console.log('in ' + result);
                total_count = result;
                const pageSize = body.items_per_page || 10; // Number of blogs per page

                total_page = Math.ceil(total_count / pageSize);
                return resolve({ customer_list, total_count, total_page });
              });
          })
          .catch((err) => {
            return reject(err);
          });
      }
    });
  }

  AdvancedSearch(i, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = i.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      let customer_list = [];
      let total_count = 0,
        total_page = 0;
      company_repo
        .AdvancedSearch(i, company_id)
        .then((result) => {
          // resolve(result);
          customer_list = result;
          console.log(customer_list + 'CustomerList');
          company_repo
            .AdvancedSearchTotalCount(i, company_id)
            .then((result) => {
              console.log('hehhe');
              total_count = result;
              const pageSize = i.items_per_page || 10; // Number of blogs per page

              total_page = Math.ceil(total_count / pageSize);
              console.log(total_count);
              return resolve({ customer_list, total_count, total_page });
            })
            .catch((err) => {
              return reject(err);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  ExportToCSV(i, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = i.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      company_repo
        .AdvancedSearch(i, company_id)
        .then((result) => {
          const csv = json2csv(result);
          resolve(csv);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  AddLogos(body, logos, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = body.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     return reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      company_repo
        .AddLogos(logos, company_id, body)
        .then((logo_id) => {
          company_repo
            .GetLogo(logo_id)
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
  GetLogos(body, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = body.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     return reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      company_repo
        .GetLogos(company_id)
        .then((result) => {
          return resolve(result);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }
  UpdateLogos(body, logo, status, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = body.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     return reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      console.log(status);
      if (status == 'title') {
        company_repo
          .UpdateLogoTitle(body)
          .then(() => {
            company_repo.GetLogo(body.id).then((result) => {
              console.log(result);
              return resolve(result);
            });
          })
          .catch((err) => {
            return reject(err);
          });
      } else {
        company_repo
          .UpdateLogo(logo, body, body.id, company_id)
          .then(() => {
            company_repo.GetLogo(body.id).then((result) => {
              console.log(result);
              return resolve(result);
            });
          })
          .catch((err) => {
            return reject(err);
          });
      }
    });
  }

  GetLogo(body, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = body.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     return reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      company_repo
        .GetLogo(body.id)
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  DeleteLogo(body, company_id) {
    return new Promise((resolve, reject) => {
      let accessToken = body.token;
      // var company_id;
      // jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
      //   if (err) {
      //     console.log(err);
      //     return reject('Authentication failed');
      //   } else {
      //     company_id = decoded.userId;
      //   }
      // });
      company_repo
        .DeleteLogo(body.id, company_id)
        .then(() => {
          return resolve();
        })
        .catch((err) => {
          console.log('error', err);
          return reject(err);
        });
    });
  }
  AddCompanyUser(body, company_id) {
    return new Promise((resolve, reject) => {
      // micro_service
      //   .VerifyJWT(body.token)
      //   .then(({company_id}) => {
      body.email = body.email.trim();
      company_repo
        .AddCompanyUser(body, company_id)
        .then((user_id) => {
          company_repo
            .AddCompanyUserAccess(body, user_id)
            .then(() => {
              company_repo
                .GetCompanyUserData()
                .then((user) => {
                  return resolve(user);
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
      // })
      // .catch((err) => {
      //   return reject(err);
      // });
    });
  }
  EditCompanyUser(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          body.email = body.email.trim();
          company_repo
            .doesUserExistInCompany(body.id, company_id)
            .then((data) => {
              company_repo
                .EditCompanyUser(body)
                .then((user_id) => {
                  company_repo
                    .EditCompanyUserAccess(body, user_id)
                    .then(() => {
                      company_repo
                        .GetCompanyUserData(body.id)
                        .then((result) => {
                          return resolve(result);
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
    });
  }
  CompanyUserTypes(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .GetUserAccessTypes()
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
  ListCompanyUser(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .ListCompanyUser(company_id)
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
  DeleteCompanyUser(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .DeleteCompanyUser(body.id, company_id)
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
  CompanyUserData(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .CompanyUserData(body.id, company_id)
            .then((result1) => {
              company_repo
                .UserAccess(body.id)
                .then((user_access) => {
                  console.log(result1[0]);
                  let user = {
                    id: result1[0].id,
                    name: result1[0].name,
                    company_id: result1[0].company_id,
                    email: result1[0].email,
                    password: result1[0].password,
                    factory_id: result1[0].factory_id,
                    factory_name: result1[0].factory_name,
                    user_access: user_access,
                  };
                  return resolve(user);
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
  Inventory(body) {
    return new Promise((resolve, reject) => {
      console.log(body)
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          console.log(company_id)

          company_repo
            .Inventory(body, company_id)
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
    });
  }

  getAlphanumericDetails(body) {
    return new Promise((resolve, reject) => {
      console.log(body)
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          console.log(company_id)

          company_repo
            .getAlphanumericData(body.alphanumeric, company_id)
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
    });
  }
  DispatchedProducts(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .GetTransactions(company_id)
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
    });
  }
  AddProduct(body, productImage) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          this.TypeChecking(body).then(
            ({
              i,
              category,
              warranty,
              additionalInfo,
              video,
              purchaseOptions,
            }) => {
              console.log(i);
              console.log(warranty);
              console.log(category);
              console.log(additionalInfo);
              console.log(video + 'video');
              company_repo
                .AddProductData(i, company_id)
                .then((id) => {
                  company_repo
                    .AddWarranty(id, warranty)
                    .then(() => {
                      console.log('warranty return');
                      company_repo
                        .AddCategory(id, category)
                        .then(() => {
                          console.log('ctg return');
                          company_repo
                            .AddAdditionalInfo(id, additionalInfo)
                            .then(() => {
                              console.log('adi return');
                              if (video && video.length > 0) {
                                company_repo
                                  .AddVideo(id, video)
                                  .then(() => {
                                    console.log('vdo return');
                                    company_repo
                                      .AddPurchaseOptions(id, purchaseOptions)
                                      .then(() => {
                                        console.log('apo return');
                                        company_repo
                                          .AddProductImage(id, productImage)
                                          .then(() => {
                                            company_repo
                                              .LinkProductToDefaultFactory(
                                                company_id,
                                                id
                                              )
                                              .then(() => {
                                                console.log('img return');
                                                return resolve('done');
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
                                console.group('ELSE');
                                company_repo
                                  .AddPurchaseOptions(id, purchaseOptions)
                                  .then(() => {
                                    console.log('apo return');
                                    company_repo
                                      .AddProductImage(id, productImage)
                                      .then(() => {
                                        company_repo
                                          .LinkProductToDefaultFactory(
                                            company_id,
                                            id
                                          )
                                          .then(() => {
                                            console.log('img return');
                                            return resolve('done');
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
          );
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  EditProduct(body, productImage) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          this.TypeChecking(body)
            .then(
              ({
                i,
                category,
                warranty,
                additionalInfo,
                video,
                purchaseOptions,
              }) => {
                console.log('additional' + additionalInfo[0].product_id);
                company_repo
                  .checkIfProductExits(additionalInfo[0].product_id, company_id)
                  .then((succcess) => {
                    company_repo
                      .EditProductData(additionalInfo[0].product_id, i)
                      .then((product_data) => {
                        company_repo
                          .EditWarranty(additionalInfo[0].product_id, warranty)
                          .then(() => {
                            console.log('warranty return');
                            company_repo
                              .EditCategory(
                                additionalInfo[0].product_id,
                                category
                              )
                              .then(() => {
                                console.log('ctg return');
                                company_repo
                                  .EditAdditionalInfo(
                                    additionalInfo[0].product_id,
                                    additionalInfo
                                  )
                                  .then(() => {
                                    console.log('adi return');
                                    company_repo
                                      .EditVideo(
                                        additionalInfo[0].product_id,
                                        video
                                      )
                                      .then(() => {
                                        console.log('vdo return');
                                        company_repo
                                          .EditPurchaseOptions(
                                            additionalInfo[0].product_id,
                                            purchaseOptions
                                          )
                                          .then(() => {
                                            console.log('apo return');
                                            company_repo
                                              .EditProductImage(
                                                additionalInfo[0].product_id,
                                                productImage
                                              )
                                              .then(() => {
                                                return resolve(
                                                  'Product updated!'
                                                );
                                                //   company_repo
                                                //     .LinkProductToDefaultFactory(
                                                //       company_id,
                                                //       id
                                                //     )
                                                //     .then(() => {
                                                //       console.log('img return');
                                                //       return resolve('done');
                                                //     })
                                                //     .catch((err) => {
                                                //       return reject(err);
                                                //     });
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
                      })
                      .catch((err) => {
                        console.log('typr');
                        return reject(err);
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    return reject(err);
                  });
              }
            )
            .catch((err) => {
              return reject(err);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  DeleteProduct(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .DeleteProduct(company_id, body.product_id)
            .then((resut) => {
              return resolve('Product Deleted');
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
  SearchFactory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .SearchFactory(body, company_id)
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
  ProductList(i) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(i.token)
        .then(({ company_id }) => {
          console.log('id+' + company_id);
          let product_list = [];
          let total_count = 0,
            total_page = 0;
          company_repo
            .GetProductListDetails(i, company_id)
            .then((product_list1) => {
              console.log('product_list' + product_list1);
              product_list = product_list1;
              company_repo
                .GetProductListDetailsTotalCount(i, company_id)
                .then((count) => {
                  // return resolve(product_list);
                  total_count = count;
                  const pageSize = i.items_per_page || 10; // Number of blogs per page

                  total_page = Math.ceil(total_count / pageSize);
                  return resolve({ product_list, total_count, total_page });
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
  ProductCategorySearch(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .ProductCategorySearch(body.keyword, company_id)
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
  DeleteFactoryProduct(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .DeleteFactoryProduct(body.id, company_id)
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
  DeleteFactory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .FetchFactoryDetails(body.id, company_id)
            .then((result) => {
              company_repo
                .DeleteFactory(body.id, company_id)
                .then((result) => {
                  return resolve(result);
                })
                .catch((err) => {
                  console.log(err);
                  return reject(err);
                });
            })
            .catch((err) => {
              return reject(err.message);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  UpdateFactoryProduct(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .UpdateFactoryProduct(body)
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
  UpdateFactory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          body.factory_name = body.factory_name.trim();

          company_repo
            .UpdateFactory(body, company_id)
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
  FetchFactoryProduct(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .FetchFactoryProduct(body)
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
  FetchFactory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .FetchFactory(company_id)
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
  FetchFactoryDetails(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .FetchFactoryDetails(body.factory_id, company_id)
            .then((result) => {
              company_repo
                .FetchFactoryProduct(body)
                .then((products) => {
                  // return resolve(result);
                  // const newresult = { ...result };
                  result[0].products = products;

                  return resolve(result);
                })
                .catch((err) => {
                  console.log(err);
                  return reject(err);
                });
            })
            .catch((err) => {
              return reject(err.message);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  FactoryAvailableProducts(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .FactoryAvailableProductlist(body, company_id)
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

  AddFactory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          body.factory_name = body.factory_name.trim();

          company_repo
            .AddFactory(body, company_id)
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
  ProductCategory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .ProductCategory(company_id)
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
  DeleteCompanyCategory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .DeleteCompanyCategory(body, company_id)
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
  GetCompanyCategory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .GetCompanyCategory(company_id)
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
  EditCompanyCategory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .EditCompanyCategory(body, company_id)
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
  AddCompanyCategory(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .AddCompanyCategory(body, company_id)
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
  FactoryProduct(body) {
    return new Promise((resolve, reject) => {
      // micro_service.VerifyJWT(body.token)
      // .then((company_id)=>{
      company_repo
        .FactoryProduct(body.factory_id)
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
      // })
      // .catch((err)=>{
      //     return reject(err)
      // })
    });
  }
  ProductDetails(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ company_id }) => {
          company_repo
            .ProductDetails(body, company_id)
            .then((result) => {
              console.log(result + 'err1');
              return resolve(result);
            })
            .catch((err) => {
              console.log(err);
              return reject(err.message);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  Identity(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyCompanyJWT(body.token)
        .then(({ user_id, company_id }) => {
          company_repo
            .CompanyIdentity(company_id)
            .then((company_details) => {
              console.log(company_details)
              let accessToken = body.token;
              this.getDashBoardUserProfileData(user_id, company_id).then((userData) => {
                return resolve({ accessToken, company_details: company_details, user_details: userData });

              }).catch((err) => {
                return reject(err);

              })
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
  TypeChecking(i) {
    return new Promise((resolve, reject) => {
      let category = [];
      if (typeof i.category == 'string') {
        category[0] = JSON.parse(i.category);
      } else {
        for (let j = 0; j < i.category.length; j++) {
          category.push(JSON.parse(i.category[j]));
        }
      }
      let warranty = [];
      if (typeof i.warranty == 'string') {
        warranty[0] = JSON.parse(i.warranty);
      } else {
        for (let j = 0; j < i.warranty.length; j++) {
          warranty.push(JSON.parse(i.warranty[j]));
        }
      }
      let additionalInfo = [];
      if (typeof i.additionalInfo == 'string') {
        additionalInfo[0] = JSON.parse(i.additionalInfo);
      } else {
        for (let j = 0; j < i.additionalInfo.length; j++) {
          additionalInfo.push(JSON.parse(i.additionalInfo[j]));
        }
      }
      let video = [];
      if (i['video'] && i.video.length > 0) {
        console.log('inside videooaoa');
        console.log(typeof i.video + 'video');
        if (typeof i.video == 'string') {
          video[0] = JSON.parse(i.video);
          if (video[0].video == '') {
            video[0] = '';
          }
        } else {
          for (let j = 0; j < i.video.length; j++) {
            video.push(JSON.parse(i.video[j]));
          }
        }
      }

      let purchaseOptions = [];
      if (typeof i.purchaseOptions == 'string') {
        if (i.purchaseOptions == '') {
          purchaseOptions[0] = '';
        } else {
          purchaseOptions[0] = JSON.parse(i.purchaseOptions);
        }
      } else {
        for (let j = 0; j < i.purchaseOptions.length; j++) {
          purchaseOptions.push(JSON.parse(i.purchaseOptions[j]));
        }
      }
      // let img
      // if (req.body.productImage) {
      //     img = req.body.productImage
      // }
      // else {
      //     img = ""
      // }
      console.log(video.length + 'length');
      const result = {
        i,
        category,
        warranty,
        additionalInfo,
        video,
        purchaseOptions,
      };
      console.log(result + 'result');
      return resolve(result);
    });
  }

  getTransactionsByBusinessId(body) {
    return new Promise((resolve, reject) => {
      micro_service.VerifyJWT(body.token)
        .then((company_id) => {
          let transactions_list = [];
          let total_count = 0,
            total_page = 0;
          company_repo
            .fetchQRCreditsTransaction(body, company_id)
            .then((transactions) => {
              transactions_list = transactions;
              company_repo
                .fetchQRCreditsTransactionTotalCount(company_id)
                .then((count) => {
                  // return resolve(product_list);
                  total_count = count;
                  const pageSize = body.items_per_page || 10; // Number of blogs per page

                  total_page = Math.ceil(total_count / pageSize);
                  return resolve({
                    transactions_list,
                    total_count,
                    total_page,
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
    });
  }

  getBusinessIdByEmail = (email) => {
    return new Promise((resolve, reject) => {

      company_repo.getBusinessId(email).then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(err)
      })
    })
  }


  HardDeleteCompany = async (business_id) => {
    try {

      const products = await company_repo.GetAllProduct(business_id)
      if (products && products.length > 0) {
        for (let i in products) {
          const deleteProduct = await company_repo.HardDeleteProductDetails(products[i], business_id)
        }
      }
      const company_user = await company_repo.getAllCompanyUserData(business_id)
      if (company_user && company_user.length > 0) {
        for (let j in company_user) {
          const deleteCompanyUserData = await operator_repo.HardDeleteCompanyUserDetails(company_user[j].id)
        }
      }

      const deletecompanyDetails = await company_repo.HardDeleteCompanyDetails(business_id)
      return
    } catch (err) { throw err }
  }
  getCompanyOverView = (body, user) => {
    return new Promise((resolve, reject) => {

      company_repo.GetCompanyOverview(body, user.company_id).then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(err)
      })
    })
  }

  getInstallationData = (body, user) => {
    return new Promise((resolve, reject) => {

      company_repo.fetchInstallationData(body, user.company_id).then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(err)
      })
    })
  }

  getInstallationMailDetails = (body, user) => {
    return new Promise((resolve, reject) => {

      company_repo.getInstallationMailCredentials(user.company_id).then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(err)
      })
    })
  }

  updateInstallationMailDetails = (body, user) => {
    return new Promise((resolve, reject) => {

      company_repo.updateInstallationMailCredentials(body, user.company_id).then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(err)
      })
    })
  }

  createNewDashBoardRole = async (body, user) => {
    // return new Promise((resolve, reject) => {
    console.log(body)
    try {
      if (body && (!body.role_name || !(body.role_name.trim()))) {
        throw new Error("Unable to save, Role name is Required!")
      }
      if (body && (!body.permissions || body.permissions.length <= 0)) {
        throw new Error("Unable to save, At least 1 permission is Required!")

      }
      // if(body.role_name.toLowerCase()==="admin"){
      //   throw new Error("Unable to save, Invalid role name!, name cannot be Admin")
      // }

      const dashRole = await company_repo.CreateNewDashboardRole(body, user.company_id)
      const role_id = dashRole.insertId
      for (let i = 0; i < body.permissions.length; i++) {

        const insertPermisssions = await company_repo.CreateNewDashboardRolePermission(role_id, body.permissions[i])

      }
      // return resolve(result)
      return ("Role Saved")

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
    // })
  }

  updateDashBoardRole = async (body, user) => {
    // return new Promise((resolve, reject) => {
    try {
      if (body && !body.role_id) {

        throw new Error("Unable to save, Role Id is Required!")

      }
      if (body && (!body.role_name || !(body.role_name.trim()))) {
        throw new Error("Unable to save, Role name is Required!")
      }
      if (body && (!body.permissions || body.permissions.length <= 0)) {
        throw new Error("Unable to save, At least 1 permission is Required!")

      }
      const dashRole1 = await company_repo.getDashboardRoleByID(body, user.company_id)
      if (!dashRole1 || dashRole1.length <= 0) {
        throw new Error("Invalid Id, Role Not Found!")
      }
      // if(dashRole1[0].role_name==="Admin"){
      //   throw new Error("Admin Role Cannot be edited!")

      // }
      const dashRole = await company_repo.updateDashboardRole(body, user.company_id)
      console.log(dashRole)
      const deleteDashboardRolePermissions = await company_repo.deleteDashboardRolePermissions(body, user.company_id)


      for (let i = 0; i < body.permissions.length; i++) {

        const insertPermisssions = await company_repo.CreateNewDashboardRolePermission(body.role_id, body.permissions[i])

      }
      // return resolve(result)
      return ("Role updated")

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
    // })
  }

  deleteDashBoardRoleByID = async (body, user) => {
    // return new Promise((resolve, reject) => {
    try {
      if (body && !body.role_id) {

        throw new Error("Unable to save, Role Id is Required!")

      }
      const dashRole1 = await company_repo.getDashboardRoleByID(body, user.company_id)
      if (!dashRole1 || dashRole1.length <= 0) {
        throw new Error("Invalid Id, Role Not Found!")
      }
      // if(dashRole1[0].role_name==="Admin"){
      //   throw new Error("Admin Role Cannot be deleted!")

      // }

      const dash_users = await company_repo.getDashboardUserCountByRoleID(body.role_id)
      if (dash_users > 0) {
        throw new Error("Cannot delete the role. There are existing Dashboard-User accounts associated with this role. Please delete those users or unlink this role from their accounts and try again.");

        // throw new Error("Cannot Delete this role, Dashboard-User with this role exits, kindly delete those users or unlink this role from their account and try again! ")
      }

      const deleteRole = await company_repo.deleteDashboardRoleById(body, user.company_id)

      const deleteDashboardRolePermissions = await company_repo.deleteDashboardRolePermissions(body, user.company_id)


      // return resolve(result)
      return ("Role deleted!")

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
    // })
  }
  getDashBoardRoleDataById = async (body, user) => {
    try {
      if (body && !body.role_id) {

        throw new Error("Unable to fetch, Role Id is Required!")

      }


      const dashRole = await company_repo.getDashboardRoleByID(body, user.company_id)
      if (!dashRole || dashRole.length <= 0) {
        throw new Error("Invalid Id, Role Not Found!")
      }
      const permissions = await company_repo.getDashboardRolePermissionsById(body, user.company_id)
      const result = {
        role_id: dashRole[0].id,
        role_name: dashRole[0].role_name,
        company_id: dashRole[0].company_id,
        created_on: dashRole[0].created_on,
        permissions: permissions
      }


      // return resolve(result)
      return (result)

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
  }

  getDashboardRolesList = async (body, user) => {
    try {



      const dashRole = await company_repo.getAllDashboardRoles(user.company_id)
      console.log(dashRole)
      const result = []
      for (let i = 0; i < dashRole.length; i++) {

        const permissions = await company_repo.getDashboardRolePermissionsById({ role_id: dashRole[i].id }, user.company_id)
        console.log(permissions)
        const result1 = {
          role_id: dashRole[i].id,
          role_name: dashRole[i].role_name,
          company_id: dashRole[i].company_id,
          created_on: dashRole[i].created_on,
          permissions: permissions
        }
        result.push(result1)
      }




      // return resolve(result)
      return (result)

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
  }

  createNewDashBoardUser = async (body, user) => {
    // return new Promise((resolve, reject) => {
    console.log(body)
    try {
      if (body && (!body.name || !(body.name.trim()))) {
        throw new Error("Unable to save,  name is Required!")
      }

      if (body && (!body.email || !(body.email.trim()))) {
        throw new Error("Unable to save,  email is Required!")
      }

      if (body && (!body.password || !(body.password.trim()))) {
        throw new Error("Unable to save,  password is Required!")
      }
      if (body && (!body.role_id)) {
        throw new Error("Unable to save,  role is Required!")
      }
      body.email = body.email.trim()
      const doesEmailExists = await company_repo.doesDasboardEmailAlreadyExist(body.email)
      if (doesEmailExists && doesEmailExists.length >= 1) {
        throw new Error("Cannot create User! Email already Exists!")
      }
      console.log(body)
      const roleExist = await company_repo.getDashboardRoleByID(body, user.company_id)
      console.log(roleExist)
      if (!roleExist || roleExist.length <= 0) {
        throw new Error("Invalid role_id, Dashboard-Role Not Found!")
      }

      const HashPassword = await micro_service.HashPassword(body.password)

      const dashRole = await company_repo.CreateNewDashboardUser(body, HashPassword, user.company_id)
      if (dashRole && !dashRole.insertId) {
        throw new Error("Unable to create User!")
      }
      const user_id = dashRole.insertId
      const role_mapping = await company_repo.CreateNewDashboardUserRole(body.role_id, user_id)


      return ("User Created Successfully")

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
    // })
  }

  updateDashBoardUser = async (body, user) => {
    // return new Promise((resolve, reject) => {
    console.log(body)
    try {
      if (body && (!body.name || !(body.name.trim()))) {
        throw new Error("Unable to save,  name is Required!")
      }

      if (body && (!body.email || !(body.email.trim()))) {
        throw new Error("Unable to save,  email is Required!")
      }
      if (body.password && !body.password.trim()) {
        throw new Error("Unable to save,  Password is Required!")
      }
      if (body && (!body.id)) {
        throw new Error("Unable to save,  User Id  is Required!")
      }

      if (body && (!body.role_id)) {
        throw new Error("Unable to save,  role is Required!")
      }
      body.email = body.email.trim()
      const doesEmailExists = await company_repo.doesDasboardEmailAlreadyExistUpdate(body.email, body.id)
      if (doesEmailExists && doesEmailExists.length >= 1) {
        throw new Error("Cannot Update User! Email already Exists!")
      }
      const userData = await company_repo.getDashboardUserDataByID(body, user.company_id)

      if (!userData || (userData && userData.length <= 0)) {
        throw new Error("User Not Found!")
      }
      const roleExist = await company_repo.getDashboardRoleByID(body, user.company_id)
      if (!roleExist || roleExist.length <= 0) {
        throw new Error("Invalid role_id, Dashboard-Role Not Found!")
      }

      if (body.password) {
        const HashPassword = await micro_service.HashPassword(body.password)
        const updateDashRole = await company_repo.UpdateDashboardUserDataWithPassword(body, HashPassword, user.company_id)

      }
      else {
        const updateDashRole = await company_repo.UpdateDashboardUserDataWithoutPassword(body, user.company_id)
      }

      //  const dashRole=await company_repo.CreateNewDashboardUser(body,HashPassword,user.company_id)
      //  if(dashRole&&!dashRole.insertId){
      //   throw new Error("Unable to create User!")
      //  }
      //  const user_id=dashRole.insertId
      const deleteUserRole = await company_repo.DeleteDashboardUserRole(body.id)
      const role_mapping = await company_repo.CreateNewDashboardUserRole(body.role_id, body.id)


      return ("User updated Successfully")

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
    // })
  }

  getDashBoardUserData = async (body, user) => {
    try {
      if (body && !body.id) {

        throw new Error("Unable to fetch,  Id is Required!")

      }

      const userData = await company_repo.getDashboardUserDataByID(body, user.company_id)

      if (!userData || (userData && userData.length <= 0)) {
        throw new Error("User Not Found!")
      }
      const role_id = await company_repo.getDashboardUserRole(body.id)

      if (role_id.length > 0) {
        userData[0].role_id = role_id[0].fk_role_id
      }


      // return resolve(result)
      return (userData[0])

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
  }

  DeleteDashBoardUser = async (body, user) => {
    try {
      if (body && !body.id) {

        throw new Error("Unable to Delete,  Id is Required!")

      }

      // const adminCount=await company_repo.getAdminCount(body,business_id)
      // if(adminCount&&adminCount[0].admin_count){
      //   throw new Error("Cannot Delete User! No other Admin Exits, First reate an Admin then delete this user.")
      // }
      const userData = await company_repo.DeleteDashboardUser(body, user.company_id)



      // return resolve(result)
      return ("Deleted User!")

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
  }



  getDashBoardUsersList = async (body, user) => {
    try {



      const userData = await company_repo.getDashboardUsersList(body, user.company_id)



      // return resolve(result)
      return (userData)

    } catch (err) {
      if (err.message)
        throw err.message
      else {
        throw err

      }
    }
  }
  validateBulkData(field_name, data, type, maxlength) {
    console.log(typeof (data.length) + ";eng")
    console.log(typeof (maxlength))

    let errors = []
    if (data) {
      data = data.trim()
    }

    if (!data) {
      errors.push({ error: `${field_name} is required!` })
    }

    else if (typeof (data) != type) {
      errors.push({ error: `Invalid data, ${field_name} should be a ${type}` })
    }

    else if (data && data.length > maxlength) {
      console.log("rer")
      errors.push({ error: `Invalid data, ${field_name} should have max length of ${maxlength}` })
    }
    console.log(data && data.length > maxlength)
    return { value: data, error: errors }
  }


  validateWarranty(year, month) {
    let errors = []
    const years = year, months = month

    if (!years && !months) {
      errors.push({ error: `Warranty is required!` })

    }
    else if (years && isNaN(years)) {
      errors.push({ error: `Invalid Warranty! years should be a number` })

    }
    else if (months && isNaN(years)) {
      errors.push({ error: `Invalid Warranty! months should be a number` })

    }
    return ({ value: { months: months, years: years }, error: errors })
  }

  validateBooleanData(data, field_name) {
    let errors = []
    let newData = data
    if (!newData) {
      newData = 0

    }
    else if (newData !== 0 && newData !== 1) {
      errors.push({ error: `${field_name} should be 1 or 0` })
    }
    return ({ value: data, error: errors })

  }


  bulkUploadProduct = async (file_url, company_id) => {
    try {
      console.log(file_url)
      const parsedData = micro_service.convertExcelToJSON(file_url)
      let data = []
      for (let i = 0; i < parsedData.length; i++) {
        let rowData = {}
        rowData.product_name = this.validateBulkData("product_name", parsedData[i].product_name ? parsedData[i].product_name : '', "string", 200)

        rowData.product_model = this.validateBulkData("product_model", parsedData[i].product_model ? parsedData[i].product_model : '', "string", 200)
        rowData.product_description = this.validateBulkData("prod_description", parsedData[i].prod_description ? parsedData[i].prod_description : '', "string", 500)
        rowData.product_description_for_customer = this.validateBulkData("product_description_for_customer", parsedData[i].product_desc_for_customer ? parsedData[i].product_desc_for_customer : '', 'string', Number.MAX_SAFE_INTEGER)
        rowData.warranty = this.validateWarranty(parsedData[i].warranty_in_years, parsedData[i].warranty_in_months)
        rowData.show_manufacture_date = this.validateBooleanData(parsedData[i].show_manufacture_date, "show_manufacture_date")
        rowData.installation_required = this.validateBooleanData(parsedData[i].installation_required, "installation_required")
        rowData.video_link = this.validateBulkData("video_link", parsedData[i].video_link ? parsedData[i].video_link : '', "string", 500)
        rowData.image_link = this.validateBulkData("image_link", parsedData[i].product_image ? parsedData[i].product_image : '', "string", 500)
        // rowData.productDescForCustomer= this.validateBulkData("image_link",parsedData[i].product_desc_for_customer?parsedData[i].product_desc_for_customer:'',"string",500)
        rowData.logo = await company_repo.getLogoByName(parsedData[i].logo ? parsedData[i].logo.trim() : "", company_id)

        if (!parsedData[i].categories) {
          rowData.category_data = { value: [], errors: [{ error: "category is required!" }] }
        }
        else {
          const categories = parsedData[i].categories.split(",")
          let cate_errors = [], cate_data = []
          for (let j in categories) {
            let cate_row = { category_name: categories[j] }
            const category = await company_repo.getCategoryByName(categories[j], company_id)
            if (category.error) {
              cate_errors.push(category.error)
            }
            if (category.data) {
              cate_row.category_data = category.data
            }

            cate_data.push(cate_row)



          }
          rowData.category_data = { value: cate_data, errors: cate_errors }

        }
        const addition_detail_title = parsedData[i].addition_detail_title
        const addition_detail_description = parsedData[i].addition_detail_desc
        let addition_detail_title_errors = [], addition_detail_desc_errors = []
        if (!addition_detail_title || (addition_detail_title && !addition_detail_title.trim())) {
          addition_detail_title_errors.push({ error: `title is required!` })
        }
        else if (typeof (addition_detail_title) != "string") {
          addition_detail_title_errors.push({ error: `Invalid data, title should be a string` })
        }
        else if (addition_detail_title && addition_detail_title.length > 200) {
          addition_detail_title_errors.push({ error: `Invalid data, title should have max length of 200` })
        }

        if (!addition_detail_description || (addition_detail_description && !addition_detail_description.trim())) {
          addition_detail_desc_errors.push({ error: `description is required!` })
        }
        else if (typeof (addition_detail_description) != "string") {
          addition_detail_desc_errors.push({ error: `Invalid data, description should be a string` })
        }

        rowData.additional_info = { title: { value: addition_detail_title, errors: addition_detail_title_errors }, description: { value: addition_detail_description, errors: addition_detail_desc_errors } }

        const store_name = parsedData[i].store_name ? parsedData[i].store_name : ""
        const review_link = parsedData[i].review_link ? parsedData[i].review_link : ""
        let purchase_options_title_errors = [], purchase_options_link_errors = []
        if (!store_name) {
          purchase_options_title_errors.push({ error: `title is required!` })
        }
        else if (typeof (store_name) != "string") {
          purchase_options_title_errors.push({ error: `Invalid data, title  should be a String` })
        }


        if (!review_link) {
          purchase_options_link_errors.push({ error: `review_link is required!` })
        }
        else if (typeof (review_link) != "string") {
          purchase_options_link_errors.push({ error: `Invalid data, review_link should be a String` })
        }
        else if (review_link && review_link.length > 500) {
          purchase_options_link_errors.push({ error: `Invalid data, review_link should have max length of 500` })
        }


        rowData.purchaseOptions = { title: { value: store_name, errors: addition_detail_title_errors }, link: { value: review_link, errors: purchase_options_link_errors } }
        // rowData.requestData={
        //   category: rowData.category_data.data,
        //   warranty: { name: 'Product Warranty', year: rowData.warranty.data.years, month: rowData.warranty.data.months},
        //   additionalInfo: { title:rowData.additional_info.data.title, description: rowData.additional_info.data.description },
        //   video: { video:parsedData[i].video_link?parsedData[i].video_link:''  },
        //   purchaseOptions: { title:  rowData.purchaseOptions.data.title, link: rowData.purchaseOptions.data.link },
        //   productImage: parsedData[i].product_image?parsedData[i].product_image:'',
        //   product_name: parsedData[i].product_name?parsedData[i].product_name:'',
        //   productModel: parsedData[i].product_model?parsedData[i].product_model:'',
        //   productDescription: parsedData[i].prod_description?parsedData[i].prod_description:'',
        //   showManufactureDate: parsedData[i].show_manufacture_date?parsedData[i].show_manufacture_date:0,
        //   is_installation_required:  parsedData[i].installation_required?parsedData[i].installation_required:0,
        //   productDescForCustomer: parsedData[i].product_desc_for_customer?parsedData[i].product_desc_for_customer:0,
        //   company_logo:rowData.logo.data.logo_data?rowData.logo.data.logo_data:"",
        // }

        data.push(rowData)


      }

      return data

    } catch (err) {
      throw err
    }

  }



}
module.exports = CompanyManager;

