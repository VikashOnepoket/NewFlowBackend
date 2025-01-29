const AdminRepository = require('../Repositories/admin_repository');
const admin_repo = new AdminRepository();
const MicroService = require('../MicroServices/services');
const CompanyRepository = require('../Repositories/company_repository');
const company_repo = new CompanyRepository();
const QRCreditRepository = require('../Repositories/QR_credits_Repository');
const qrCreditRepository = new QRCreditRepository();
const micro_service = new MicroService();
const AWS = require('aws-sdk');
const sendMail = require('../MicroServices/email');
const jwt = require('jsonwebtoken');

const PDFTemplatesRepository = require('../Repositories/PDFTemplates_repository');
const CompanyManager = require('./company_manager');
const company_mangobj=new CompanyManager()
const PDFTemplatesRepositoryobj = new PDFTemplatesRepository();
// console.log(pro

class AdminManager {

  // constructor() {
  //   const Admin_token_expiry = process.env.SESSION_TIMEOUT_SUPERADMIN;

  //   console.log("superadtimeout"+Admin_token_expiry)
  //   const Company_token_expiry = process.env.SESSION_TIMEOUT_COMPANY;
  // }
  
  Login(body) {

    return new Promise((resolve, reject) => {
      admin_repo
        .Login(body.email, body.password)
        .then((result) => {
          console.log(process.env.SESSION_TIMEOUT_SUPERADMIN)
          micro_service
            .GenerateToken(result[0].id, process.env.SESSION_TIMEOUT_SUPERADMIN)
            .then((token) => {
              let response = {
                email: result[0].email,
              };
              return resolve({ token, response });
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  adminCompanyLogin = (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        const adminId = await micro_service.VerifyJWT(body.token);
        let adminExists;
        if (adminId) {
          console.log(adminId);
          adminExists = await admin_repo.LoginWithIdPassword(adminId);
          console.log(adminExists);
          // if (adminExists) {
          //   const userData = await company_repo.GetCompanyDetails(
          //     body.business_id
          //   );
          if (adminExists) {
            company_repo
              .isUserCredentialsValidAdmin(body.company_id)
              .then((result) => {
                if (result == 'Invalid credentials!') {
                  
                  return reject('Invalid Company id');
                  // throw new Error(result);
                } else {
                  if (result[0].role == 'company') {
                    return company_repo
                      .CompanyIdentity(body.company_id)
                      .then((company_details) => {

                        company_repo
                      .GetCompanyRootUserId(result[0].business_id).then((root_id)=>{
            console.log("root"+root_id)
                        company_mangobj.getDashBoardUserProfileData(root_id,body.company_id).then((user_details)=>{
                          // micro_service
                          // .GenerateToken(body.company_id, process.env.SESSION_TIMEOUT_COMPANY)
                          // .then((token) => {
                            let accessToken = jwt.sign({ user_id: user_details.user_id,company_id:company_details.business_id }, process.env.JWT_SECRET, {
                              expiresIn: process.env.SESSION_TIMEOUT_COMPANY,
                            });
                            return resolve({
                              accessToken: accessToken,
                              data:{company_details: company_details,user_details:user_details}
                            });
                          // })
                          // .catch((err) => {
                          //   // throw new Error(err.message);
                          //   return reject(err);
                          // });

                        }).catch((err)=>{
                          console.log(err)
                          return reject(err)})
                      }).catch((err)=>{return reject(err)})
                        // company_repo.GetCompanyDetails(body.business_id);
                        
                        
                      })
                      .catch((err) => {
                        // throw new Error(err.message);
                        return reject(err);
                      });
                  } else {
                    return reject('Invalid company id');
                  }
                }
              })
              .catch((err) => {
                return reject(err);
              });
          }
        }
      } catch (err) {
        //console.log(err);
        return reject(err);
      }
    });
  };
  ListCompanies(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((user_id) => {
          let companies_list = [];
          let total_count = 0,
            total_page = 0;
          admin_repo
            .ListCompanies(body)
            .then((result) => {
              // return resolve(result);
              console.log(result);
              companies_list = result;

              admin_repo
                .ListCompaniesTotalCount(body)
                .then((count) => {
                  // return resolve(product_list);
                  total_count = count;
                  const pageSize = body.items_per_page || 10; // Number of blogs per page

                  total_page = Math.ceil(total_count / pageSize);
                  return resolve({ companies_list, total_count, total_page });
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

  RegisterCompany(body, avatar) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((user_id) => {
          body.email = body.email.trim();
            company_repo.doesDasboardEmailAlreadyExist(body.email).then((doesEmailExists)=>{
              if(doesEmailExists&&doesEmailExists.length>=1){
                // 
                return reject("Email already Exists!")
               }
               admin_repo
               .RegisterCompany(body)
               .then((business_id) => {
                 admin_repo
                   .RegisterCompanyDetails(business_id, body, avatar)
                   .then(() => {
   
                    //  this.createRootDashBoardRole(business_id).then((role_id)=>{
                       this.createRootUser({
                         email:body.email,
                         name:body.owner_name,
                         password:body.password},business_id).then((adminData)=>{
   
                           admin_repo
                       .CreateDefaultFactory(business_id)
                       .then(() => {
                         admin_repo
                           .ListCompany(business_id)
                           .then((result) => {
                             qrCreditRepository
                               .insertQRCreditTransaction({
                                 business_id: business_id,
                                 transaction_remarks: `Initial Balance on account creation`,
                                 created_on: new Date(),
                                 amount: body.initial_credits
                                   ? body.initial_credits
                                   : 0,
                                 is_credited: 1,
                                 is_debited: 0,
                                 credited_by: `Admin ${user_id}`,
                                 remaining_credits: body.initial_credits
                                   ? body.initial_credits
                                   : 0,
                                 transaction_type: 'credit',
                               })
                               .then(() => {
                                 admin_repo.saveInstallationMailCredentials(business_id,body.email).then((installMessage)=>{
   
   
                                   const info = sendMail({
                                   toEmail: body.email,
                                   subject: 'Welcome To Onepoket',
                                   // text: `${emailFrom} shared a file with you.`,
                                   html: require('../templates/welcome-email.template')({
                                     company_name: body.owner_name,
                                     login_url: "https://dev-company.onepoket.com/login",
                                     email:body.email,
                                     password:body.password
                                   }),
                                 })
                                   .then(() => {
                                     return true;
                                   })
                                   .catch((err) => {
                                     throw new Error(err);
                                   });
                                 if (info) 
                                 return resolve(result);
   
                                 }).catch((err)=>{return reject(err)})
                                 
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
                         }).catch((err)=>{ return reject(err);})
   
   
                     }).catch((err)=>{
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
            // }).catch((err)=>{return reject(err)})
         
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  UpdateCompany(body, avatar) {
    return new Promise((resolve, reject) => {
      console.log(body);
      console.log(avatar);
      micro_service
        .VerifyJWT(body.token)
        .then((user_id) => {
          body.email = body.email.trim();
          company_repo
            .doesDasboardEmailAlreadyExist(body.email)
            .then((email_exits) => {
              // company_repo.doesDasboardEmailAlreadyExist(body.email).then((doesEmailExists)=>{
              //   if(doesEmailExists&&doesEmailExists.length>=1){
              //     throw new Error("Email already Exists!")
              //    }'
              if (email_exits.length > 0) {
                console.log(email_exits)
                // console.log('no user');
                if(email_exits[0].company_id==body.business_id&&email_exits[0].is_root){
                  // console.log(result);
                  if (avatar == undefined) {
                    admin_repo
                      .UpdateCompanyWithoutAvatar(body, body.business_id)
                      .then(() => {
                        admin_repo
                          .UpdateCompanyCredentials(body, body.business_id)
                          .then(() => {
                            
                            admin_repo
                              .ListCompany(body.business_id)
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
                  } else {
                    console.log('Hi in with');
                    admin_repo
                      .UpdateCompanyWithAvatar(body, body.business_id, avatar[0])
                      .then(() => {
                        admin_repo
                          .UpdateCompanyCredentials(body, body.business_id)
                          .then(() => {
                            admin_repo
                              .ListCompany(body.business_id)
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
                  }
                }
                else{
                  return reject(
                    'Unable to change Email.Company with entered email id already exist!'
                  );
                }}
                else{
                  if (avatar == undefined) {
                    console.log("without")
                    admin_repo
                      .UpdateCompanyWithoutAvatar(body, body.business_id)
                      .then(() => {
                        admin_repo
                          .UpdateCompanyCredentials(body, body.business_id)
                          .then(() => {
                            
                            admin_repo
                              .ListCompany(body.business_id)
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
                  } else {
                    console.log('Hi in with');
                    admin_repo
                      .UpdateCompanyWithAvatar(body, body.business_id, avatar[0])
                      .then(() => {
                        admin_repo
                          .UpdateCompanyCredentials(body, body.business_id)
                          .then(() => {
                            admin_repo
                              .ListCompany(body.business_id)
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
                  }
                }
             
            // }) .catch((err) => {
            //   return reject(err);
            // });
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
  DeleteCompany(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((user_id) => {
          admin_repo
            .DeleteCompany(body.business_id)
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
  //companycredits
  AddCompanyCredits(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((user_id) => {
          company_repo
            .GetRemainingCompanyQRCredits(body.business_id)
            .then((remaining_credits) => {
              console.log(typeof body.credits);
              const finalcredits =
                Number(remaining_credits) + Number(body.credits);
              admin_repo
                .AddCompanyQRCredits(body, finalcredits, user_id)
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
    });
  }

  CompanyDetails(body) {
    return new Promise((resolve, reject) => {
      micro_service
        .VerifyJWT(body.token)
        .then((user_id) => {
          admin_repo
            .GetCompanyDetailsByID(body.company_id)
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

  SaveNewPDFTemplateDetails = async (body, file) => {
    try {
      const s3Url = await micro_service.uploadFileTos3(body.template_pdf);

      const TempData = await PDFTemplatesRepositoryobj.SaveNewPDFTemplateData(
        body,
        s3Url
      );

      return TempData;
    } catch (error) {
      console.error('Error inserting template:', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error.message);
    }
  };

  getAllGlobalTemplates(body) {
    return new Promise((resolve, reject) => {
      PDFTemplatesRepositoryobj.GetAllGlobalTemplatesData()
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  EditPDFTemplateDetails = async (body, file) => {
    try {
      const s3Url = await micro_service.uploadFileTos3(body.template_pdf);

      const TempData = await PDFTemplatesRepositoryobj.EditPDFTemplateData(
        body.template_id,
        body,
        s3Url
      );

      return TempData;
    } catch (error) {
      console.error('Error inserting template:', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error);
    }
  };
  DeleteTemplate = async (body) => {
    try {
      // const s3Url = await micro_service.uploadFileTos3(file);

      const TempData = await PDFTemplatesRepositoryobj.DeleteTemplate(
        body.template_id
      );

      return TempData;
    } catch (error) {
      console.error('Error inserting template:', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error);
    }
  };
  GetTemplateByID = async (body) => {
    try {
      // const s3Url = await micro_service.uploadFileTos3(file);

      const TempData = await PDFTemplatesRepositoryobj.GetTemplateDataByID(
        body.template_id
      );

      return TempData;
    } catch (error) {
      console.error('Error inserting template:', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error);
    }
  };

  getDefaultConfigs = async (body) => {
    try {
      // const s3Url = await micro_service.uploadFileTos3(file);

     const TempData=await admin_repo.GetDefaultConfigs()

      return TempData;
    } catch (error) {
      console.error('Error inserting template:', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error);
    }
  };

  updateDefaultConfigs = async (body) => {
    try {
      // const s3Url = await micro_service.uploadFileTos3(file);

     const TempData=await admin_repo.UpdateDefaultConfigs(body)
     const updateenv=await admin_repo.getAllDefaultConfigsAndSetEnv()

     console.log(process.env.CREDIT_BALANCE_CHECK)

      return TempData;
    } catch (error) {
      console.error('Error inserting template:', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error);
    }
  };

  HardDeleteCompanies=async(body)=>{
    try {
      // const s3Url = await micro_service.uploadFileTos3(file);
      const filePath=`logs/${new Date().toISOString().replace(/:/g, '-')}.log`

    const {company_emails}=body
    for(let i in company_emails){
      try{
        console.log(i)
      const company_id_result=await company_repo.getBusinessId(company_emails[i])
      console.log(company_id_result)
      if(company_id_result&&company_id_result.length>0){
        for(let j in company_id_result){        
          const delete_company=await company_mangobj.HardDeleteCompany(company_id_result[j].business_id)
          micro_service.writeToLog(`Deleted All Data of Company with email ${company_emails[i]}`,filePath)
   }
      }
      

      }catch(err){
        console.log(err)
        micro_service.writeToLog(`Error in deleting company ${i}  ERROR: ${err.message}`,filePath)

        continue
      }
    }

      return ;
    } catch (error) {
      console.error('Error Deleteing companies', error);
      // res.status(500).send('Internal Server Error');
      throw new Error(error);
    }

  }

  createNewDashboardPermission=(body)=>{
    return new Promise((resolve, reject) => {
      if(body&&(!body.permission_name||!(body.permission_name.trim()))){
        return reject("Permission Name is Required")
      }

      admin_repo.CreateNewDashboardPermission(body).then((result)=>{
        return resolve(result)
      }).catch((err)=>{
        return reject(err)
      })
    })
  }

  updateDashboardPermission=(body)=>{
    return new Promise((resolve, reject) => {
      if(body&&(!body.id)){
        return reject("Permission id is Required")
      }    
      
      if(body&&(!body.permission_name||!(body.permission_name.trim()))){
        return reject("Permission Name is Required")
      }

      admin_repo.updateDashboardPermission(body).then((result)=>{
        return resolve(result)
      }).catch((err)=>{
        return reject(err)
      })
    })
  }

  getAllDashboardPermissions=(body)=>{
    return new Promise((resolve, reject) => {

      admin_repo.getDashboardPermissions(body).then((result)=>{
        return resolve(result)
      }).catch((err)=>{
        return reject(err)
      })
    })
  }

  // createRootDashBoardRole=async(business_id)=>{
  //   // return new Promise((resolve, reject) => {
  //     // console.log()
  //     try{
  //       data={
  //         role_name:"root"
  //       }
     

  //    const dashRole=await company_repo.CreateNewDashboardRole(data,business_id)
  //    const getAllPermissions= await admin_repo.getDashboardPermissions(body)
  //    const role_id=dashRole.insertId
  //        for(let i=0;i<getAllPermissions.length;i++){

  //         const insertPermisssions=await company_repo.CreateNewDashboardRolePermission(role_id,getAllPermissions[i].id)

  //        }
  //       // return resolve(result)
  //       return (role_id)
        
  //     }catch(err){
  //       if(err.message)
  //       throw err.message
  //     else{
  //       throw err

  //     }
  //     }
    
  // }
  createRootUser=async(body,business_id)=>{
    console.log(body)
    try{
    if(body&&(!body.name||!(body.name.trim()))){
     throw new Error("Unable to save,  name is Required!")
    }

    if(body&&(!body.email||!(body.email.trim()))){
      throw new Error("Unable to save,  email is Required!")
     }

     if(body&&(!body.password||!(body.password.trim()))){
      throw new Error("Unable to save,  password is Required!")
     } 
    //  if(body&&(!body.role_id)){
    //   throw new Error("Unable to save,  role is Required!")
    //  }   
     body.email=body.email.trim()
    //  const doesEmailExists=await company_repo.doesDasboardEmailAlreadyExist(body.email)
    //  if(doesEmailExists&&doesEmailExists.length>=1){
    //   throw new Error("Cannot create User! Email already Exists!")
    //  }
     console.log(body)
    //  const roleExist=await company_repo.getDashboardRoleByID(body,user.company_id)
    //  console.log(roleExist)
    //  if(!roleExist||roleExist.length<=0){
    //   throw new Error("Invalid role_id, Dashboard-Role Not Found!")
    //  }
   
     const HashPassword=await micro_service.HashPassword(body.password)

   const dashRole=await company_repo.CreateNewDashboardUser(body,HashPassword,business_id,1)
   if(dashRole&&!dashRole.insertId){
    throw new Error("Unable to create User!")
   }
  //  const user_id=dashRole.insertId
  //  const  role_mapping=await company_repo.CreateNewDashboardUserRole(body.role_id,user_id)
   
    
      return ("Admin User Created Successfully")
      
    }catch(err){
      if(err.message)
      throw err.message
    else{
      throw err

    }
    }
    
  }
}

module.exports = AdminManager;
