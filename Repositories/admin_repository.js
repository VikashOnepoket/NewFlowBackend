const db = require('../Database_connection/db');
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();

const QRCreditRepository = require('../Repositories/QR_credits_Repository');
const qrCreditRepository = new QRCreditRepository();
class AdminRepository {
  ListCompanies(request_body) {
    return new Promise((resolve, reject) => {
      const page = request_body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = request_body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      let search_by = request_body.search_by || '';
      // let filter_by = i.filter_by || '';
      console.log('ser' + search_by);

      var srchStr = '';
      var andStr = 'and';
      var sort_order = 'DESC';
      var sort_by = 'b.created_at';

      if (request_body.sort_order != null) {
        if (request_body.sort_order == 1) {
          sort_order = 'ASC';
        } else if (request_body.sort_order == -1) {
          sort_order = 'DESC';
        }
      }

      if (request_body.sort_by != '' && request_body.sort_by != null) {
        if (request_body.sort_by == 'display_name') {
          sort_by = 'c.display_name';
        }
        if (request_body.sort_by == 'email') {
          sort_by = 'b.email';
        }
        if (request_body.sort_by == 'owner_name') {
          sort_by = 'c.owner_name';
        }
        if (request_body.sort_by == 'credits_remaining') {
          sort_by = 'b.credits_remaining';
        }
      }

      if (search_by) {
        if (srchStr != '') {
          andStr = 'AND ';
        }
        // search_by = global.Helpers.globalFilter(search_by);
        srchStr +=
          andStr +
          `(c.display_name LIKE '%${search_by}%' OR c.owner_name LIKE '%${search_by}%' OR b.email LIKE '%${search_by}%' )`;
      }

      // if (srchStr == '') srchStr = 1;

      db.query(
        `select DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at, b.credits_remaining,b.email,b.business_id,c.address,c.avatarUrl,c.owner_name,c.phone,c.display_name from business_user b, company_details c where b.business_id=c.business_id and b.is_deleted !=1 ${srchStr} order by ${sort_by} ${sort_order}, b.business_id ${sort_order} limit ${limit} offset ${offset}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            return resolve(result);
          }
        }
      );
    });
  }
  ListCompaniesTotalCount(i) {
    return new Promise((resolve, reject) => {
      let search_by = i.search_by || '';
      // let filter_by = i.filter_by || '';
      // console.log('ser' + search_by);

      var srchStr = '';
      var andStr = 'and';

      if (search_by) {
        if (srchStr != '') {
          andStr = 'AND ';
        }
        // search_by = global.Helpers.globalFilter(search_by);
        srchStr +=
          andStr +
          `(c.display_name LIKE '%${search_by}%' OR c.owner_name LIKE '%${search_by}%' OR b.email LIKE '%${search_by}%' )`;
      }

      db.query(
        `select count(b.business_id) as total_count from business_user b, company_details c where b.business_id=c.business_id and b.is_deleted !=1  ${srchStr}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log(result[0].total_count);
            return resolve(result[0].total_count);
          }
        }
      );
    });
  }

  GetCompanyDetailsByID(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select b.use_installation_form,b.send_installation_mail, b.use_warranty_reg_otp, b.credits_remaining,b.email,b.business_id,c.address,c.avatarUrl,c.owner_name,c.phone,c.display_name from business_user b, company_details c where b.business_id=c.business_id and b.business_id=?',
        [id],
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


  getAllDefaultConfigsAndSetEnv=async()=> {
    
try{
    const configData=await this.GetDefaultConfigs()

           

             // Set environment variables.
             if(configData){   Object.keys(configData).forEach(key => {
               process.env[key.toUpperCase()] = configData[key];
           });

           console.log('Environment variables set:', process.env);}
          }
          catch(err){
            console.log(err)
          }
          
         

   
}

  GetDefaultConfigs() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM default_config WHERE id = 1'  ,
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if(result&&result.length>0)
            return resolve(result[0]);
          else{
            return reject("unable  to find credentials")
          }
          }
        }
      );
    });
  }

  // UpdateDefaultConfigs(body) {
  //   return new Promise((resolve, reject) => {

  //     const updatedConfig = {
  //       use_reg_otp: body.use_reg_otp,
  //       is_mock_otp: body.is_mock_otp,
  //       mock_otp: body.mock_otp,
  //       credit_check_balance: body.credit_check_balance,
  //       credit_deduction_balance: body.credit_deduction_balance,
  //       verify_login_otp:body.verify_login_otp,
  //       print_link:body.print_link,
  //       qr_quantity:body.qr_quantity,
  //       qr_copies:body.qr_copies,
  //       qr_overall:body.qr_overall,
  //       session_timeout_superadmin:body.session_timeout_superadmin,

  //       session_timeout_company:body.session_timeout_company,
  //       session_timeout_company_user:body.session_timeout_company_user,
  //       session_timeout_customer:body.session_timeout_customer
       
  //     };

  //     const setClause = Object.keys(updatedConfig).map(key => `${key} = ?`).join(', ');

  //     db.query('update  FROM default_config set use_reg_otp=?, WHERE id = 1'  ,
  //       (err, result) => {
  //         if (err) {
  //           return reject(err);
  //         } else {
  //           return resolve(result);
  //         }
  //       }
  //     );
  //   });
  // }


  UpdateDefaultConfigs(body) {
    return new Promise((resolve, reject) => {
        const allowedFields = [
            'use_reg_otp',
            'is_mock_otp',
            'mock_otp',
            'credit_balance_check',
            'credit_deduction_check',
            'verify_login_otp',
            'print_link',
            'qr_quantity',
            'qr_copies',
            'qr_overall',
            'session_timeout_superadmin',
            'session_timeout_company',
            'session_timeout_company_user',
            'session_timeout_customer',
            'max_unsuccessful_otp_attempt',
        'max_resend_otp_count' , 
    'otp_expiration' , 
    'blocking_time' ,
    'max_send_otp_wait_time',
    'max_send_otp_count',
    'block_user','test_running_hour',
    'test_running_minute'
        ];

        // Filter the body to include only allowed fields that have a value
        const updatedConfig = {};
        allowedFields.forEach(field => {
            if (body.hasOwnProperty(field) && body[field] !== undefined) {
                updatedConfig[field] = body[field];
            }
        });

        // If no fields to update, resolve immediately
        if (Object.keys(updatedConfig).length === 0) {
            return resolve('No fields to update');
        }

        const setClause = Object.keys(updatedConfig).map(key => `${key} = ?`).join(', ');

        const values = Object.values(updatedConfig);
        values.push(1); // Assuming id = 1

        db.query(`UPDATE default_config SET ${setClause} WHERE id = ?`, values, (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}


  Login(email, password) {
    return new Promise((resolve, reject) => {
      db.query('select * from admin where email=?', [email], (err, result) => {
        if (err) {
          return reject(err);
        } else {
          if (result.length == 0) {
            return reject('User not registered');
          } else {
            db.query(
              'select * from admin where email=? and password=?',
              [email, password],
              (err, result2) => {
                if (err) {
                  return reject(err);
                } else {
                  if (result2.length == 0) {
                    return reject('Invalid credentials');
                  } else {
                    if(result2[0].password==password)
                    return resolve(result2);
                  else
                  return reject('Invalid credentials');
                  }
                }
              }
            );
          }
        }
      });
    });
  }

  LoginWithIdPassword = async (id) => {
    return new Promise((resolve, reject) => {
      //console.log('id' + id);
      db.query('select * from admin where id=? ', [id], (err, adminUser) => {
        //console.log(adminUser[0]);
        if (err) {
          return reject(err);
        }
        if (adminUser && adminUser.length > 0) {
          return resolve(true);
        } else {
          //console.log('gshsh');
          return reject('Admin Not Found. Invalid Credentials');
        }
      });
    });
  };
  RegisterCompany(body) {
    return new Promise((resolve, reject) => {
      const initial_credits =
        body.initial_credits == null || body.initial_credits === undefined
          ? 0
          : body.initial_credits;
          let use_warranty_reg_otp=2,use_installation_form=0,is_testing_account=0
        if(body.use_warranty_reg_otp){
          use_warranty_reg_otp=body.use_warranty_reg_otp
        }
        if(body.use_installation_form){
          use_installation_form=body.use_installation_form
        }

        if(body.is_testing_account){
          is_testing_account=body.is_testing_account
        }
      this.CheckIfCompanyExists(body.email)
      
        .then(() => {
          micro_service
            .HashPassword(body.password)
            .then((password) => {
              db.query(
                'insert into business_user(email,password,role,credits_remaining,passwordChanged,use_warranty_reg_otp,use_installation_form,is_testing_account) values (?,?,?,?,?,?,?,?)',
                [body.email, password, 'company', initial_credits,0,use_warranty_reg_otp,use_installation_form,is_testing_account],
                (err, result) => {
                  if (err) {
                    console.log('hi error');
                    return reject(err);
                  } else {
                    console.log('insertssh');
                    console.log(result);
                    // db.query(
                    //   "select business_id from business_user where email=? and password=? and role='company'",
                    //   [body.email, body.password],
                    //   (err, result2) => {
                    //     if (err) {
                    //       return reject(err);
                    //     } else {
                    return resolve(result.insertId);
                    // }
                    // }
                    // );
                  }
                }
              );
            })
            .catch((err) => {
              return reject(err);
            });
        // })
        // .catch((err) => {
        //   console.log(err);
        //   return reject(err);
        // });
    }).catch((err)=>{return reject(err)});
  })}
  RegisterCompanyDetails(business_id, body, avatar) {
    return new Promise((resolve, reject) => {
      micro_service
        .AddImage(avatar, 'company_avatar')
        .then((avatarUrl) => {
          db.query(
            'insert into company_logo(logo,company_id,title) values (?,?,?)',
            [avatarUrl, business_id, 'Default Logo'],
            (err, result) => {
              if (err) {
                return reject(err);
              } else {
                db.query(
                  'insert into company_details(address,avatarUrl,display_name,owner_name,phone,business_id) values (?,?,?,?,?,?)',
                  [
                    body.address,
                    avatarUrl,
                    body.display_name,
                    body.owner_name,
                    body.phone,
                    business_id,
                  ],
                  (err, result) => {
                    if (err) {
                      return reject(err);
                    } else {
                      return resolve();
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
    });
  }
  CreateDefaultFactory(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into factory(factory_name,company_id,link_products) values (?,?,?)',
        ['Default Factory', business_id, 1],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve();
          }
        }
      );
    });
  }
  UpdateCompanyCredentials(body, business_id) {
    return new Promise((resolve, reject) => {
      // this.CheckIfCompanyExistsUpdate(body.email, business_id)
      // .then(() => {
        // let use_warranty_reg_otp=2,use_installation_form=0
        // if(body.use_warranty_reg_otp){
        //   use_warranty_reg_otp=body.use_warranty_reg_otp
        // }
        // if(body.use_installation_form){
        //   use_installation_form=body.use_installation_form
        // }
        let use_warranty_reg_otp=2,use_installation_form=0,is_testing_account=0
        if(body.use_warranty_reg_otp){
          use_warranty_reg_otp=body.use_warranty_reg_otp
        }
        if(body.use_installation_form){
          use_installation_form=body.use_installation_form
        }
        if(body.is_testing_account){
          is_testing_account=body.is_testing_account
        }

      if (body.password == 'undefined') {
        db.query(
          'update business_user set email=?,use_warranty_reg_otp=?,use_installation_form=?,is_testing_account=? where business_id=?',
          [body.email,use_warranty_reg_otp, use_installation_form,is_testing_account,business_id],
          (err, result) => {
            if (err) {

                

              return reject(err);
            } else { 
              
              db.query(
                'update  dashboard_users set email=?,name=? where is_root=1 and  company_id=? ',
                [body.email,body.owner_name,business_id],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
          console.log(result)
                    return resolve("updated")
                    
                  }
                }
              );
              // return resolve();
            }
          }
        );
      } else {
        micro_service
          .HashPassword(body.password)
          .then((password) => {
            db.query(
              'update business_user set email=?,password=?,use_warranty_reg_otp=?,use_installation_form=? ,is_testing_account=? where business_id=?',
              [body.email, password,use_warranty_reg_otp,use_installation_form,is_testing_account, business_id],
              (err, result) => {
                if (err) {
                  return reject(err);
                } else {
                  console.log('resolve');
                  // return resolve();
                  db.query(
                    'update  dashboard_users set email=?,name=?,password=? where is_root=1 and  company_id=? ',
                    [body.email,body.owner_name,password,business_id],
                    (err, result) => {
                      if (err) {
                        return reject(err);
                      } else {
              console.log(result)
              // console.log
                        return resolve("updated")
                        
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
      }
      // })
      // .catch((err) => {
      //   return reject(err);
      // });
    });
  }
  UpdateCompanyWithoutAvatar(body, business_id) {
    return new Promise((resolve, reject) => {
      console.log(body);
      console.log(business_id);
      db.query(
        'update company_details set address=?,display_name=?,owner_name=?,phone=? where business_id=?',
        [
          body.address,
          body.display_name,
          body.owner_name,
          body.phone,
          business_id,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            return resolve();
          }
        }
      );
    });
  }
  UpdateCompanyWithAvatar(body, business_id, avatar) {
    return new Promise((resolve, reject) => {
      micro_service
        .AddImage(avatar, 'company_avatar')
        .then((avatarUrl) => {
          db.query(
            'Select * From company_logo where company_id=? and title="Default Logo"',
            [business_id],
            (err, resultq) => {
              if (err) {
                return reject(err);
              } else {
                if (resultq.length > 0) {
                  db.query(
                    'update company_logo set logo=? where id=?',
                    [avatarUrl, resultq[0].id],
                    (err, result) => {
                      if (err) {
                        return reject(err);
                      } else {
                        db.query(
                          'update company_details set address=?,avatarUrl=?,display_name=?,owner_name=?,phone=? where business_id=?',
                          [
                            body.address,
                            avatarUrl,
                            body.display_name,
                            body.owner_name,
                            body.phone,
                            business_id,
                          ],
                          (err, result) => {
                            if (err) {
                              return reject(err);
                            } else {
                              return resolve();
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  db.query(
                    'insert into company_logo(logo,company_id,title) values (?,?,?)',
                    [avatarUrl, business_id, 'Default Logo'],
                    (err, result) => {
                      if (err) {
                        return reject(err);
                      } else {
                        db.query(
                          'update company_details set address=?,avatarUrl=?,display_name=?,owner_name=?,phone=? where business_id=?',
                          [
                            body.address,
                            avatarUrl,
                            body.display_name,
                            body.owner_name,
                            body.phone,
                            business_id,
                          ],
                          (err, result) => {
                            if (err) {
                              return reject(err);
                            } else {
                              return resolve();
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            }
          );
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  ListCompany(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select b.email,b.business_id,c.address,c.avatarUrl,c.owner_name,c.phone,c.display_name from business_user b, company_details c where b.business_id=c.business_id and b.business_id=? and b.is_deleted!=1',
        [business_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log('resolve in list');
            return resolve(result);
          }
        }
      );
    });
  }
  DeleteCompany(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'update business_user set is_deleted=1 where business_id=?',
        [business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            db.query(
              'update dashboard_users set is_deleted=1 where company_id=?',  [business_id],
              (err, result) => {
                if (err) {
                  return reject(err);
                } else {
            return resolve('Company deleted');}})
          }
        }
      );
    });
  }
  CheckIfCompanyExists(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from dashboard_users where email=? and is_deleted!=1 ',
        [email],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length > 0) {
              return reject('Company with entered email id already exist!');
            } else {
              return resolve();
            }
          }
        }
      );
    });
  }
  CheckIfEmailExistsUpdate(email, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from dashboard_users where email=?  and is_deleted!=1 ',
        [email],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log(result)
            if (result.length > 0) {
              // console.log('no user');
              if(result[0].company_id===business_id&&result[0].is_root){
                console.log(result);
                return resolve();
              }
              else{
                return reject(
                  'Unable to change Email.Company with entered email id already exist!'
                );
              }
              
            } else {
              console.log(result);
              return resolve();
            }
          }
        }
      );
    });
  }
  AddCompanyQRCredits(body, finalcredits, admin_id) {
    // console.log('body' + body.business_email);
    return new Promise((resolve, reject) => {
      db.query(
        'Update  business_user Set credits_remaining=? where email=? and business_id=?',
        [finalcredits, body.business_email, body.business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            let remarks = body.remarks ? body.remarks : 'Default Credit Remark';
            qrCreditRepository
              .insertQRCreditTransaction({
                business_id: body.business_id,
                transaction_remarks: remarks,
                created_on: new Date(),
                amount: body.credits,
                is_credited: 1,
                is_debited: 0,
                credited_by: `Admin ${admin_id}`,
                remaining_credits: finalcredits,
                transaction_type: 'credit',
              })
              .then(() => {
                console.log('qr_credits_transaction_saved_(credited)');
                // resolve('Credits Added');
                resolve({meassage:'Credits Added',final_credits:finalcredits});

              })
              .catch((err) => {
                reject(err);
              });
          }
        }
      );
    });
  }


  saveInstallationMailCredentials(business_id,email){
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO installation_mail_credentials (business_id, email) VALUES (?,?)',
        [business_id,email],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve("installation mail saved!")
          }
        }
      );
    });


}

CreateNewDashboardPermission(body){
  // console.log(business_id)
  return new Promise((resolve, reject) => {
    db.query(
      'insert into dasboard_permissions (permission_name,permission_desc) values(?,?)',
      [body.permission_name,body.permission_desc],
      (err, result) => {
        if (err) {
          return reject(err);
        } else {
console.log(result)
          return resolve(result)
          
        }
      }
    );
  });}

  updateDashboardPermission(body){
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'update dasboard_permissions set permission_name =?, permission_desc=? where id=?',
        [body.permission_name,body.permission_desc,body.id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
  console.log(result)
            return resolve(result)
            
          }
        }
      );
    });}
  getDashboardPermissions(body){
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select * from dasboard_permissions',
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
  console.log(result)
            return resolve(result)
            
          }
        }
      );
    });}


    UpdateDashboardUserDataWithPassword(body,password,business_id){
      // console.log(business_id)
      return new Promise((resolve, reject) => {
        db.query(
          'update  dashboard_users set email=?,name=?,password=? where is_root=1 and  company_id=? ',
          [body.email,body.name,password,body.id,business_id],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
    console.log(result)
              return resolve(result)
              
            }
          }
        );
      });}
      UpdateDashboardUserDataWithoutPassword(body,business_id){
        // console.log(business_id)
        return new Promise((resolve, reject) => {
          db.query(
            'update  dashboard_users set email=?,name=? where is_root=1 and  company_id=? ',
            [body.email,body.name,body.id,business_id],
            (err, result) => {
              if (err) {
                return reject(err);
              } else {
      console.log(result)
                return resolve(result)
                
              }
            }
          );
        });}
}

module.exports = AdminRepository;
