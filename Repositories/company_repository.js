const { errorMonitor } = require('events');
const { resolve } = require('path');
const db = require('../Database_connection/db');
const MicroService = require('../MicroServices/services');
const { isDate } = require('util/types');
const { body } = require('express-validator');
const e = require('cors');
const micro_service = new MicroService();
class CompanyRepository {
  doesUserExist(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'select business_id from business_user where email=? and is_deleted!=1',
        [email],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            // if (result.length < 1) {
            //   return reject('User not registered!');
            // } else {
            return resolve(result);
            // }
          }
        }
      );
    });
  }

  doesUserExistById(id, business_id) {
    return new Promise((resolve, reject) => {
      console.log(id)
      db.query(
        'select du.is_root,du.id,du.email,du.company_id ,bu.passwordChanged from dashboard_users du inner join business_user bu on du.company_id=bu.business_id where du.id=? and du.company_id=? and du.is_deleted!=1 and bu.is_deleted!=1',
        [id, business_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            if (result.length < 1) {
              return reject('User Not Found!');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }


  doesDashboardUserExistById(id) {
    return new Promise((resolve, reject) => {
      console.log(id)
      db.query(
        'select dur.*,du.*,dr.role_name  from dashboard_users du left join dashboard_user_roles dur on dur.fk_dashboard_user_id=du.id left join dashboard_roles dr on dr.id=dur.fk_role_id where du.id=? and du.is_deleted!=1',
        [id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            if (result.length < 1) {
              return reject('User Not Found!');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }

  getBusinessId(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'select business_id from business_user where email=?',
        [email],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            // if (result.length < 1) {
            //   return reject('User not registered!')
            // } else {
            return resolve(result);
            // }
          }
        }
      );
    });
  }

  CheckIfEmailExistsUpdate(email, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from business_user where email=? and business_id!=? and is_deleted!=1 ',
        [email, business_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            if (result.length > 0) {
              console.log('no user');

              return reject(
                'Unable to change Email.Company with entered email id already exist!'
              );
            } else {
              console.log(result);
              return resolve();
            }
          }
        }
      );
    });
  }

  CheckIfEmailVerified(email, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from dashboard_users where email=? and company_id=? and is_deleted!=1 ',
        [email, business_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            if (result.length > 0) {
              console.log('no user');

              return reject('Email Already Verified');
            } else {
              console.log(result);
              return resolve();
            }
          }
        }
      );
    });
  }
  isUserCredentialsValid(email, password, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * from business_user where email=? and business_id=?',
        [email, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length < 1) {
              return resolve('Invalid credentials!');
            } else {
              // return resolve(result);
              micro_service
                .VerifyPassword(result[0].password, password)
                .then(() => {
                  return resolve(result);
                })
                .catch((err) => {
                  return reject(err);
                });
            }
          }
        }
      );
    });
  }

  isDashboardUserCredentialsValid(email, password, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'Select *,bu.email as company_email,du.password as dash_password  from dashboard_users du inner join business_user bu on du.company_id=bu.business_id where du.email=? and du.company_id=? and du.is_deleted!=1 and bu.is_deleted!=1',
        [email, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length < 1) {
              return resolve('Invalid credentials!');
            } else {
              // return resolve(result);
              micro_service
                .VerifyPassword(result[0].dash_password, password)
                .then(() => {
                  return resolve(result);
                })
                .catch((err) => {
                  return reject(err);
                });
            }
          }
        }
      );
    });
  }

  updateEmail(email, business_id) {
    return new Promise((resolve, reject) => {
      // micro_service
      //   .HashPassword(new_password)
      //   .then((password) => {
      db.query(
        'update business_user set email=? where business_id=?',
        [email, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            // if (result.length < 1) {
            //   return resolve('Invalid credentials!');
            // } else {
            return resolve('Email updated');
            // }
          }
        }
      );

      // })
      // .catch((err) => {
      //   return reject(err);
      // });
    });
  }

  updateDashBoardUserEmail(email, business_id, id) {
    return new Promise((resolve, reject) => {
      // micro_service
      //   .HashPassword(new_password)
      //   .then((password) => {
      db.query(
        'update dashboard_users set email=? where id=? and company_id=?',
        [email, id, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            // if (result.length < 1) {
            //   return resolve('Invalid credentials!');
            // } else {
            return resolve('Email updated');
            // }
          }
        }
      );

      // })
      // .catch((err) => {
      //   return reject(err);
      // });
    });
  }

  // updateEmail(business_id, newEmail) {
  //   return new Promise((resolve, reject) => {
  //     // micro_service
  //     //   .HashPassword(new_password)
  //     //   .then((password) => {
  //     db.query(
  //       'update business_user set email=? where business_id=?',
  //       [newEmail, business_id],
  //       (err, result) => {
  //         if (err) {
  //           return reject(err);
  //         } else {
  //           // if (result.length < 1) {
  //           //   return resolve('Invalid credentials!');
  //           // } else {
  //           return resolve('Email Verified');
  //           // }
  //         }
  //       }
  //     );

  //     // })
  //     // .catch((err) => {
  //     //   return reject(err);
  //     // });
  //   });
  // }

  getDashboardUserPassword(user_id, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT password ,is_root from dashboard_users where id=? and company_id=? and is_deleted!=1',
        [user_id, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length < 1) {
              return resolve('Invalid credentials!');
            } else {
              return resolve(result[0].password);
            }
          }
        }
      );
    });
  }

  updateCompanyPassword(business_id, new_password) {
    return new Promise((resolve, reject) => {
      micro_service
        .HashPassword(new_password)
        .then((password) => {
          db.query(
            'update business_user set password=? ,passwordChanged=1 where business_id=?',
            [password, business_id],
            (err, result) => {
              if (err) {
                return reject(err);
              } else {
                // if (result.length < 1) {
                //   return resolve('Invalid credentials!');
                // } else {
                return resolve('Password Updated');
                // }
              }
            }
          );
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  updateDashboardUserPassword(user_id, business_id, new_password) {
    console.log(new_password)
    return new Promise((resolve, reject) => {
      micro_service
        .HashPassword(new_password)
        .then((password) => {
          db.query(
            'update dashboard_users set password=? where company_id=? and id=? ',
            [password, business_id, user_id],
            (err, result) => {
              if (err) {
                return reject(err);
              } else {
                console.log(result)
                // if (result.length < 1) {
                //   return resolve('Invalid credentials!');
                // } else {
                return resolve('Password Updated');
                // }
              }
            }
          );
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  isUserCredentialsValidAdmin(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * from business_user where business_id=? and is_deleted!=1',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length < 1) {
              return resolve('Invalid credentials!');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }

  GetAllCompanyCredentials(business_id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * from business_user ', (err, result1) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(result1);
        }
      });
    });
  }
  GetCompanyDetails(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * from company_details where business_id=?',
        [business_id],
        (err, result1) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result1);
          }
        }
      );
    });
  }
  GetDistributorDetails(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * from distributor_details where business_id=?',
        [business_id],
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result2);
          }
        }
      );
    });
  }
  UpdateCompanyDetails(i, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'update company_details set address=?,display_name=?,owner_name=?,phone=?,helpline_number=?,helpline_email=? where business_id=?',
        [
          i.address,
          i.display_name,
          i.owner_name,
          i.phone,
          i.helpline_number,
          i.helpline_email,
          company_id,
        ],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve('Company details updated');
          }
        }
      );
    });
  }

  UpdateAvatar(business_id, logos) {
    return new Promise((resolve, reject) => {
      console.log('repo called');
      console.log(logos);
      micro_service
        .AddImage(logos[0], 'company_avatar')
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
                          'update company_details set avatarUrl=? where business_id=?',
                          [avatarUrl, business_id],
                          (err, result1) => {
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
                          'update company_details set avatarUrl=? where business_id=?',
                          [avatarUrl, business_id],
                          (err, result1) => {
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
          console.log(err);
          return reject(err);
        });
      // let avatarUrl = "https://dev-api.billfy.in/pictures/" + logos[0].filename
    });
  }
  CompanyDetails(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select c.* ,b.email from company_details c,business_user b where b.business_id=c.business_id and b.business_id=?',
        [business_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log('ch' + result);
            return resolve(result);
          }
        }
      );
    });
  }

  CompanyCustomersWithKeyTotalCount(body, company_id) {
    return new Promise((resolve, reject) => {
      // const page = body.page_number || 1; // Get the page number from the query parameters (default to 1)
      // const pageSize = body.items_per_page || 0; // Number of blogs per page
      // // console.log(req.body);
      // const offset = (page - 1) * pageSize;
      // const limit = pageSize;
      let key = '%' + body.key + '%';
      db.query(
        `SELECT count(*) as total_count FROM warranty_availed_data w, product_list p,encoded_product e  WHERE e.alphanumeric=w.alphanumeric and w.product_id = p.id AND (w.customer_id LIKE LOWER(?) OR w.alphanumeric LIKE LOWER(?) OR w.name LIKE LOWER(?) OR w.phone_number LIKE LOWER(?) OR w.email LIKE LOWER(?) OR w.purchased_from LIKE LOWER(?) OR w.invoice LIKE LOWER(?) OR w.product_id LIKE LOWER(?) OR w.created_on LIKE LOWER(?) OR w.source LIKE LOWER(?) OR w.IP_city LIKE LOWER(?) OR w.IP_state LIKE LOWER(?) OR w.IP_country LIKE LOWER(?) OR w.longitude LIKE LOWER(?) OR w.latitude LIKE LOWER(?) OR p.product_name LIKE LOWER(?))   AND w.product_id IN (SELECT id FROM product_list WHERE company_id = ?)`,
        [
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          company_id,
        ],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result[0].total_count);
          }
        }
      );
    });
  }

  CompanyCustomersWithKey(body, company_id) {
    return new Promise((resolve, reject) => {
      const page = body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      let key = '%' + body.key + '%';
      db.query(
        `SELECT w.*, p.product_name,e.serial_number FROM warranty_availed_data w, product_list p,encoded_product e  WHERE e.alphanumeric=w.alphanumeric and w.product_id = p.id AND (w.customer_id LIKE LOWER(?) OR w.alphanumeric LIKE LOWER(?) OR w.name LIKE LOWER(?) OR w.phone_number LIKE LOWER(?) OR w.email LIKE LOWER(?) OR w.purchased_from LIKE LOWER(?) OR w.invoice LIKE LOWER(?) OR w.product_id LIKE LOWER(?) OR w.created_on LIKE LOWER(?) OR w.source LIKE LOWER(?) OR w.IP_city LIKE LOWER(?) OR w.IP_state LIKE LOWER(?) OR w.IP_country LIKE LOWER(?) OR w.longitude LIKE LOWER(?) OR w.latitude LIKE LOWER(?) OR p.product_name LIKE LOWER(?))   AND w.product_id IN (SELECT id FROM product_list WHERE company_id = ?) order by w.id desc  LIMIT ${limit} OFFSET ${offset}`,
        [
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          key,
          company_id,
        ],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log('result' + result);
            return resolve(result);
          }
        }
      );
    });
  }
  CompanyCustomersWithoutKeyTotalCount(body, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        `select COUNT(*) as total_count from warranty_availed_data w,product_list p,encoded_product e where e.alphanumeric=w.alphanumeric and w.product_id=p.id and w.product_id in(select id from product_list where company_id=?) order by w.id desc`,
        [company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log('result ' + result);
            return resolve(result[0].total_count);
          }
        }
      );
    });
  }

  CompanyCustomersWithoutKey(body, company_id) {
    console.log(company_id);
    return new Promise((resolve, reject) => {
      const page = body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      db.query(
        `select w.*,p.product_name,e.serial_number from warranty_availed_data w,product_list p,encoded_product e where e.alphanumeric=w.alphanumeric and w.product_id=p.id and w.product_id in(select id from product_list where company_id=?) order by w.id desc LIMIT ${limit} OFFSET ${offset}`,
        [company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log('result ' + result);
            return resolve(result);
          }
        }
      );
    });
  }

  AdvancedSearchTotalCount(i, company_id) {
    return new Promise((resolve, reject) => {
      let from_date, to_date, city, state, country, product_name;
      if (i.from_date != '') {
        from_date = new Date(i.from_date);
        to_date = new Date(i.to_date);
      } else {
        from_date = '%';
        to_date = '%';
      }
      if (i.city != '') {
        city = '%' + i.city + '%';
      } else {
        city = '%';
      }
      if (i.state != '') {
        state = '%' + i.state + '%';
      } else {
        state = '%';
      }
      if (i.country != '') {
        country = '%' + i.country + '%';
      } else {
        country = '%';
      }
      if (i.product_name != '') {
        product_name = '%' + i.product_name + '%';
      } else {
        product_name = '%';
      }
      console.log(product_name);
      if (i.from_date == '') {
        var sqlQuery =
          'select count(*) as total_count from warranty_availed_data w,product_list p where  w.product_id=p.id and p.product_name like LOWER(?) and w.IP_city like LOWER(?) and w.IP_state like LOWER(?) and w.IP_country like LOWER(?) and w.product_id in(select id from product_list where company_id=?)';
        if (i.sortBy == 'name') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.name desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.name';
          }
        } else if (i.sortBy == 'email') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.email desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.email';
          }
        } else if (i.sortBy == 'date') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.created_on desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.created_on';
          }
        }
        console.log(sqlQuery);
        db.query(
          sqlQuery,
          [product_name, city, state, country, company_id],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            } else {
              return resolve(result[0].total_count);
            }
          }
        );
      } else if (i.from_date != '') {
        var sqlQuery =
          'select count(*) as total_count from warranty_availed_data w,product_list p where w.created_on between ? and ? and w.product_id=p.id and p.product_name like LOWER(?) and w.IP_city like LOWER(?) and w.IP_state like LOWER(?) and w.IP_country like LOWER(?) and w.product_id in(select id from product_list where company_id=?) ';
        if (i.sortBy == 'name') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.name desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.name';
          }
        } else if (i.sortBy == 'email') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.email desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.email';
          }
        } else if (i.sortBy == 'date') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.created_on desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.created_on';
          }
        }
        db.query(
          sqlQuery,
          [from_date, to_date, product_name, city, state, country, company_id],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            } else {
              return resolve(result[0].total_count);
            }
          }
        );
      }
    });
  }

  AdvancedSearch(i, company_id) {
    return new Promise((resolve, reject) => {
      let from_date, to_date, city, state, country, product_name;
      const page = i.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = i.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      if (i.from_date != '') {
        from_date = new Date(i.from_date);
        to_date = new Date(i.to_date);
      } else {
        from_date = '%';
        to_date = '%';
      }
      if (i.city != '') {
        city = '%' + i.city + '%';
      } else {
        city = '%';
      }
      if (i.state != '') {
        state = '%' + i.state + '%';
      } else {
        state = '%';
      }
      if (i.country != '') {
        country = '%' + i.country + '%';
      } else {
        country = '%';
      }
      if (i.product_name != '') {
        product_name = '%' + i.product_name + '%';
      } else {
        product_name = '%';
      }
      console.log(product_name);
      if (i.from_date == '') {
        var sqlQuery =
          'select w.*,p.product_name,e.serial_number from warranty_availed_data w,product_list p ,encoded_product e where e.alphanumeric=w.alphanumeric and  w.product_id=p.id and p.product_name like LOWER(?) and w.IP_city like LOWER(?) and w.IP_state like LOWER(?) and w.IP_country like LOWER(?) and w.product_id in(select id from product_list where company_id=?)';
        if (i.sortBy == 'name') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.name desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.name';
          }
        } else if (i.sortBy == 'email') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.email desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.email';
          }
        } else if (i.sortBy == 'date') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.created_on desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.created_on';
          }
        }
        console.log(sqlQuery);
        sqlQuery = sqlQuery + ` LIMIT ${limit} OFFSET ${offset}`;

        db.query(
          sqlQuery,
          [product_name, city, state, country, company_id],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            } else {
              console.log(result + 'advace1');

              return resolve(result);
            }
          }
        );
      } else if (i.from_date != '') {
        var sqlQuery =
          'select w.*,p.product_name, e.serial_number from warranty_availed_data w,product_list p ,encoded_product e where e.alphanumeric=w.alphanumeric and w.created_on between ? and ? and w.product_id=p.id and p.product_name like LOWER(?) and w.IP_city like LOWER(?) and w.IP_state like LOWER(?) and w.IP_country like LOWER(?) and w.product_id in(select id from product_list where company_id=?) ';
        if (i.sortBy == 'name') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.name desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.name';
          }
        } else if (i.sortBy == 'email') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.email desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.email';
          }
        } else if (i.sortBy == 'date') {
          if (i.order == 'descending') {
            sqlQuery = sqlQuery + ' order by w.created_on desc';
          } else {
            sqlQuery = sqlQuery + ' order by w.created_on';
          }
        }
        sqlQuery = sqlQuery + ` LIMIT ${limit} OFFSET ${offset}`;

        db.query(
          sqlQuery,
          [from_date, to_date, product_name, city, state, country, company_id],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            } else {
              console.log(result + 'advace2');
              return resolve(result);
            }
          }
        );
      }
    });
  }
  AddLogos(logos, company_id, body) {
    return new Promise((resolve, reject) => {
      // for(let i=0;i<logos.length;i++){
      micro_service
        .AddLogo(logos[0])
        .then((logo) => {
          db.query(
            'insert into company_logo(logo,company_id,title) values (?,?,?)',
            [logo, company_id, body.title],
            (err, result) => {
              if (err) {
                console.log(err);
                return reject(err);
              } else {
                console.log('Logo added');
                db.query(
                  'select id from company_logo order by id desc limit 1',
                  (err, result) => {
                    if (err) {
                      console.log(err);
                      return reject(err);
                    } else {
                      let logo_id = result[0].id;
                      return resolve(logo_id);
                    }
                  }
                );
              }
            }
          );
        })
        .catch((err) => {
          console.log(err);
          return reject(err);
        });
      // let logo="https://dev-api.billfy.in/pictures/"+logos[0].filename;

      // if(i==logos.length-1){
      //     return resolve()
      // }
      // }
    });
  }
  GetLogo(logo_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_logo where id=?',
        [logo_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log(result);
            return resolve(result);
          }
        }
      );
    });
  }
  GetLogos(company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_logo where company_id=?',
        [company_id],
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
  UpdateLogo(logo, body, id, business_id) {
    return new Promise((resolve, reject) => {
      // let logo_img =
      //   'https://billfystore.s3.ap-south-1.amazonaws.com/company_logo/' +
      //   logo[0].filename;
      micro_service
        .AddLogo(logo[0])
        .then((logoresult) => {
          db.query(
            'update company_logo set logo=?, title=? where id=?',
            [logoresult, body.title, id],
            (err, result2) => {
              if (err) {
                console.log(err);
                return reject(err);
              } else {
                db.query(
                  'update company_details set avatarUrl=? where business_id=?',
                  [logoresult, business_id],
                  (err, result1) => {
                    if (err) {
                      return reject(err);
                    } else {
                      return resolve(result1);
                    }
                  }
                );
                // return resolve(result2);
              }
            }
          );
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  UpdateLogoTitle(body) {
    return new Promise((resolve, reject) => {
      db.query(
        'update company_logo set title=? where id=?',
        [body.title, body.id],
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
  DeleteLogo(logo_id, company_id) {
    console.log('hi in delete');
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_logo where id=? and company_id=?',
        [logo_id, company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            if (result[0].title === 'Default Logo') {
              console.log('default');
              return reject('Default Logo cannot be deleted');
            } else {
              db.query(
                'delete from company_logo where id=? and company_id=?',
                [logo_id, company_id],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return reject(err);
                  } else {
                    return resolve();
                  }
                }
              );
            }
          }
        }
      );
    });
  }

  doesUserExistInCompany(id, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where id=? and company_id=? and is_deleted!=1',
        [id, company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            if (result.length < 1) {
              return reject('User Not Found!');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }

  AddCompanyUser(body, company_id) {
    return new Promise((resolve, reject) => {
      this.CheckIfCompanyUserEmailExistsAdd(body.email)
        .then(() => {
          micro_service
            .HashPassword(body.password)
            .then((hashedPassword) => {
              db.query(
                'insert into company_user(name,email,password,company_id,factory_id) values (?,?,?,?,?)',
                [
                  body.name,
                  body.email,
                  hashedPassword,
                  company_id,
                  body.factory_id,
                ],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    db.query(
                      'select id from company_user where email=? and password=?',
                      [body.email, hashedPassword],
                      (err, result2) => {
                        if (err) {
                          return reject(err);
                        } else {
                          return resolve(result2[0].id);
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
  EditCompanyUser(body) {
    return new Promise((resolve, reject) => {
      this.CheckIfCompanyUserEmailExistsEdit(body.email, body.id)
        .then(() => {
          if (body.password && body.password != null) {
            micro_service.HashPassword(body.password).then((hashedPassword) => {
              db.query(
                'update company_user set name=?,email=?,password=?,factory_id=? where id=?',
                [
                  body.name,
                  body.email,
                  hashedPassword,
                  body.factory_id,
                  body.id,
                ],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve(body.id);
                  }
                }
              );
            });
          } else {
            db.query(
              'update company_user set name=?,email=?,factory_id=? where id=?',
              [body.name, body.email, body.factory_id, body.id],
              (err, result) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve(body.id);
                }
              }
            );
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
  AddCompanyUserAccess(body, user_id) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < body.user_access.length; i++) {
        db.query(
          'insert into user_access(user_id,access_id) values (?,?)',
          [user_id, body.user_access[i]],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
              if (i == body.user_access.length - 1) {
                return resolve();
              }
            }
          }
        );
      }
      return resolve();
    });
  }
  GetCompanyUserData(id = 0) {
    return new Promise((resolve, reject) => {
      if (id === 0) {
        console.log(id);

        db.query(
          'SELECT cu.*, f.factory_name FROM company_user cu INNER JOIN factory f ON cu.factory_id = f.id order by cu.id desc limit 1',
          (err, result1) => {
            if (err) {
              return reject(err);
            } else {
              db.query(
                'select * from user_access where user_id=?',
                [result1[0].id],
                (err, user_access) => {
                  if (err) {
                    return reject(err);
                  } else {
                    let user = {
                      id: result1[0].id,
                      name: result1[0].name,
                      company_id: result1[0].company_id,
                      email: result1[0].email,
                      factory_id: result1[0].factory_id,
                      factory_name: result1[0].factory_name,
                      user_access: user_access,
                    };
                    return resolve(user);
                  }
                }
              );
            }
          }
        );
      } else {
        console.log(id);
        db.query(
          'SELECT cu.*, f.factory_name FROM company_user cu INNER JOIN factory f ON cu.factory_id = f.id where cu.id=?',
          [id],
          (err, result1) => {
            if (err) {
              return reject(err);
            } else {
              db.query(
                'select * from user_access where user_id=?',
                [id],
                (err, user_access) => {
                  if (err) {
                    return reject(err);
                  } else {
                    let user = {
                      id: result1[0].id,
                      name: result1[0].name,
                      company_id: result1[0].company_id,
                      email: result1[0].email,
                      factory_id: result1[0].factory_id,
                      factory_name: result1[0].factory_name,
                      user_access: user_access,
                    };
                    return resolve(user);
                  }
                }
              );
            }
          }
        );
      }
    });
  }
  EditCompanyUserAccess(body) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from user_access where user_id=?',
        [body.id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            for (let i = 0; i < body.user_access.length; i++) {
              db.query(
                'insert into user_access(user_id,access_id) values (?,?)',
                [body.id, body.user_access[i]],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    if (i == body.user_access.length - 1) {
                      return resolve();
                    }
                  }
                }
              );
            }
            return resolve();
          }
        }
      );
    });
  }
  ListCompanyUser(company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT cu.id, cu.name, cu.email, f.factory_name FROM company_user cu INNER JOIN factory f ON cu.factory_id = f.id WHERE cu.company_id = ? and cu.is_deleted!=1 and f.is_deleted!=1',
        [company_id],
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
  CompanyUserData(user_id, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where id=? and company_id=?  and is_deleted!=1',
        [user_id, company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {

            if (result.length <= 0) {
              return reject("Invalid User Id!")
            }
            db.query(
              'select factory_name from factory where id=?',
              [result[0].factory_id],
              (err, result1) => {
                if (err) {
                  return reject(err);
                } else {
                  // console.log('result1' + result1[0].factory_name);
                  result[0].factory_name = result1[0].factory_name;
                  // console.log('result' + result[1]);
                  return resolve(result);
                }
              }
            );
          }
        }
      );
    });
  }


  UserAccess(user_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select id,user_type from company_user_types where id in(select access_id from user_access where user_id=?)',
        [user_id],
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
  GetUserAccessTypes() {
    return new Promise((resolve, reject) => {
      db.query('select * from company_user_types', (err, result) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(result);
        }
      });
    });
  }
  DeleteCompanyUser(user_id, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'update  company_user set is_deleted=1 where id=? and company_id=? ',
        [user_id, company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve('Deleted');
          }
        }
      );
    });
  }
  Inventory = async (request_body, company_id) => {
    try {
      let filter_by_category = request_body.filter_by_category || '';
      let filter_by_product = request_body.filter_by_product || '';
      let filterStage = request_body.filter_by_stage || '';
      const page = request_body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = request_body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      console.log('ser', company_id);

      // var srchStr = '';
      var andCatStr = 'and';
      var filterCatStr = '';
      var andProdStr = 'and';
      var filterProdStr = '';
      var filterStageStr = ''
      var andStageStr = 'and'





      var sort_order = 'DESC';
      var sort_by = 'final_data.production_date';

      if (request_body.sort_order != null) {
        if (request_body.sort_order == 1) {
          sort_order = 'ASC';
        } else if (request_body.sort_order == -1) {
          sort_order = 'DESC';
        }
      }

      if (request_body.sort_by != '' && request_body.sort_by != null) {
        if (request_body.sort_by == 'product_name') {
          sort_by = 'final_data.product_name';
        }
        if (request_body.sort_by == 'serial_number') {
          sort_by = 'final_data.serial_number';
        }
        if (request_body.sort_by == 'stage') {
          sort_by = 'final_data.stage';

        }
      }

      // let searchTerms = [];

      // var sort_order = 'DESC';
      // var sort_by = 'added_at';

      // if (request_body.sort_order != null) {
      //   if (request_body.sort_order == 1) {
      //     sort_order = 'ASC';
      //   } else if (request_body.sort_order == -1) {
      //     sort_order = 'DESC';
      //   }
      // }

      // if (request_body.sort_by != '' && request_body.sort_by != null) {
      //   if (request_body.sort_by == 'product_name') {
      //     sort_by = 'product_name';
      //   }
      //   if (request_body.sort_by == 'category') {
      //     sort_by = 'category';
      //   }
      //   if (request_body.sort_by == 'warranty') {
      //     sort_by = 'year';
      //     sort_by = sort_by + ' ' + sort_order + ',' + ' month';
      //   }
      // }

      if (filter_by_category && filter_by_category.length > 0) {
        if (filterCatStr != '') {
          andCatStr = 'AND ';
        }

        filterCatStr += andCatStr + '(';

        // Use a loop to generate the search condition for each term
        filterCatStr += filter_by_category
          .map(
            (term) =>
              `(
              pc.title = '${term}' 
              )`
          )
          .join(' OR ');

        filterCatStr += ')';
        console.log(filterCatStr + '-----1');
      }
      if (filter_by_product && filter_by_product.length > 0) {
        if (filterProdStr != '') {
          andProdStr = 'AND ';
        }

        filterProdStr += andProdStr + '(';

        // Use a loop to generate the search condition for each term
        filterProdStr += filter_by_product
          .map(
            (term) =>
              `(
              p.id = '${term}' 
              )`
          )
          .join(' OR ');

        filterProdStr += ')';
        console.log(filterProdStr + '-----2');
      }

      if (filterStage && filterStage.length > 0) {

        console.log("staheg")
        filterStageStr += '(';

        // Use a loop to generate the search condition for each term
        filterStageStr += filterStage
          .map(
            (term) =>
              `(
              final_data.stage = '${term}' 
              )`
          )
          .join(' OR ');

        filterStageStr += ')';
        console.log(filterStageStr + '-----3');
      }

      let whereConditions = [], startDate, endDate;
      if (request_body && request_body.startDate && request_body.endDate) {
        startDate = new Date(request_body.startDate)
        endDate = new Date(request_body.endDate)
      }

      if (filterStageStr !== '') {
        whereConditions.push(`${filterStageStr}`);
      }
      if (startDate) {
        whereConditions.push(`final_data.production_date >= '${startDate.toISOString()}'`);
      }
      if (endDate) {
        whereConditions.push(`final_data.production_date <= '${endDate.toISOString()}'`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // return new Promise((resolve, reject) => {


      const result = await db.promise().query(
        `Select * From (SELECT 
       product_name,
        e.serial_number,
        e.print as production_date,
        e.alphanumeric,

        CASE
            WHEN e.warranty_registered IS NOT NULL THEN 'warranty-availed'
            WHEN e.dispatched_from_factory IS NOT NULL THEN 'dispatched'
            WHEN e.linked_to_master IS NOT NULL THEN 'packed'

            WHEN e.print IS NOT NULL THEN 'printed'
            ELSE 'unknown' 
        END AS stage
    FROM 
        
        encoded_product e INNER JOIN (
          SELECT 
              p.product_name,
              p.id as id
          FROM 
              product_list p
              LEFT JOIN product_category pc ON p.id = pc.product_id
          WHERE 
              p.company_id = ?
              AND p.is_deleted = 0 
              ${filterCatStr}
              ${filterProdStr}
          GROUP BY 
              p.id
      )  AS fds ON e.product_id = fds.id)as final_data
    ${whereClause}
     order by ${sort_by} ${sort_order}
     LIMIT ${limit} OFFSET ${offset};
    `, [company_id]

      );
      console.log(result[0][0])

      const resultTotalCount = await db.promise().query(
        `Select count(final_data.serial_number) as total_count From (SELECT 
       product_name,
        e.serial_number,
        e.print as production_date,

        CASE
            WHEN e.warranty_registered IS NOT NULL THEN 'warranty-availed'
            WHEN e.dispatched_from_factory IS NOT NULL THEN 'dispatched'
            WHEN e.linked_to_master IS NOT NULL THEN 'packed'

            WHEN e.print IS NOT NULL THEN 'printed'
            ELSE 'unknown' 
        END AS stage
    FROM 
        
        encoded_product e INNER JOIN (
          SELECT 
              p.product_name,
              p.id as id
          FROM 
              product_list p
              LEFT JOIN product_category pc ON p.id = pc.product_id
          WHERE 
              p.company_id = ?
              AND p.is_deleted = 0 
              ${filterCatStr}
              ${filterProdStr}
          GROUP BY 
              p.id
      )  AS fds ON e.product_id = fds.id)as final_data
    ${whereClause}
     
        
    `, [company_id]

      );
      let res_data = {}
      if (result && result[0]) {
        res_data.stock_list = result[0]
      }
      if (resultTotalCount && resultTotalCount[0] && resultTotalCount[0].length > 0) {
        res_data.total_count = resultTotalCount[0][0].total_count
        res_data.total_pages = Math.ceil(resultTotalCount[0][0].total_count / pageSize)
        res_data.current_page = page
      }

      const producedStock = await db.promise().query(`Select count(final_data.serial_number) as produced_stock From (SELECT 
      product_name,
       e.serial_number,
       e.print as production_date,
       CASE
       WHEN e.warranty_registered IS NOT NULL THEN 'warranty-availed'
       WHEN e.dispatched_from_factory IS NOT NULL THEN 'dispatched'
       WHEN e.linked_to_master IS NOT NULL THEN 'packed'

       WHEN e.print IS NOT NULL THEN 'printed'
       ELSE 'unknown' 
   END AS stage
       
   FROM 
       
       encoded_product e INNER JOIN (
         SELECT 
             p.product_name,
             p.id as id
         FROM 
             product_list p
             LEFT JOIN product_category pc ON p.id = pc.product_id
         WHERE 
             p.company_id = ?
             AND p.is_deleted = 0 
             ${filterCatStr}
             ${filterProdStr}
         GROUP BY 
             p.id
     )  AS fds ON e.product_id = fds.id where e.print IS NOT NULL and  e.warranty_registered IS NULL and  e.dispatched_from_factory IS NULL and e.linked_to_master IS  NULL)as final_data
   ${whereClause}
   
   `, [company_id])
      console.log(producedStock[0][0])
      if (producedStock && producedStock[0] && producedStock[0].length > 0) {
        res_data.producedStock = producedStock[0][0].produced_stock
      }
      const packedStock = await db.promise().query(`Select count(final_data.serial_number) as packed_stock From (SELECT 
    product_name,
     e.serial_number,
     e.print as production_date,

     CASE
            WHEN e.warranty_registered IS NOT NULL THEN 'warranty-availed'
            WHEN e.dispatched_from_factory IS NOT NULL THEN 'dispatched'
            WHEN e.linked_to_master IS NOT NULL THEN 'packed'

            WHEN e.print IS NOT NULL THEN 'printed'
            ELSE 'unknown' 
        END AS stage
 FROM 
     
     encoded_product e INNER JOIN (
       SELECT 
           p.product_name,
           p.id as id
       FROM 
           product_list p
           LEFT JOIN product_category pc ON p.id = pc.product_id
       WHERE 
           p.company_id = ?
           AND p.is_deleted = 0 
           ${filterCatStr}
           ${filterProdStr}
       GROUP BY 
           p.id
   )  AS fds ON e.product_id = fds.id where e.warranty_registered IS NULL and  e.dispatched_from_factory IS NULL and e.linked_to_master IS NOT NULL )as final_data
 ${whereClause}

     
 `, [company_id])

      console.log(packedStock[0][0])

      if (packedStock && packedStock[0] && packedStock[0].length > 0) {
        res_data.packedStock = packedStock[0][0].packed_stock
      }
      const dispatchedStock = await db.promise().query(`Select count(final_data.serial_number) as dispatched_stock From (SELECT 
  product_name,
   e.serial_number,
   e.print as production_date,
   CASE
   WHEN e.warranty_registered IS NOT NULL THEN 'warranty-availed'
   WHEN e.dispatched_from_factory IS NOT NULL THEN 'dispatched'
   WHEN e.linked_to_master IS NOT NULL THEN 'packed'

   WHEN e.print IS NOT NULL THEN 'printed'
   ELSE 'unknown' 
END AS stage
   
FROM 
   
   encoded_product e INNER JOIN (
     SELECT 
         p.product_name,
         p.id as id
     FROM 
         product_list p
         LEFT JOIN product_category pc ON p.id = pc.product_id
     WHERE 
         p.company_id = ?
         AND p.is_deleted = 0 
         ${filterCatStr}
         ${filterProdStr}
     GROUP BY 
         p.id
 )  AS fds ON e.product_id = fds.id where  e.warranty_registered IS NULL and  e.dispatched_from_factory IS NOT NULL  )as final_data
${whereClause}  
`, [company_id])
      console.log(dispatchedStock[0][0])


      if (dispatchedStock && dispatchedStock[0] && dispatchedStock[0].length > 0) {
        res_data.dispatchedStock = dispatchedStock[0][0].dispatched_stock
      }
      const warrantyRegisteredStock = await db.promise().query(`Select count(final_data.serial_number) as warranty_registered_stock From (SELECT 
  product_name,
   e.serial_number,
   e.print as production_date,
   CASE
   WHEN e.warranty_registered IS NOT NULL THEN 'warranty-availed'
   WHEN e.dispatched_from_factory IS NOT NULL THEN 'dispatched'
   WHEN e.linked_to_master IS NOT NULL THEN 'packed'

   WHEN e.print IS NOT NULL THEN 'printed'
   ELSE 'unknown' 
END AS stage
FROM 
   
   encoded_product e INNER JOIN (
     SELECT 
         p.product_name,
         p.id as id
     FROM 
         product_list p
         LEFT JOIN product_category pc ON p.id = pc.product_id
     WHERE 
         p.company_id = ?
         AND p.is_deleted = 0 
         ${filterCatStr}
         ${filterProdStr}
     GROUP BY 
         p.id
 )  AS fds ON e.product_id = fds.id where e.warranty_registered IS NOT NULL )as final_data
${whereClause}  
`, [company_id])

      console.log(warrantyRegisteredStock[0][0])


      if (warrantyRegisteredStock && warrantyRegisteredStock[0] && warrantyRegisteredStock[0].length > 0) {
        res_data.warrantyRegisteredStock = warrantyRegisteredStock[0][0].warranty_registered_stock
      }

      return res_data
      // });
    } catch (err) { throw err.message }

  }
  AddStatus(data) {
    return new Promise((resolve, reject) => {
      for (let i of data) {
        i.status = [];
        if (i.print !== null) {
          i.status.push('Print');
        }
        if (i.linked_to_master !== null) {
          i.status.push('Linked to master');
        }
        if (i.dispatched_from_factory !== null) {
          i.status.push('Dispatched from factory');
        }
        if (i.warranty_registered !== null) {
          i.status.push('Warranty registered');
        }
        if (i.id == data[data.length - 1].id) {
          return resolve(data);
        }
      }
    });
  }
  GetTransactions(company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select c.name, t.* from company_user c, gateKeeper_transactions t where c.id=t.gateKeeper_id and gateKeeper_id in(select id from company_user where company_id=?)',
        [company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            this.GetTransactionProductCount(result)
              .then((data) => {
                return resolve(data);
              })
              .catch((err) => {
                return reject(err);
              });
          }
        }
      );
    });
  }
  GetTransactionProductCount(data) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < data.length; i++) {
        db.query(
          'select count(id) as count from gateKeeper_transaction_data where transaction_id=?',
          [data[i].transaction_id],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
              // console.log(result)
              data[i].count = result[0].count;
              console.log(data[i]);
              if (i == data.length - 1) {
                console.log(data);
                return resolve(data);
              }
            }
          }
        );
      }
    });
  }
  // AddProductData(i, company_id) {
  //   return new Promise((resolve, reject) => {
  //     var showManufactureDate;
  //     if (i.showManufactureDate == 'true') {
  //       showManufactureDate = true;
  //     } else {
  //       showManufactureDate = false;
  //     }
  //     const logoid = JSON.parse(i.company_logo).id;

  //     db.query(
  //       'INSERT INTO product_list(product_name,added_at,product_description,product_model,quantity,company_id,showManufactureDate,logo) VALUES (?,?,?,?,?,?,?,?)',
  //       [
  //         i.product_name,
  //         new Date(),
  //         i.productDescription,
  //         i.productModel,
  //         0,
  //         company_id,
  //         showManufactureDate,
  //         logoid,
  //       ],
  //       (err, result) => {
  //         if (err) {
  //           console.log(err);
  //           return reject('Error in data');
  //         } else {
  //           console.log('Data saved');
  //           console.log(company_id);
  //           db.query(
  //             'SELECT id FROM product_list where company_id=? order by id desc limit 1',
  //             [company_id],
  //             (err, result1) => {
  //               if (err) {
  //                 return reject('Error in id');
  //               } else {
  //                 console.log(result1);
  //                 console.log(result1[0].id);
  //                 return resolve(result1[0].id);
  //               }
  //             }
  //           );
  //         }
  //       }
  //     );
  //   });
  // }


  AddProductData(i, company_id) {
    return new Promise((resolve, reject) => {
      var showManufactureDate;
      if (i.showManufactureDate == 'true') {
        showManufactureDate = true;
      } else {
        showManufactureDate = false;
      }
      const logoid = JSON.parse(i.company_logo).id;
      const productDescForCustomer = i.productDescForCustomer ? i.productDescForCustomer : ""
      const is_installation_required = i.is_installation_required ? i.is_installation_required : 0

      db.query(
        'INSERT INTO product_list(product_name,added_at,product_description,product_model,quantity,company_id,showManufactureDate,logo,product_desc_for_customer,is_installation_required) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [
          i.product_name,
          new Date(),
          i.productDescription,
          i.productModel,
          0,
          company_id,
          showManufactureDate,
          logoid,
          productDescForCustomer,
          is_installation_required
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('Error in data');
          } else {
            console.log('Data saved');
            console.log(company_id);
            db.query(
              'SELECT id FROM product_list where company_id=? order by id desc limit 1',
              [company_id],
              (err, result1) => {
                if (err) {
                  return reject('Error in id');
                } else {
                  console.log(result1);
                  console.log(result1[0].id);
                  return resolve(result1[0].id);
                }
              }
            );
          }
        }
      );
    });
  }
  AddWarranty(id, warranty) {
    return new Promise((resolve, reject) => {
      console.log('warranty');
      console.log(warranty);
      let count = 0;
      for (let j of warranty) {
        db.query(
          'INSERT INTO warranty(product_id,name,year,month) values (?,?,?,?)',
          [id, j.name, j.year, j.month],
          (err, result3) => {
            if (err) {
              return reject('Error in warranty');
            } else {
              console.log('Warranty');
              count++;
              if (count == warranty.length) {
                return resolve();
              }
            }
          }
        );
      }
    });
  }
  AddCategory(id, category) {
    return new Promise((resolve, reject) => {
      let count = 0;
      for (let j of category) {
        db.query(
          'INSERT INTO product_category(product_id,title,description) values (?,?,?)',
          [id, j.title, j.description],
          (err, result4) => {
            if (err) {
              return reject('Error in product category');
            } else {
              count++;
              if (count == category.length) {
                return resolve();
              }
            }
          }
        );
      }
    });
  }
  AddAdditionalInfo(id, additioalInfo) {
    return new Promise((resolve, reject) => {
      let count = 0;
      for (let j of additioalInfo) {
        db.query(
          'INSERT INTO additional_info(product_id,title,description) values (?,?,?)',
          [id, j.title, j.description],
          (err, result) => {
            if (err) {
              return reject('Error in additional info');
            } else {
              count++;
              if (count == additioalInfo.length) {
                return resolve();
              }
            }
          }
        );
      }
    });
  }
  AddVideo(id, video) {
    return new Promise((resolve, reject) => {
      if (video[0] == '' || video.length == 0) {
        console.log('no');
        return resolve();
      } else {
        let count = 0;
        for (let j of video) {
          console.log(j.video);
          if (j.video) {
            db.query(
              'INSERT INTO product_videos(product_id,video) values (?,?)',
              [id, j.video],
              (err, result) => {
                if (err) {
                  return reject('Error in video');
                } else {
                  return resolve();
                }
              }
            );
          }
        }
        return resolve();
      }
    });
  }
  AddPurchaseOptions(id, PurchaseOptions) {
    return new Promise((resolve, reject) => {
      if (PurchaseOptions[0] == '') {
        return resolve();
      } else {
        console.log('ppo');
        let count = 0;
        // let processedPurchaseOptions = []
        // processedPurchaseOptions.push(JSON.parse(PurchaseOptions))
        // console.log(PurchaseOptions)
        // console.log(processedPurchaseOptions)
        for (let j of PurchaseOptions) {
          db.query(
            'insert into product_purchase_options(title,link,product_id,sequence) values (?,?,?,?)',
            [j.title, j.link, id, count],
            (err, result) => {
              if (err) {
                return reject(err);
              } else {
                count++;
                if (count == PurchaseOptions.length) {
                  return resolve();
                }
              }
            }
          );
        }
      }
    });
  }
  AddProductImage(id, productImage) {
    return new Promise((resolve, reject) => {
      console.log(productImage + 'heheheh');
      if (productImage == '') {
        return resolve();
      } else {
        let count = 0;
        for (let j of productImage) {
          micro_service
            .AddImage(j, 'product')
            .then((p_img) => {
              db.query(
                'Insert into product_image(product_id,image) values (?,?)',
                [id, p_img],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.send({ message: 'Error in product image' });
                  } else {
                    count++;
                    if (count == productImage.length) {
                      return resolve();
                    }
                  }
                }
              );
            })
            .catch((err) => {
              console.log(err);
            });
          // let p_img="https://dev-api.billfy.in/pictures/"+j.filename
        }
      }
    });
  }
  // EditProductData(product_id, i) {
  //   return new Promise((resolve, reject) => {
  //     var showManufactureDate;
  //     if (i.showManufactureDate == 'true' || i.showManufactureDate == 1) {
  //       showManufactureDate = true;
  //     } else {
  //       showManufactureDate = false;
  //     }
  //     console.log(typeof showManufactureDate);
  //     // console.log('updatelogo' + i.company_logo.id);
  //     const logoid = JSON.parse(i.company_logo).id;
  //     console.log(logoid);
  //     db.query(
  //       'UPDATE product_list SET product_name=?,product_description=?,product_model=?,showManufactureDate=? ,logo=? where id=?',
  //       [
  //         i.product_name,
  //         i.productDescription,
  //         i.productModel,
  //         showManufactureDate,
  //         logoid,
  //         product_id,
  //       ],
  //       (err, result) => {
  //         if (err) {
  //           console.log(err);
  //           return reject(err);
  //         } else {
  //           console.log('Product data' + result);
  //           return resolve(result);
  //         }
  //       }
  //     );
  //   });
  // }


  EditProductData(product_id, i) {
    return new Promise((resolve, reject) => {
      var showManufactureDate;
      if (i.showManufactureDate == 'true' || i.showManufactureDate == 1) {
        showManufactureDate = true;
      } else {
        showManufactureDate = false;
      }
      console.log(typeof showManufactureDate);
      // console.log('updatelogo' + i.company_logo.id);
      const logoid = JSON.parse(i.company_logo).id;
      console.log(logoid);
      const productDescForCustomer = i.productDescForCustomer ? i.productDescForCustomer : ""
      const is_installation_required = i.is_installation_required ? i.is_installation_required : 0

      db.query(
        'UPDATE product_list SET is_installation_required=?,product_name=?,product_description=?,product_model=?,showManufactureDate=? ,logo=? ,product_desc_for_customer=? where id=?',
        [
          is_installation_required,
          i.product_name,
          i.productDescription,
          i.productModel,
          showManufactureDate,
          logoid,
          productDescForCustomer,
          product_id,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log('Product data' + result);
            return resolve(result);
          }
        }
      );
    });
  }
  EditWarranty(id, warranty) {
    return new Promise((resolve, reject) => {
      console.log('warranty');
      console.log(warranty);
      let count = 0;
      for (let j of warranty) {
        db.query(
          'UPDATE warranty SET name=?,year=?,month=?,customer_id=? where id=?',
          [j.name, j.year, j.month, j.customer_id, j.id],
          (err, result3) => {
            if (err) {
              return reject('Error in warranty');
            } else {
              console.log('Warranty');
              count++;
              if (count == warranty.length) {
                return resolve();
              }
            }
          }
        );
      }
    });
  }
  EditCategory(id, category) {
    return new Promise((resolve, reject) => {
      let count = 0;
      db.query(
        'delete from product_category where product_id=?',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            for (let j of category) {
              db.query(
                'INSERT INTO product_category(product_id,title,description) values (?,?,?)',
                [id, j.title, j.description],
                (err, result4) => {
                  if (err) {
                    return reject('Error in product category');
                  } else {
                    // count++;
                    console.log(result);
                    return resolve();
                  }
                }
              );
            }
          }
        }
      );
    });
  }
  EditAdditionalInfo(id, additioalInfo) {
    return new Promise((resolve, reject) => {
      let count = 0;
      db.query(
        'delete from additional_info where product_id=?',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            for (let j of additioalInfo) {
              db.query(
                'INSERT INTO additional_info(product_id,title,description) values (?,?,?)',
                [id, j.title, j.description],
                (err, result) => {
                  if (err) {
                    return reject('Error in additional info');
                  } else {
                    count++;
                    if (count == additioalInfo.length) {
                      return resolve();
                    }
                  }
                }
              );
            }
          }
        }
      );
    });
  }
  EditVideo(id, video) {
    return new Promise((resolve, reject) => {
      let count = 0;
      db.query(
        'delete from product_videos where product_id=?',
        [id],
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            if (video.length == 0 || video[0] == '') {
              resolve();
            }
            for (let j of video) {
              console.log(j.video);
              if (j.video) {
                console.log('j.video');
                db.query(
                  'INSERT INTO product_videos(product_id,video) values (?,?)',
                  [id, j.video],
                  (err, result) => {
                    if (err) {
                      return reject('Error in video');
                    } else {
                      return resolve();
                    }
                    // }
                  }
                );
              }
            }
          }
        }
      );
    });
  }
  EditPurchaseOptions(id, PurchaseOptions) {
    return new Promise((resolve, reject) => {
      if (PurchaseOptions[0] == '') {
        return resolve();
      } else {
        console.log('ppo');
        let count = 0;
        // let processedPurchaseOptions = []
        // processedPurchaseOptions.push(JSON.parse(PurchaseOptions))
        // console.log(PurchaseOptions)
        // console.log(processedPurchaseOptions)
        db.query(
          'delete from product_purchase_options where product_id=?',
          [id],
          (err, result2) => {
            if (err) {
              return reject(err);
            } else {
              for (let j of PurchaseOptions) {
                db.query(
                  'insert into product_purchase_options(title,link,product_id,sequence) values (?,?,?,?)',
                  [j.title, j.link, id, count],
                  (err, result) => {
                    if (err) {
                      return reject(err);
                    } else {
                      count++;
                      if (count == PurchaseOptions.length) {
                        return resolve();
                      }
                    }
                  }
                );
              }
            }
          }
        );
      }
    });
  }
  EditProductImage(id, productImage) {
    return new Promise((resolve, reject) => {
      let count = 0;
      if (
        productImage == '' ||
        productImage.length == 0 ||
        productImage[0] == ''
      ) {
        console.log('nothing');
        return resolve();
      } else {
        db.query(
          'delete from product_image where product_id=?',
          [id],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
              for (let j of productImage) {
                micro_service
                  .AddImage(j, 'product')
                  .then((p_img) => {
                    db.query(
                      'INSERT  INTO product_image(image, product_id) values(?,?)',
                      [p_img, id],
                      (err, result) => {
                        if (err) {
                          console.log(err);
                          return reject(err);
                        } else {
                          count++;
                          if (count == productImage.length) {
                            return resolve();
                          }
                        }
                      }
                    );
                  })
                  .catch((err) => {
                    console.log(err);
                  });
                // let p_img="https://dev-api.billfy.in/pictures/"+j.filename
              }
            }
          }
        );
      }
    });
  }
  SearchFactory(body, company_id) {
    return new Promise((resolve, reject) => {
      let key = body.keyword + '%';
      db.query(
        'select id,factory_name from factory where factory_name like ? and company_id=?',
        [key, company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('Error');
          } else {
            return resolve(result);
          }
        }
      );
    });
  }
  LinkProductToDefaultFactory(company_id, product_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select factory_name,link_products,id from factory where company_id=? ',
        [company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            for (let i = 0; i < result.length; i++) {
              console.log('INside_factory' + result[i]);
              let link_products = result[i].link_products;
              let factory_id = result[i].id;
              console.log('link_pro' + link_products);
              console.log('factor_id' + factory_id);
              if (link_products == 1) {
                db.query(
                  'insert into factory_product(factory_id,product_id) values (?,?)',
                  [factory_id, product_id],
                  (err, result2) => {
                    if (err) {
                      console.log(err);
                      // return reject(err);
                    } else {
                      console.log('product added');
                    }
                  }
                );
              }
            }
            return resolve();
          }
        }
      );
    });
  }
  CheckIfCompanyUserEmailExists(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where email=?',
        [email],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length == 0) {
              return resolve();
            } else {
              return reject('email-id already exists!');
            }
          }
        }
      );
    });
  }
  CheckIfCompanyUserEmailExistsAdd(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where email=? and is_deleted!=1',
        [email],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length == 0) {
              return resolve();
            } else {
              return reject('email-id already exists!');
            }
          }
        }
      );
    });
  }
  CheckIfCompanyUserEmailExistsEdit(email, id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where email=? and id!=? and is_deleted!=1',
        [email, id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length == 0) {
              return resolve();
            } else {
              return reject('email-id already exists!');
            }
          }
        }
      );
    });
  }
  // GetProductListDetailsTotalCount(company_id) {
  //   return new Promise((resolve, reject) => {
  //     db.query(
  //       'select count(p.product_name) as total_count from product_list p, warranty w,product_image pi where p.id=w.product_id and p.id=pi.product_id and company_id=? and p.is_deleted=0',
  //       [company_id],
  //       (err, result) => {
  //         if (err) {
  //           return reject(err);
  //         } else {
  //           return resolve(result[0].total_count);
  //         }
  //       }
  //     );
  //   });
  // }

  // GetProductListDetailsTotalCount(i, company_id) {
  //   return new Promise((resolve, reject) => {
  //     const page = i.page_number || 1; // Get the page number from the query parameters (default to 1)
  //     const pageSize = i.items_per_page || 2; // Number of blogs per page
  //     // console.log(req.body);
  //     const offset = (page - 1) * pageSize;
  //     const limit = pageSize;
  //     let search_by = i.search_by || '';
  //     console.log('ser' + search_by);
  //     var srchStr = '';
  //     var andStr = 'and';

  //     if (search_by) {
  //       if (srchStr != '') {
  //         andStr = 'AND ';
  //       }
  //       // search_by = global.Helpers.globalFilter(search_by);
  //       srchStr +=
  //         andStr +
  //         `(p.product_name LIKE '%${search_by}%' OR w.year LIKE '%${search_by}%' OR pc.title LIKE '%${search_by}%' )`;
  //     }

  //     // if (srchStr == '') srchStr = 1;

  //     db.query(
  //       // `select p.product_name,p.product_model,p.id,p.discount,w.month,w.year,pi.image from product_list p, warranty w,product_image pi where p.id=w.product_id and p.id=pi.product_id and company_id=? and p.is_deleted=0 ${srchStr}  order by added_at desc LIMIT ${limit} OFFSET ${offset}`,
  //       `Select count(product_name) as total_count From (SELECT
  //      p.product_name
  //      ,
  //      (
  //        SELECT JSON_ARRAYAGG(JSON_OBJECT('title', pc.title))
  //        FROM product_category pc
  //        WHERE pc.product_id = p.id
  //      ) AS category
  //    FROM
  //      product_list p
  //    INNER JOIN
  //      warranty w ON p.id = w.product_id
  //    INNER JOIN
  //      product_image pi ON p.id = pi.product_id
  //      LEFT JOIN
  // product_category pc ON p.id = pc.product_id
  //    WHERE
  //      p.company_id = ?
  //      AND p.is_deleted = 0
  //      ${srchStr}
  //    GROUP BY
  //      p.id
  //    ORDER BY
  //      p.added_at DESC) as t1
  //      `,

  //       [company_id],
  //       (err, result) => {
  //         if (err) {
  //           return reject(err);
  //         } else {
  //           console.log(result + 'prdd');
  //           return resolve(result[0].total_count);
  //         }
  //       }
  //     );
  //   });
  // }

  GetProductListDetailsTotalCount(i, company_id) {
    return new Promise((resolve, reject) => {
      let search_by = i.search_by || '';
      let filter_by = i.filter_by || '';
      console.log('ser' + search_by);

      var srchStr = '';
      var andStr = 'and';
      var filterStr = '';

      let searchTerms = [];
      if (filter_by && filter_by.length > 0) {
        if (filterStr != '') {
          andStr = 'AND ';
        }

        filterStr += andStr + '(';

        // Use a loop to generate the search condition for each term
        filterStr += filter_by
          .map(
            (term) =>
              `(
              pc.title = '${term}' 
            )`
          )
          .join(' OR ');

        filterStr += ')';
        console.log(filterStr + '-----1');
      }

      // if (search_by) {
      //   searchTerms = search_by.split(',').map((term) => term.trim());

      //   if (searchTerms.length > 0) {
      //     if (filterStr !== '') {
      //       andStr = 'AND';
      //     }

      //     srchStr += '(';

      //     // Use a loop to generate the search condition for each term
      //     srchStr += searchTerms
      //       .map(
      //         (term) =>
      //           `(
      //           product_name LIKE '%${term}%' OR
      //           year LIKE '%${term}%' OR
      //           JSON_SEARCH(category, 'one', '%${term}%', NULL, '$[*].title') IS NOT NULL OR
      //         )`
      //       )
      //       .join(' OR ');

      //     srchStr += ')';
      //   }
      //   console.log(srchStr + '-----2');
      // }

      if (search_by) {
        searchTerms = search_by.split(',').map((term) => term.trim());

        if (searchTerms.length > 0) {
          if (filterStr !== '') {
            andStr = 'AND';
          }

          srchStr += 'WHERE' + '(';

          // Use a loop to generate the search condition for each term
          srchStr += searchTerms
            .map(
              (term) =>
                `(
                        product_name LIKE '%${term}%' OR 
                        year LIKE '%${term}%' OR 
                        JSON_SEARCH(category, 'one', '%${term}%', NULL, '$[*].title') IS NOT NULL 
                      )`
            )
            .join(' OR ');

          srchStr += ')';
        }
        console.log(srchStr + '-----2');
      }

      // if (search_by) {
      //   if (srchStr != '') {
      //     andStr = 'AND ';
      //   }
      //   // search_by = global.Helpers.globalFilter(search_by);
      //   srchStr +=
      //     andStr +
      //     `(p.product_name LIKE '%${search_by}%' OR w.year LIKE '%${search_by}%' OR pc.title LIKE '%${search_by}%' )`;
      // }

      // if (srchStr == '') srchStr = 1;

      // db.query(
      //   // `select p.product_name,p.product_model,p.id,p.discount,w.month,w.year,pi.image from product_list p, warranty w,product_image pi where p.id=w.product_id and p.id=pi.product_id and company_id=? and p.is_deleted=0 ${srchStr}  order by added_at desc LIMIT ${limit} OFFSET ${offset}`,
      //   //     `SELECT
      //   //     p.product_name,
      //   //     p.product_model,
      //   //     p.id,
      //   //     p.discount,
      //   //     MAX(w.month) AS month,
      //   //     MAX(w.year) AS year,
      //   //     MAX(pi.image) as image,
      //   //     (
      //   //         SELECT JSON_EXTRACT(
      //   //             JSON_ARRAYAGG(JSON_OBJECT('title', pc.title)),
      //   //             '$'
      //   //         )
      //   //         FROM product_category pc
      //   //         WHERE pc.product_id = p.id
      //   //     ) as category
      //   // FROM
      //   //     product_list p
      //   // INNER JOIN
      //   //     warranty w ON p.id = w.product_id
      //   // INNER JOIN
      //   //     product_image pi ON p.id = pi.product_id
      //   //     LEFT JOIN
      //   // product_category pc ON p.id = pc.product_id
      //   // WHERE
      //   //     p.company_id = ?
      //   //     AND p.is_deleted = 0
      //   //     ${filterStr}
      //   //     ${srchStr}
      //   // GROUP BY
      //   //     p.id
      //   // ORDER BY
      //   //     p.id DESC
      //   // LIMIT ${limit} OFFSET ${offset};

      //   //    `,
      db.query(
        `SELECT 
        count(product_name)as total_count
    FROM 
        (
          SELECT 
            p.product_name, 
            p.product_model, 
            p.id, 
            p.discount, 
            MAX(w.month) AS month, 
            MAX(w.year) AS year, 
            MAX(pi.image) as image,
              (
              SELECT JSON_UNQUOTE(JSON_EXTRACT(
                JSON_ARRAYAGG(JSON_OBJECT('title', pc.title)),
                '$'
              )) 
              FROM product_category pc
              WHERE pc.product_id = p.id
            ) as category  
          FROM 
            product_list p
            LEFT JOIN 
            warranty w ON p.id = w.product_id
          LEFT JOIN 
            product_image pi ON p.id = pi.product_id
            LEFT JOIN 
          product_category pc ON p.id = pc.product_id
          WHERE 
            p.company_id = ? 
            AND p.is_deleted = 0 
            ${filterStr}
          GROUP BY 
            p.id
        ) AS filtered_data
    
        ${srchStr}
    ORDER BY 
        filtered_data.id DESC
  
    `,
        [company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);

            // result.forEach((product) => {
            //   product.category = JSON.parse(product.category);
            //   console.log(product);
            // });
            // console.log(resu);

            return resolve(result[0].total_count);
          }
        }
      );
    });
  }

  GetProductListDetails(request_body, company_id) {
    return new Promise((resolve, reject) => {
      const page = request_body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = request_body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      let search_by = request_body.search_by || '';
      let filter_by = request_body.filter_by || '';
      console.log('ser' + search_by);

      var srchStr = '';
      var andStr = 'and';
      var filterStr = '';

      let searchTerms = [];

      var sort_order = 'DESC';
      var sort_by = 'added_at';

      if (request_body.sort_order != null) {
        if (request_body.sort_order == 1) {
          sort_order = 'ASC';
        } else if (request_body.sort_order == -1) {
          sort_order = 'DESC';
        }
      }

      if (request_body.sort_by != '' && request_body.sort_by != null) {
        if (request_body.sort_by == 'product_name') {
          sort_by = 'product_name';
        }
        if (request_body.sort_by == 'category') {
          sort_by = 'category';
        }
        if (request_body.sort_by == 'warranty') {
          sort_by = 'year';
          sort_by = sort_by + ' ' + sort_order + ',' + ' month';
        }
      }

      if (filter_by && filter_by.length > 0) {
        if (filterStr != '') {
          andStr = 'AND ';
        }

        filterStr += andStr + '(';

        // Use a loop to generate the search condition for each term
        filterStr += filter_by
          .map(
            (term) =>
              `(
                pc.title = '${term}' 
                )`
          )
          .join(' OR ');

        filterStr += ')';
        console.log(filterStr + '-----1');
      }

      // if (search_by) {
      //   searchTerms = search_by.split(',').map((term) => term.trim());

      //   if (searchTerms.length > 0) {
      //     if (filterStr !== '') {
      //       andStr = 'AND';
      //     }

      //     srchStr += '(';

      //     // Use a loop to generate the search condition for each term
      //     srchStr += searchTerms
      //       .map(
      //         (term) =>
      //           `(
      //           product_name LIKE '%${term}%' OR
      //           year LIKE '%${term}%' OR
      //           JSON_SEARCH(category, 'one', '%${term}%', NULL, '$[*].title') IS NOT NULL OR
      //         )`
      //       )
      //       .join(' OR ');

      //     srchStr += ')';
      //   }
      //   console.log(srchStr + '-----2');
      // }

      if (search_by) {
        searchTerms = search_by.split(',').map((term) => term.trim());

        if (searchTerms.length > 0) {
          if (filterStr !== '') {
            andStr = 'AND';
          }

          srchStr += 'WHERE' + '(';

          // Use a loop to generate the search condition for each term
          srchStr += searchTerms
            .map(
              (term) =>
                `(
                        product_name LIKE  '%${term}%' OR 
                        year LIKE  '%${term}%' OR 
                        JSON_SEARCH(category, 'one', '%${term}%', NULL, '$[*].title') IS NOT NULL 
                      )`
            )
            .join(' OR ');

          srchStr += ')';
        }
        console.log(srchStr + '-----2');
      }

      // if (search_by) {
      //   if (srchStr != '') {
      //     andStr = 'AND ';
      //   }
      //   // search_by = global.Helpers.globalFilter(search_by);
      //   srchStr +=
      //     andStr +
      //     `(p.product_name LIKE '%${search_by}%' OR w.year LIKE '%${search_by}%' OR pc.title LIKE '%${search_by}%' )`;
      // }

      // if (srchStr == '') srchStr = 1;

      // db.query(
      //   // `select p.product_name,p.product_model,p.id,p.discount,w.month,w.year,pi.image from product_list p, warranty w,product_image pi where p.id=w.product_id and p.id=pi.product_id and company_id=? and p.is_deleted=0 ${srchStr}  order by added_at desc LIMIT ${limit} OFFSET ${offset}`,
      //   //     `SELECT
      //   //     p.product_name,
      //   //     p.product_model,
      //   //     p.id,
      //   //     p.discount,
      //   //     MAX(w.month) AS month,
      //   //     MAX(w.year) AS year,
      //   //     MAX(pi.image) as image,
      //   //     (
      //   //         SELECT JSON_EXTRACT(
      //   //             JSON_ARRAYAGG(JSON_OBJECT('title', pc.title)),
      //   //             '$'
      //   //         )
      //   //         FROM product_category pc
      //   //         WHERE pc.product_id = p.id
      //   //     ) as category
      //   // FROM
      //   //     product_list p
      //   // INNER JOIN
      //   //     warranty w ON p.id = w.product_id
      //   // INNER JOIN
      //   //     product_image pi ON p.id = pi.product_id
      //   //     LEFT JOIN
      //   // product_category pc ON p.id = pc.product_id
      //   // WHERE
      //   //     p.company_id = ?
      //   //     AND p.is_deleted = 0
      //   //     ${filterStr}
      //   //     ${srchStr}
      //   // GROUP BY
      //   //     p.id
      //   // ORDER BY
      //   //     p.id DESC
      //   // LIMIT ${limit} OFFSET ${offset};

      //   //    `,
      db.query(
        `SELECT 
        product_name, 
        product_model, 
        DATE_FORMAT(added_at, '%Y-%m-%d %H:%i:%s') as added_at,
        id, 
        discount, 
        month , 
        year , 
        image ,
        category
    FROM 
        (
          SELECT 
            p.product_name, 
            p.product_model, 
            p.id, 
            p.added_at,
            p.discount, 
            MAX(w.month) AS month, 
            MAX(w.year) AS year, 
            MAX(pi.image) as image,
            (
              SELECT JSON_UNQUOTE(JSON_EXTRACT(
                JSON_ARRAYAGG(JSON_OBJECT('title', pc.title)),
                '$'
              )) 
              FROM product_category pc
              WHERE pc.product_id = p.id
            ) as category 
          FROM 
            product_list p
          LEFT JOIN 
            warranty w ON p.id = w.product_id
          LEFT JOIN 
            product_image pi ON p.id = pi.product_id
            LEFT JOIN 
          product_category pc ON p.id = pc.product_id
          WHERE 
            p.company_id = ? 
            AND p.is_deleted = 0 
            ${filterStr}
          GROUP BY 
            p.id
        ) AS filtered_data
    
        ${srchStr}
    ORDER BY 
        ${sort_by} ${sort_order}
    LIMIT ${limit} OFFSET ${offset};
    `,
        [company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);

            result.forEach((product) => {
              product.category = JSON.parse(product.category);
              console.log(product);
            });
            // console.log(resu);

            return resolve(result);
          }
        }
      );
    });
  }

  GetAllProduct(company_id) {
    return new Promise((resolve, reject) => {
      let cnt = 0;

      db.query(
        'select id from product_list where company_id=?',
        [company_id],
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

  GetProductCategory(product_list) {
    return new Promise((resolve, reject) => {
      let cnt = 0;
      for (let product of product_list) {
        product.category = [];
        db.query(
          'select title from product_category where product_id=?',
          [product.id],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
              product.category = result;
              if (cnt == product_list.length - 1) {
                return resolve(product_list);
              }
              cnt++;
            }
          }
        );
      }
    });
  }
  ProductCategorySearch(keyword, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from product_list where id in(select product_id from product_category where title=?) and company_id=?',
        [keyword, company_id],
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
  DeleteFactoryProduct(id, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        ' update factory_product set is_deleted=1 where id=?',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve('Factory product deleted!');
          }
        }
      );
    });
  }
  DeleteFactory(id, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        `select * from company_user where factory_id=? and company_id=? and is_deleted!=1`,
        [id, company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result && result.length > 0) {
              return reject(
                'Factory Cannot be Deleted. Company User Linked with this factory exists. In order to delete factory delete those users first or unlink this factory.'
              );
            } else {
              db.query(
                'update factory_product set is_deleted=1 where factory_id=?',
                [id],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    db.query(
                      'update factory set is_deleted=1 where id=?',
                      [id],
                      (err, result2) => {
                        if (err) {
                          return reject(err);
                        } else {
                          resolve('Factory deleted!');
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
    });
  }
  UpdateFactoryProduct(i) {
    return new Promise((resolve, reject) => {
      db.query(
        'update factory_product set product_id=? where id=?',
        [i.product_id, i.id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve('Product updated');
          }
        }
      );
    });
  }
  UpdateFactory(i, company_id) {
    return new Promise((resolve, reject) => {
      const link_products = i.link_products ? 1 : 0;

      db.query(
        'select * from factory where factory_name=? and id!=? and is_deleted!=1 and company_id=?',
        [i.factory_name, i.id, company_id],
        (err, fact) => {
          if (err) {
            return reject(err);
          } else if (
            fact &&
            fact.length > 0 &&
            fact &&
            i.factory_name != 'Default Factory'
          ) {
            return reject('Factory with Same name Already Exists');
          } else {
            db.query(
              'update factory set factory_name=?,link_products=? where id=?',
              [i.factory_name, link_products, i.id],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.send(err);
                } else {
                  // res.send({message:"Factory updated!"})
                  db.query(
                    'delete from factory_product where factory_id=?',
                    [i.id],
                    (err, result) => {
                      if (err) {
                        console.log(err);
                        res.send(err);
                      } else {
                        for (let j of i.products) {
                          db.query(
                            'insert into factory_product(factory_id,product_id) values (?,?)',
                            [i.id, j.product_id],
                            (err, result3) => {
                              if (err) {
                                console.log(err);
                                res.send(err);
                              } else {
                                console.log('product added!');
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                  setTimeout(() => {
                    let id = i.id;
                    console.log(id);
                    db.query(
                      'select * from factory where id=?',
                      [id],
                      (err, result2) => {
                        if (err) {
                          console.log(err);
                          res.send(err);
                        } else {
                          console.log(result2);
                          console.log(result2[0]);
                          let r1 = result2[0];
                          // r1.products=[];
                          db.query(
                            'select product_id from factory_product where factory_id=?',
                            [id],
                            (err, result3) => {
                              if (err) {
                                return reject(err);
                              } else {
                                r1.products = result3;
                                return resolve(r1);
                              }
                            }
                          );
                        }
                      }
                    );
                  }, 200);
                }
              }
            );
          }
        }
      );
    });
  }
  FetchFactoryProduct(i) {
    return new Promise((resolve, reject) => {
      db.query(
        'select fd.*,pl.product_name,pl.product_model,pi.image from factory_product fd inner join product_list pl on fd.product_id=pl.id left join product_image pi ON pl.id = pi.product_id where fd.factory_id=? and fd.is_deleted!=1 and pl.is_deleted!=1 ',
        [i.factory_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            return resolve(result);
          }
        }
      );
    });
  }

  FactoryAvailableProductlist = async (request_body, company_id) => {
    // return new Promise((resolve, reject) => {
    const page = request_body.page_number || 1; // Get the page number from the query parameters (default to 1)
    try {
      const pageSize = request_body.items_per_page || 10;
      // Number of blogs per page
      // console.log(req.body);
      const selectedProductId = request_body.selectedProducts
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      let selString = ''
      if (selectedProductId && selectedProductId.length > 0) {

        selString = `WHERE 
        apd.product_id NOT IN  (${selectedProductId})`
      }
      //  const productList=  await db
      //  .promise()
      //  .query(
      //     `select * from ( select 
      //       pl.id as product_id,
      //       pl.product_name,
      //       pl.product_model,
      //       pi.image 
      //   from 
      //       product_list pl 
      //   left join 
      //       fd on fd.product_id=pl.id 
      //   left join 
      //       product_image pi ON pl.id = pi.product_id 
      //   where 
      //       pl.company_id=24 and pl.is_deleted!=1) as apd where apd.product_id not in ${selectedProductId} order by apd.product_id desc limit ${limit} offset ${offset} `,[company_id])
      const productList = await db.promise().query(
        `SELECT * FROM (
          SELECT 
              pl.id AS product_id,
              pl.product_name,
              pl.product_model,
              pi.image 
          FROM 
              product_list pl 
       
          LEFT JOIN 
              product_image pi ON pl.id = pi.product_id 
          WHERE 
              pl.company_id = ? AND pl.is_deleted != 1
      ) AS apd 
     ${selString}
      ORDER BY 
          apd.product_id DESC 
      LIMIT ? OFFSET ?`,
        [company_id, limit, offset]
      );
      const productCount = await db.promise().query(
        `SELECT COUNT(apd.product_id) AS total_count FROM (
        SELECT 
            pl.id AS product_id,
            pl.product_name,
            pl.product_model,
            pi.image 
        FROM 
            product_list pl 
   
        LEFT JOIN 
            product_image pi ON pl.id = pi.product_id 
        WHERE 
            pl.company_id = ? AND pl.is_deleted != 1
    ) AS apd 
   ${selString}`,
        [company_id]
      );

      // const productCount=await db
      // .promise()
      // .query(
      //    `select count(apd.product_id) as total_count from ( select 
      //     pl.id as product_id,
      //     pl.product_name,
      //     pl.product_model,
      //     pi.image 
      // from 
      //     product_list pl 
      // left join 
      //     fd on fd.product_id=pl.id 
      // left join 
      //     product_image pi ON pl.id = pi.product_id 
      // where 
      //     pl.company_id=24 and pl.is_deleted!=1) as apd where apd.product_id not in ${selectedProductId} `,[company_id])

      let res_data = {}
      if (productList && productList[0]) {
        res_data.productList = productList[0]
      }
      if (productCount && productCount[0] && productCount[0].length > 0) {
        res_data.total_count = productCount[0][0].total_count
        res_data.total_pages = Math.ceil(productCount[0][0].total_count / pageSize)
        res_data.current_page = page
        res_data.is_last_page = res_data.total_pages === res_data.current_page ? 1 : 0
      }
      return res_data

    } catch (err) {
      console.log(err)
      throw err
    }
    // });
  }
  FetchFactory(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from factory where company_id=? and is_deleted!=1',
        [id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            // res.send(result);
            let r1 = result;
            let cnt = 0;
            for (let j of r1) {
              cnt++;
              j.products = [];
              db.query(
                'select fd.product_id,fd.id from factory_product fd inner join product_list pl on fd.product_id=pl.id where fd.factory_id=? and fd.is_deleted!=1 and pl.is_deleted!=1',
                [j.id],
                (err, result2) => {
                  if (err) {
                    console.log(err);
                    return reject(err);
                  } else {
                    j.products = result2;
                  }
                }
              );
            }
            setTimeout(() => {
              return resolve(r1);
            }, 200);
          }
        }
      );
    });
  }

  FetchFactoryDetails = async (factory_id, company_id) => {
    try {
      //   const factory_id = Number(req.params.factory_id);
      const factory_details = await db
        .promise()
        .query('select * from factory where id=? and company_id=?', [
          factory_id,
          company_id,
        ]);

      if (
        factory_details &&
        factory_details.length > 0 &&
        factory_details[0].length
      ) {
        console.log('ere');
        return factory_details[0];
      } else {
        // res.json({
        //   success: false,
        //   message: 'Nothing Found with this factory_id',
        // });
        // return [];
        throw new Error('Factory Not Found');
      }
    } catch (err) {
      //   res.json({ success: false, message: err.message });
      throw new Error(err);
    }
  };

  AddFactory(i, company_id) {
    return new Promise((resolve, reject) => {
      const link_products = i.mark_as_default ? 1 : 0;
      db.query(
        'select * from factory where factory_name=? and is_deleted!=1 and company_id=?',
        [i.factory_name, company_id],
        (err, fact) => {
          if (err) {
            return reject(err);
          } else if (
            fact &&
            fact.length > 0 &&
            i.factory_name != 'Default Factory'
          ) {
            return reject('Factory with Same name Already Exists');
          } else {
            db.query(
              'insert into factory(company_id,factory_name,link_products) values (?,?,?)',
              [company_id, i.factory_name, link_products],
              (err, result) => {
                if (err) {
                  console.log(err);
                  return reject(err);
                } else {
                  db.query(
                    'select id from factory where factory_name=?',
                    [i.factory_name],
                    (err, result2) => {
                      if (err) {
                        console.log(err);
                        return reject(err);
                      } else {
                        console.log(result2[0]);
                        let factory_id = result2[0].id;
                        // console.log(typeof i);
                        for (let j of i.products) {
                          console.log(j);
                          db.query(
                            'insert into factory_product(factory_id,product_id) values (?,?)',
                            [factory_id, j.product_id],
                            (err, result3) => {
                              if (err) {
                                console.log(err);
                                return reject(err);
                              } else {
                                console.log('product added!');
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                  setTimeout(() => {
                    db.query(
                      'select id from factory where factory_name=? and company_id=?',
                      [i.factory_name, company_id],
                      (err, result) => {
                        if (err) {
                          console.log(err);
                          return reject(err);
                        } else {
                          let id = result[0].id;
                          db.query(
                            'select * from factory where id=?',
                            [id],
                            (err, result2) => {
                              if (err) {
                                console.log(err);
                                return reject(err);
                              } else {
                                let r1 = result2[0];
                                // r1.products=[];
                                db.query(
                                  'select product_id from factory_product where factory_id=?',
                                  [id],
                                  (err, result3) => {
                                    if (err) {
                                      console.log(err);
                                      return reject(err);
                                    } else {
                                      r1.products = result3;
                                      console.log(r1);
                                      return resolve(r1);
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }, 200);
                }
              }
            );
          }
        }
      );
    });
  }
  ProductCategory(company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT category from company_categories where business_id=?',
        [company_id],
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
  DeleteCompanyCategory(i, business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select title from company_categories where id=? and business_id=?',
        [i.id, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else if (result && result.length > 0) {
            db.query(
              'Select * from product_category WHERE title=? and product_id in (Select id from product_list where company_id=?)',
              [result[0].title, business_id],
              (err, result1) => {
                if (err) {
                  return reject(err);
                } else if (result1 && result1.length > 0) {
                  return reject(
                    'Category cannot be Deleted. Product linked with this category Exists. Please unlink the category and try again.'
                  );
                } else {
                  db.query(
                    'DELETE FROM company_categories WHERE id=? and business_id=?',
                    [i.id, business_id],
                    (err, result) => {
                      if (err) {
                        return reject(err);
                      } else {
                        return resolve('Category deleted');
                      }
                    }
                  );
                }
              }
            );
          } else {
            return resolve('Category Not Found');
          }
        }
      );
    });
  }
  GetCompanyCategory(company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM company_categories where business_id=?',
        [company_id],
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
  EditCompanyCategory(i, company_id) {
    console.log(company_id);
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM company_categories WHERE title=? and business_id=? and id!=?',
        [i.title, company_id, i.id],
        (err, res1) => {
          if (err) {
            return reject(err);
          }
          if (res1 && res1.length > 0) {
            reject('Category with this Title already exists');
          } else {
            db.query(
              'select title from company_categories where id=? and business_id=?',
              [i.id, company_id],
              (err, result1) => {
                if (err) {
                  return reject(err);
                } else {
                  db.query(
                    'UPDATE company_categories SET title=?,description=? WHERE id=?',
                    [i.title, i.description, i.id],
                    (err, result) => {
                      if (err) {
                        return reject(err);
                      } else {
                        console.log(result1[0].title);

                        // return resolve('Category updated');
                        db.query(
                          'UPDATE product_category SET title=?, description=? WHERE title=? and product_id in (Select id from product_list where company_id=?)',
                          [
                            i.title,
                            i.description,
                            result1[0].title,
                            company_id,
                          ],
                          (err, result3) => {
                            if (err) {
                              return reject(err);
                            } else {
                              return resolve('Category updated');
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
  AddCompanyCategory(i, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM company_categories WHERE title=? and business_id=?',
        [i.title, company_id],
        (err, res1) => {
          if (err) {
            return reject(err);
          }
          if (res1 && res1.length > 0) {
            reject('Category with this Title already exists');
          } else {
            db.query(
              'INSERT INTO company_categories(business_id,title,description) values(?,?,?)',
              [company_id, i.title, i.description],
              (err, result) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve('Category inserted');
                }
              }
            );
          }
        }
      );
    });
  }

  CheckIfFactoryProductExists(factory_id, product_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select product_name,product_model,id from product_list where id in(select product_id from factory_product where factory_id=? and product_id=? and is_deleted!=1) and is_deleted!=1',
        [factory_id, product_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length <= 0) {
              return reject('Product Does Not belong to your Factory');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }

  FactoryProduct(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select product_name,product_model,id from product_list where id in(select product_id from factory_product where factory_id=? and is_deleted!=1) and is_deleted!=1',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            // res.send(result)
            let r1 = result;
            db.query(
              'select month, year,id,product_id from warranty where product_id in(select product_id from factory_product where factory_id=? and is_deleted!=1)',
              [id],
              (err, result2) => {
                if (err) {
                  return reject(err);
                } else {
                  let r2 = result2;

                  for (let i of r1) {
                    i.warranty = '';
                    let cnt = 1;
                    for (let j of r2) {
                      if (i['id'] == j['product_id'] && cnt < 2) {
                        i.warranty = j;
                        cnt = cnt + 1;
                      }
                    }
                  }
                }
              }
            );
            db.query(
              'select product_id, image, id from product_image where product_id in(select product_id from factory_product where factory_id=? and is_deleted!=1)',
              [id],
              (err, result3) => {
                if (err) {
                  return reject(err);
                } else {
                  let r3 = result3;

                  for (let i of r1) {
                    i.images = '';
                    let cnt = 1;
                    for (let j of r3) {
                      if (i['id'] == j['product_id'] && cnt < 2) {
                        i.images = j;
                        cnt = cnt + 1;
                      }
                    }
                  }
                  return resolve(r1);
                }
              }
            );
          }
        }
      );
    });
  }

  checkIfProductExits(id, company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM product_list WHERE id=? and company_id=? and is_deleted!=1',
        [id, company_id],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          if (!result || result.length === 0) {
            console.log('err');
            return reject('Invalid Product Id');
          } else {
            return resolve('Exits');
          }
        }
      );
    });
  }
  ProductDetails = async (i, company_id) => {
    try {
      const result = await db
        .promise()
        .query(
          'SELECT * FROM product_list WHERE id=? and company_id=? and is_deleted!=1',
          [i.id, company_id]
        );
      if (!result || !result[0] || result[0].length === 0) {
        console.log('err');
        throw new Error('Invalid Product Id');
      }
      console.log(result[0]);
      // result[0] = result[0][0];
      const r1 = result[0];
      console.log(r1);
      if (result[0][0].logo == null) {
        const logoResult = await db
          .promise()
          .query(
            'select id,logo,title from company_logo  where  title ="Default Logo" and company_id = (select company_id from product_list where id=?) ',
            [i.id]
          );

        // const logoResult=await db.promise().query()
        console.log(logoResult[0]);
        if (logoResult && logoResult[0] && logoResult[0].length > 0) {
          result[0][0].company_logo = {
            id: logoResult[0][0].id,
            title: logoResult[0][0].title,
            logo: logoResult[0][0].logo,
          };
        }
      } else {
        const logoResult = await db
          .promise()
          .query('select id,logo,title from company_logo where id=?', [
            result[0][0].logo,
          ]);

        if (logoResult && logoResult[0] && logoResult[0].length > 0) {
          result[0][0].company_logo = {
            id: logoResult[0][0].id,
            title: logoResult[0][0].title,
            logo: logoResult[0][0].logo,
          };
        }
      }
      const result2 = await db
        .promise()
        .query('select * from warranty where product_id=?', [i.id]);
      let r2 = result2[0];
      for (let i of r1) {
        i.warranty = [];
        for (let j of r2) {
          if (i['id'] == j['product_id']) {
            i.warranty.push(j);
          }
        }
      }

      const result3 = await db
        .promise()
        .query('select * from product_image where product_id=?', [i.id]);
      let r3 = result3[0];
      for (let i of r1) {
        i.images = [];
        for (let j of r3) {
          if (i['id'] == j['product_id']) {
            i.images.push(j);
          }
        }
      }

      const result4 = await db
        .promise()
        .query('select * from product_category where product_id=?', [i.id]);

      let r4 = result4[0];
      for (let i of r1) {
        i.category = [];
        for (let j of r4) {
          if (i['id'] == j['product_id']) {
            i.category.push(j);
          }
        }
      }
      // res.send(result)

      const result5 = await db
        .promise()
        .query(
          'select * from product_purchase_options where product_id=? order by sequence',
          [i.id]
        );
      let r5 = result5[0];
      for (let i of r1) {
        i.purchaseOptions = [];
        for (let j of r5) {
          if (i['id'] == j['product_id']) {
            i.purchaseOptions.push(j);
          }
        }
      }
      // res.send(result)

      const result6 = await db
        .promise()
        .query('select * from product_videos where product_id=?', [i.id]);
      let r6 = result6[0];
      for (let i of r1) {
        i.video = [];
        for (let j of r6) {
          if (i['id'] == j['product_id']) {
            i.video.push(j);
          }
        }
      }
      // res.send(result)

      const result7 = await db
        .promise()
        .query(
          'select warranty_registered from encoded_product where product_id=?',
          [i.id]
        );
      // console.log(result6);
      if (result7.length == 0) {
        result[0].warranty_registered = 'Warranty not registered';
      } else {
        result[0].warranty_registered = result6[0].warranty_registered;
      }

      const result8 = await db
        .promise()
        .query('select * from additional_info where product_id=?', [i.id]);
      let r8 = result8[0];
      for (let i of r1) {
        i.additionalInfo = [];
        for (let j of r8) {
          if (i['id'] == j['product_id']) {
            i.additionalInfo.push(j);
          }
        }
      }
      console.log(result8 + 'r8');
      if (result8) return result[0][0];
    } catch (err) {
      throw new Error(err);
    }
  };

  CompanyIdentity(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT credits_remaining,role,email from business_user where business_id=?',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result[0].role == 'company') {
              db.query(
                'select b.email,b.passwordChanged,b.send_installation_mail,b.use_installation_form, c.* from business_user b, company_details c where b.business_id=c.business_id and b.business_id=?',
                [id],
                (err, result1) => {
                  if (err) {
                    return reject(err);
                  } else {


                    let user = {
                      role: 'company',
                      business_id: id,
                      avatarUrl: result1[0].avatarUrl,
                      display_name: result1[0].display_name,
                      owner_name: result1[0].owner_name,
                      phone: result1[0].phone,
                      address: result1[0].address,
                      passwordChanged: result1[0].passwordChanged,
                      send_installation_mail: result1[0].send_installation_mail,
                      use_installation_form: result1[0].use_installation_form,
                      company_email: result1[0].email,
                      helpline_number: result1[0].helpline_number,
                      helpline_email: result1[0].helpline_email,
                      credits_remaining: result[0].credits_remaining,
                    };
                    return resolve(user);
                  }
                }
              );
            }
            if (result[0].role == 'distributor') {
              db.query(
                'select b.ebusiness_idmail, c.* from business_user b, distributor_details c where b.business_id=c.business_id and b.business_id=?',
                [id],
                (err, result2) => {
                  if (err) {
                    return reject(err);
                  } else {
                    let user = {
                      role: 'distributor',
                      id: id,
                      GST_no: result2[0].GST_no,
                      enterprise_name: result2[0].enterprise_name,
                      owner_name: result2[0].owner_name,
                      phone: result2[0].phone,
                      address: result2[0].address,
                      PAN: result2[0].PAN,
                      pincode: result2[0].pincode,
                      state: result2[0].state,
                      aadhar_no: result2[0].aadhar_no,
                      email: result2[0].email,
                    };
                    return resolve(user);
                  }
                }
              );
            }
          }
        }
      );
    });
  }

  GetCompanyRootUserId(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM dashboard_users WHERE company_id=? and is_deleted!=1 and is_root=1',
        [business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (!result || (result && result.length <= 0)) {
              return reject("Root Account Not Found!")
            }
            console.log(result);
            return resolve(result[0].id);
          }
        }
      );
    });
  }
  // Identity(user_id,company_id){

  // }

  GetRemainingCompanyQRCredits(business_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT credits_remaining FROM business_user WHERE business_id=?',
        [business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            return resolve(result[0].credits_remaining);
          }
        }
      );
    });
  }

  UpdateQrCredits(business_id, remaining_credits) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE landing_page_user SET credit_limit=? WHERE id=?',
        [remaining_credits, business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            return resolve();
          }
        }
      );
    });
  }
  fetchQRCreditsTransactionTotalCount(business_id) {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT count(*)as total_count
          FROM company_qr_credits join lp_product_list on company_qr_credits.product_id = lp_product_list.product_id
          WHERE business_id = ?
          ORDER BY created_on Desc
        
        `;

      db.query(sql, [business_id], (err, result) => {
        if (err) {
          return reject(err);
        } else {
          console.log(result);
          return resolve(result[0].total_count);
        }
      });
    });
  }

  fetchQRCreditsTransaction(request_body, business_id) {
    return new Promise((resolve, reject) => {
      const page = request_body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = request_body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      var sort_order = 'DESC';
      var sort_by = 'created_on';

      if (request_body.sort_order != null) {
        if (request_body.sort_order == 1) {
          sort_order = 'ASC';
        } else if (request_body.sort_order == -1) {
          sort_order = 'DESC';
        }
      }

      if (request_body.sort_by != '' && request_body.sort_by != null) {
        if (request_body.sort_by == 'credit') {
          sort_by = 'credit';
        }
        if (request_body.sort_by == 'debit') {
          sort_by = 'debit';
        }
        if (request_body.sort_by == 'running_balance') {
          sort_by = 'running_balance';
        }
        if (request_body.sort_by == 'remarks') {
          sort_by = 'remarks';
        }
      }

      const sql = `
          SELECT DATE_FORMAT(cqc.created_on, '%Y-%m-%d %H:%i:%s') as datetime, cqc.transaction_remarks as remarks, 
                 CASE WHEN cqc.is_debited = 1 THEN amount ELSE 0 END AS debit,
                 CASE WHEN cqc.is_credited = 1 THEN amount ELSE 0 END AS credit,
                 cqc.remaining_credits as running_balance,
                 lp_product_list.product_name,
                 lp_product_list.category_title 
          FROM company_qr_credits cqc join lp_product_list on cqc.product_id = lp_product_list.product_id
          WHERE business_id = ?
          ORDER BY ${sort_by} ${sort_order},created_on ${sort_order}
          LIMIT ${limit} OFFSET ${offset};
        `;

      db.query(sql, [business_id], (err, result) => {
        if (err) {
          return reject(err);
        } else {
          console.log(result);
          return resolve(result);
        }
      });
    });
  }

  DeleteProduct(company_id, product_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE product_list SET is_deleted=1 WHERE company_id=? AND id=?',
        [company_id, product_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            return resolve(result[0]);
          }
        }
      );
    });
  }

  HardDeleteProductDetails = async (i, company_id) => {
    try {



      // const logoResult=await db.promise().query()




      const result2 = await db
        .promise()
        .query('delete from   warranty where product_id=?', [i.id]);
      // let r2 = result2[0];
      // for (let i of r1) {
      //   i.warranty = [];
      //   for (let j of r2) {
      //     if (i['id'] == j['product_id']) {
      //       i.warranty.push(j);
      //     }
      //   }
      // }

      const result3 = await db
        .promise()
        .query('delete from  product_image where product_id=?', [i.id]);


      const result4 = await db
        .promise()
        .query('delete from  product_category where product_id=?', [i.id]);


      // res.send(result)

      const result5 = await db
        .promise()
        .query(
          'delete from   product_purchase_options where product_id=? ',
          [i.id]
        );

      // res.send(result)

      const result6 = await db
        .promise()
        .query('delete from  product_videos where product_id=?', [i.id]);

      // res.send(result)

      const result7 = await db
        .promise()
        .query(
          'delete  from encoded_product where product_id=?',
          [i.id]
        );
      // // console.log(result6);
      // if (result7.length == 0) {
      //   result[0].warranty_registered = 'Warranty not registered';
      // } else {
      //   result[0].warranty_registered = result6[0].warranty_registered;
      // }

      const result8 = await db
        .promise()
        .query('delete from additional_info where product_id=?', [i.id]);

      console.log(result8 + 'r8');

      const result9 = await db
        .promise()
        .query('delete from warranty_availed_data where product_id=?', [i.id]);
      const result10 = await db
        .promise()
        .query('delete from QR where product_id=?', [i.id]);
      const result = await db
        .promise()
        .query(
          'delete from product_list WHERE id=? and company_id=?',
          [i.id, company_id]
        );
      // if (result8) return result[0][0];
      return
    } catch (err) {
      throw new Error(err);
    }
  };

  HardDeleteCompanyDetails = async (company_id) => {
    try {
      const result = await db
        .promise()
        .query(
          'delete from company_logo WHERE company_id=? ',
          [company_id]
        );



      // const logoResult=await db.promise().query()

      const resul7 = await db.promise().query('DELETE FROM factory_product WHERE factory_id IN (SELECT id FROM factory WHERE company_id = ?)', [company_id])
      const result8 = await db
        .promise()
        .query('DELETE FROM factory WHERE company_id = ?  ', [company_id]);

      const result2 = await db
        .promise()
        .query('delete from  company_details where business_id=?', [company_id]);
      // let r2 = result2[0];
      // for (let i of r1) {
      //   i.warranty = [];
      //   for (let j of r2) {
      //     if (i['id'] == j['product_id']) {
      //       i.warranty.push(j);
      //     }
      //   }
      // }

      const result3 = await db
        .promise()
        .query('delete from  company_qr_credits where business_id=?', [company_id]);
      const result5 = await db
        .promise()
        .query('delete from  dashboard_users where company_id=?', [company_id]);

      const result4 = await db
        .promise()
        .query('delete from business_user where business_id=?', [company_id]);

      // if (result8) return result[0][0];
      return
    } catch (err) {
      throw new Error(err);
    }
  };

  getAllCompanyUserData(company_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where company_id=?',
        [company_id],
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


  GetCompanyOverview = async (request_body, company_id) => {
    try {
      console.log("request_haha")
      console.log(request_body)

      let filter_by_category = request_body.filter_by_category || '';
      let filter_by_product = request_body.filter_by_product || '';
      let club_by = request_body.club_by || 'daily';
      // console.log('ser' + search_by);
      console.log(club_by)
      // var srchStr = '';
      var andCatStr = 'and';
      var filterCatStr = '';
      var andProdStr = 'and';
      var filterProdStr = '';

      // let searchTerms = [];

      // var sort_order = 'DESC';
      // var sort_by = 'added_at';

      // if (request_body.sort_order != null) {
      //   if (request_body.sort_order == 1) {
      //     sort_order = 'ASC';
      //   } else if (request_body.sort_order == -1) {
      //     sort_order = 'DESC';
      //   }
      // }

      // if (request_body.sort_by != '' && request_body.sort_by != null) {
      //   if (request_body.sort_by == 'product_name') {
      //     sort_by = 'product_name';
      //   }
      //   if (request_body.sort_by == 'category') {
      //     sort_by = 'category';
      //   }
      //   if (request_body.sort_by == 'warranty') {
      //     sort_by = 'year';
      //     sort_by = sort_by + ' ' + sort_order + ',' + ' month';
      //   }
      // }

      if (filter_by_category && filter_by_category.length > 0) {
        if (filterCatStr != '') {
          andCatStr = 'AND ';
        }

        filterCatStr += andCatStr + '(';

        // Use a loop to generate the search condition for each term
        filterCatStr += filter_by_category
          .map(
            (term) =>
              `(
                pc.title = '${term}' 
                )`
          )
          .join(' OR ');

        filterCatStr += ')';
        // console.log(filterCatStr + '-----1');
      }
      if (filter_by_product && filter_by_product.length > 0) {
        if (filterProdStr != '') {
          andProdStr = 'AND ';
        }

        filterProdStr += andProdStr + '(';

        // Use a loop to generate the search condition for each term
        filterProdStr += filter_by_product
          .map(
            (term) =>
              `(
                p.id = '${term}' 
                )`
          )
          .join(' OR ');

        filterProdStr += ')';
        // console.log(filterProdStr + '-----2');
      }


      const startDate = new Date(request_body.startDate)
      const endDate = new Date(request_body.endDate)
      let daterqrFilter = '', datetqrFilter = '', datewadFilter = ''
      if (startDate && endDate && isDate(startDate) && isDate(endDate)) {
        datetqrFilter = request_body.startDate && request_body.endDate ? `WHERE tqr.scanned_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'` : '';
        daterqrFilter = request_body.startDate && request_body.endDate ? `WHERE rqr.scanned_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'` : '';
        datewadFilter = request_body.startDate && request_body.endDate ? `AND wad.warranty_registered BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'` : ''
        console.log(daterqrFilter)
      }

      //   //    `,
      const warrantyRegistered = await db.promise().query(
        `SELECT 
        COUNT(wad.id) AS total_warranty_registered_count
      FROM 
        encoded_product wad
      INNER JOIN (
        SELECT 
          p.id as id
        FROM 
          product_list p
          LEFT JOIN product_category pc ON p.id = pc.product_id
        WHERE 
          p.company_id = ?
          AND p.is_deleted = 0 
          ${filterCatStr}
          ${filterProdStr}
        GROUP BY 
          p.id
      ) AS  fds ON wad.product_id = fds.id
      WHERE
        wad.warranty = 'availed' 

         ${datewadFilter}
    `,
        [company_id]
      );
      const total_qr_scans = await db.promise().query(
        `SELECT 
        COUNT(tqr.id) AS total_qr_scans_count
      FROM 
        encoded_product wad
        INNER JOIN (
        SELECT 
          p.id
        FROM 
          product_list p
          LEFT JOIN product_category pc ON p.id = pc.product_id
        WHERE 
          p.company_id = ? 
          AND p.is_deleted = 0 
          ${filterCatStr}
          ${filterProdStr}
        GROUP BY 
          p.id
      ) AS fds ON wad.product_id = fds.id
      LEFT JOIN total_qr_scans tqr ON wad.id = tqr.fk_encoded_product_id
    
        ${datetqrFilter}
    `,
        [company_id]
      );

      const red_qr_scans = await db.promise().query(
        `SELECT 
        COUNT(rqr.id) AS red_qr_scans_count
      FROM 
        encoded_product wad
        INNER JOIN (
        SELECT 
          p.id
        FROM 
          product_list p
          LEFT JOIN product_category pc ON p.id = pc.product_id
        WHERE 
          p.company_id = ? 
          AND p.is_deleted = 0 
          ${filterCatStr}
          ${filterProdStr}
        GROUP BY 
          p.id
      ) AS  fds ON wad.product_id = fds.id
      LEFT JOIN red_qr_scans rqr ON wad.id = rqr.fk_encoded_product_id
        ${daterqrFilter}
    `,
        [company_id]
      );



      // Set the variable before executing the main query

      // const t=await db.promise().query(`SET ${club_by} = "${club_by}";`);



      const data = await db.promise().query(
        `
  SELECT 
    grouping_field,
    MAX(logDate) AS logDate,
    DATE_FORMAT(MAX(logDate), '%d') as date,
    DATE_FORMAT(MAX(logDate), '%m') as month,
    DATE_FORMAT(MAX(logDate), '%y') as year,
    MAX(total_warranty) AS total_warranty,
    MAX(total_qr_scans) AS total_qr_scans,
    MAX(red_qr_scans) AS red_qr_scans
  FROM (
    SELECT
      twd.warranty_grouping_field AS grouping_field,
      twd.warranty_logDate AS logDate,
      twd.warranty_date AS date,
      twd.warranty_month AS month,
      twd.warranty_year AS year,
      twd.total_warranty,
      0 AS total_qr_scans,
      0 AS red_qr_scans
    FROM (
      SELECT
        CASE
          WHEN ? = 'daily' THEN DATE(wad.warranty_registered)
          WHEN ? = 'weekly' THEN CONCAT(YEAR(wad.warranty_registered), '-', WEEK(wad.warranty_registered))
          WHEN ? = 'monthly' THEN DATE_FORMAT(wad.warranty_registered, '%Y-%m')
          WHEN ? = 'yearly' THEN YEAR(wad.warranty_registered)
          ELSE NULL
        END AS warranty_grouping_field,
        MAX(wad.warranty_registered) as warranty_logDate,
        DATE_FORMAT(MAX(wad.warranty_registered), '%d') as warranty_date,
        DATE_FORMAT(MAX(wad.warranty_registered), '%m') as warranty_month,
        DATE_FORMAT(MAX(wad.warranty_registered), '%y') as warranty_year,
        COUNT(wad.id) AS total_warranty
      FROM
        encoded_product wad
        INNER JOIN (
          SELECT
            p.id
          FROM
            product_list p
            LEFT JOIN product_category pc ON p.id = pc.product_id
          WHERE
            p.company_id = ?
            AND p.is_deleted = 0
            ${filterCatStr}
            ${filterProdStr}
          GROUP BY
            p.id
        ) AS fds ON wad.product_id = fds.id
      WHERE
        wad.warranty = 'availed' 
        ${datewadFilter}
      GROUP BY
        warranty_grouping_field
    ) AS twd

    UNION ALL

    SELECT
      tqs.total_qr_scan_grouping_field AS grouping_field,
      tqs.logDate,
      tqs.total_qr_scan_date AS date,
      tqs.total_qr_scan_month AS month,
      tqs.total_qr_scan_year AS year,
      0 AS total_warranty,
      tqs.total_qr_scans,
      0 AS red_qr_scans
    FROM (
      SELECT
        CASE
          WHEN ? = 'daily' THEN DATE(tqr.scanned_at)
          WHEN ? = 'weekly' THEN CONCAT(YEAR(tqr.scanned_at), '-', WEEK(tqr.scanned_at))
          WHEN ? = 'monthly' THEN DATE_FORMAT(tqr.scanned_at, '%Y-%m')
          WHEN ? = 'yearly' THEN YEAR(tqr.scanned_at)
          ELSE NULL
        END AS total_qr_scan_grouping_field,
        MAX(tqr.scanned_at) as logDate,
        DATE_FORMAT(MAX(tqr.scanned_at), '%d') as total_qr_scan_date,
        DATE_FORMAT(MAX(tqr.scanned_at), '%m') as total_qr_scan_month,
        DATE_FORMAT(MAX(tqr.scanned_at), '%y') as total_qr_scan_year,
        COUNT(tqr.id) AS total_qr_scans
      FROM
        encoded_product wad
        INNER JOIN (
          SELECT
            p.id
          FROM
            product_list p
            LEFT JOIN product_category pc ON p.id = pc.product_id
          WHERE
            p.company_id = ?
            AND p.is_deleted = 0
            ${filterCatStr}
            ${filterProdStr}
          GROUP BY
            p.id
        ) AS fds ON wad.product_id = fds.id
        LEFT JOIN total_qr_scans tqr ON wad.id = tqr.fk_encoded_product_id
        ${datetqrFilter}
      GROUP BY
        total_qr_scan_grouping_field
    ) AS tqs

    UNION ALL

    SELECT
      rqs.red_qr_scan_grouping_field AS grouping_field,
      rqs.logDate,
      rqs.red_scan_date AS date,
      rqs.red_scan_month AS month,
      rqs.red_scan_year AS year,
      0 AS total_warranty,
      0 AS total_qr_scans,
      rqs.red_qr_scans
    FROM (
      SELECT
        CASE
          WHEN ? = 'daily' THEN DATE(rqr.scanned_at)
          WHEN ? = 'weekly' THEN CONCAT(YEAR(rqr.scanned_at), '-', WEEK(rqr.scanned_at))
          WHEN ? = 'monthly' THEN DATE_FORMAT(rqr.scanned_at, '%Y-%m')
          WHEN ? = 'yearly' THEN YEAR(rqr.scanned_at)
          ELSE NULL
        END AS red_qr_scan_grouping_field,
        MAX(rqr.scanned_at) as logDate,
        DATE_FORMAT(MAX(rqr.scanned_at), '%d') as red_scan_date,
        DATE_FORMAT(MAX(rqr.scanned_at), '%m') as red_scan_month,
        DATE_FORMAT(MAX(rqr.scanned_at), '%y') as red_scan_year,
        COUNT(rqr.id) AS red_qr_scans
      FROM
        encoded_product wad
        INNER JOIN (
          SELECT
            p.id
          FROM
            product_list p
            LEFT JOIN product_category pc ON p.id = pc.product_id
          WHERE
            p.company_id = ?
            AND p.is_deleted = 0
            ${filterCatStr}
            ${filterProdStr}
          GROUP BY
            p.id
        ) AS fds ON wad.product_id = fds.id
        LEFT JOIN red_qr_scans rqr ON wad.id = rqr.fk_encoded_product_id
        ${daterqrFilter}
      GROUP BY
        red_qr_scan_grouping_field
    ) AS rqs
  ) AS combined_data 
  WHERE grouping_field IS NOT NULL
  GROUP BY grouping_field
  ORDER BY logDate ASC;
  `,
        [club_by, club_by, club_by, club_by, company_id, club_by, club_by, club_by, club_by, company_id, club_by, club_by, club_by, club_by, company_id]
      );







      // const data = await db.promise().query(
      //   `
      //   SET ${club_by} = 'daily';

      //   SELECT
      //     CASE
      //       WHEN ${club_by} = 'daily' THEN DATE(wad.start_date)
      //       WHEN ${club_by} = 'weekly' THEN CONCAT(YEAR(wad.start_date), '-', WEEK(wad.start_date))
      //       WHEN ${club_by} = 'monthly' THEN DATE_FORMAT(wad.start_date, '%Y-%m')
      //       WHEN ${club_by} = 'yearly' THEN YEAR(wad.start_date)
      //       ELSE NULL
      //     END AS grouping_field,
      //     COUNT(DISTINCT wad.id) AS total_warranty,
      //     COUNT(DISTINCT tqr.id) AS total_scan,
      //     COUNT(DISTINCT rqr.id) AS total_red_scan
      //   FROM
      //     encoded_product wad
      //     INNER JOIN (
      //       SELECT
      //         p.id
      //       FROM
      //         product_list p
      //         LEFT JOIN product_category pc ON p.id = pc.product_id
      //       WHERE
      //         p.company_id = ?
      //         AND p.is_deleted = 0
      //         ${filterCatStr}
      //         ${filterProdStr}
      //       GROUP BY
      //         p.id
      //     ) AS fds ON wad.product_id = fds.id
      //     LEFT JOIN total_qr_scans tqr ON wad.id = tqr.fk_encoded_product_id
      //     LEFT JOIN red_qr_scans rqr ON wad.id = rqr.fk_encoded_product_id
      //   WHERE
      //     wad.warranty = 'availed'
      //     ${datewadFilter}
      //   GROUP BY
      //     grouping_field;
      //   `,
      //   [company_id]
      // );
      console.log(data[0])
      let result = {}
      if (warrantyRegistered && warrantyRegistered[0] && warrantyRegistered[0].length > 0) {
        result.warranty_registered_total_count = warrantyRegistered[0][0].total_warranty_registered_count
      }
      if (total_qr_scans && total_qr_scans[0] && total_qr_scans[0].length > 0) {
        result.total_qr_scans_count = total_qr_scans[0][0].total_qr_scans_count
      }
      if (red_qr_scans && red_qr_scans[0] && red_qr_scans[0].length > 0) {
        result.red_qr_scans_count = red_qr_scans[0][0].red_qr_scans_count
      }
      result.filterdData = data[0]
      // console.log(result)
      return result
    } catch (err) {
      // console.log(err)
      throw err.message
    }
    // return new Promise((resolve, reject) => {
    // const page = request_body.page_number || 1; // Get the page number from the query parameters (defult to 1)
    // const pageSize = request_body.items_per_page || 10; // Number of blogs per page
    // console.log(req.body);
    // const offset = (page - 1) * pageSize;
    // const limit = pageSize;
    // let search_by = request_body.search_by || '';
    // });
  }


  fetchInstallationData = async (request_body, company_id) => {
    try {

      let filter_by_category = request_body.filter_by_category || '';
      let filter_by_product = request_body.filter_by_product || '';
      let filterStage = request_body.filter_by_stage || '';
      const page = request_body.page_number || 1; // Get the page number from the query parameters (default to 1)
      const pageSize = request_body.items_per_page || 10; // Number of blogs per page
      // console.log(req.body);
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      console.log('ser', company_id);

      // var srchStr = '';
      var andCatStr = 'and';
      var filterCatStr = '';
      var andProdStr = 'and';
      var filterProdStr = '';
      var filterStageStr = ''
      var andStageStr = 'and'





      var sort_order = 'DESC';
      var sort_by = 'final_data.request_date_time';

      if (request_body.sort_order != null) {
        if (request_body.sort_order == 1) {
          sort_order = 'ASC';
        } else if (request_body.sort_order == -1) {
          sort_order = 'DESC';
        }
      }

      if (request_body.sort_by != '' && request_body.sort_by != null) {
        if (request_body.sort_by == 'product_name') {
          sort_by = 'final_data.product_name';
        }
        if (request_body.sort_by == 'installation_date') {
          sort_by = 'final_data.installation_date';
        }
        // if (request_body.sort_by == 'stage') {
        //   sort_by = 'final_data.stage';

        // }
      }

      // let searchTerms = [];

      // var sort_order = 'DESC';
      // var sort_by = 'added_at';

      // if (request_body.sort_order != null) {
      //   if (request_body.sort_order == 1) {
      //     sort_order = 'ASC';
      //   } else if (request_body.sort_order == -1) {
      //     sort_order = 'DESC';
      //   }
      // }

      // if (request_body.sort_by != '' && request_body.sort_by != null) {
      //   if (request_body.sort_by == 'product_name') {
      //     sort_by = 'product_name';
      //   }
      //   if (request_body.sort_by == 'category') {
      //     sort_by = 'category';
      //   }
      //   if (request_body.sort_by == 'warranty') {
      //     sort_by = 'year';
      //     sort_by = sort_by + ' ' + sort_order + ',' + ' month';
      //   }
      // }

      if (filter_by_category && filter_by_category.length > 0) {
        if (filterCatStr != '') {
          andCatStr = 'AND ';
        }

        filterCatStr += andCatStr + '(';

        // Use a loop to generate the search condition for each term
        filterCatStr += filter_by_category
          .map(
            (term) =>
              `(
                pc.title = '${term}' 
                )`
          )
          .join(' OR ');

        filterCatStr += ')';
        console.log(filterCatStr + '-----1');
      }
      if (filter_by_product && filter_by_product.length > 0) {
        if (filterProdStr != '') {
          andProdStr = 'AND ';
        }

        filterProdStr += andProdStr + '(';

        // Use a loop to generate the search condition for each term
        filterProdStr += filter_by_product
          .map(
            (term) =>
              `(
                p.id = '${term}' 
                )`
          )
          .join(' OR ');

        filterProdStr += ')';
        console.log(filterProdStr + '-----2');
      }

      var filterStr = '';

      let search_by = request_body.search_by || '';






      let whereConditions = [], startDate, endDate;
      if (request_body.request_date && request_body.request_date.startDate && request_body.request_date.endDate) {
        startDate = new Date(request_body.request_date.startDate)
        endDate = new Date(request_body.request_date.endDate)
      }

      //  if (filterStageStr !== '') {
      //      whereConditions.push(`${filterStageStr}`);
      //  }

      if (startDate) {
        whereConditions.push(`final_data.request_date_time >= '${startDate.toISOString()}'`);
      }
      if (endDate) {
        whereConditions.push(`final_data.request_date_time <= '${endDate.toISOString()}'`);
      }
      //  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';


      if (request_body.installation_date && request_body.installation_date.startDate && request_body.installation_date.endDate) {
        startDate = new Date(request_body.installation_date.startDate)
        endDate = new Date(request_body.installation_date.endDate)
      }

      //  if (filterStageStr !== '') {
      //      whereConditions.push(`${filterStageStr}`);
      //  }

      if (startDate) {
        whereConditions.push(`final_data.request_date_time >= '${startDate.toISOString()}'`);
      }
      if (endDate) {
        whereConditions.push(`final_data.request_date_time <= '${endDate.toISOString()}'`);
      }
      let searchTerms = []
      if (search_by) {
        searchTerms = search_by.split(',').map((term) => term.trim());
        if (searchTerms.length > 0) {
          // Use a loop to generate the search condition for each term
          whereConditions.push(`(${searchTerms
            .map(
              (term) =>
                `final_data.product_name LIKE '%${term}%' OR 
                final_data.contact_name LIKE '%${term}%' OR
                final_data.contact_number LIKE '%${term}%' OR
                final_data.contact_address LIKE '%${term}%' OR
                final_data.other_details LIKE '%${term}%' OR
                final_data.installation_date LIKE '%${term}%' OR
                final_data.request_date_time LIKE '%${term}%'`
            )
            .join(' OR ')})`);

        }
        // console.log(srchStr + '-----2');
      }
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';



      const result = await db.promise().query(`SELECT
   final_data.product_name,
   final_data.contact_name,
   final_data.contact_number,
   final_data.contact_address,
  final_data.installation_date,
   final_data.installation_time,
   final_data.request_date_time,
   final_data.other_details,
   final_data.request_id
FROM (
   SELECT
       e.id AS wad_id,
       fds.product_name,  
       uisd.contact_name,
       uisd.contact_number,
       uisd.contact_address,
       uisd.installation_date,
       uisd.installation_time,
       uisd.request_date_time,
       uisd.other_details,
       uisd.id as request_id
   FROM
       warranty_availed_data e
   INNER JOIN (
       SELECT
           p.product_name,
           p.id AS id
       FROM
           product_list p
           LEFT JOIN product_category pc ON p.id = pc.product_id
       WHERE
           p.company_id = ?
           AND p.is_deleted = 0
           ${filterCatStr}
           ${filterProdStr}
       GROUP BY
           p.id
   ) AS fds ON e.product_id = fds.id
   INNER JOIN user_installation_details uisd ON uisd.fk_wad_id = e.id
) AS final_data
${whereClause}
order by ${sort_by} ${sort_order}
  LIMIT ${limit} OFFSET ${offset};
 `, [company_id])


      const resultTotalCount = await db.promise().query(`SELECT
 count(final_data.request_date_time) as total_count
FROM (
 SELECT
     e.id AS wad_id,
     fds.product_name,  
     uisd.contact_name,
     uisd.contact_number,
     uisd.contact_address,
     uisd.installation_date,
     uisd.installation_time,
     uisd.request_date_time,
     uisd.other_details
 FROM
     warranty_availed_data e
 INNER JOIN (
     SELECT
         p.product_name,
         p.id AS id
     FROM
         product_list p
         LEFT JOIN product_category pc ON p.id = pc.product_id
     WHERE
         p.company_id = ?
         AND p.is_deleted = 0
         ${filterCatStr}
         ${filterProdStr}
     GROUP BY
         p.id
 ) AS fds ON e.product_id = fds.id
 INNER JOIN user_installation_details uisd ON uisd.fk_wad_id = e.id
) AS final_data
${whereClause}
`, [company_id])


      let res_data = {}
      if (result && result[0]) {
        res_data.user_list = result[0]
      }
      if (resultTotalCount && resultTotalCount[0] && resultTotalCount[0].length > 0) {
        res_data.total_count = resultTotalCount[0][0].total_count
        res_data.total_pages = Math.ceil(resultTotalCount[0][0].total_count / pageSize)
        res_data.current_page = page
      }

      //    const result= await db.promise().query(
      //     `SELECT 
      //    final_data.product_name,
      //    final_data.contact_name,
      //    final_data.contact_number,
      //    final_data.contact_address,
      //    final_data.installation_date,
      //    final_data.installation_time,
      //    final_data.request_date_time,
      //    final_data.other_details
      // FROM 
      //    ( Select * warranty_availed_data e INNER JOIN (
      //       SELECT 
      //           p.product_name,
      //           p.id as id
      //       FROM 
      //           product_list p
      //           LEFT JOIN product_category pc ON p.id = pc.product_id
      //       WHERE 
      //           p.company_id = ?
      //           AND p.is_deleted = 0 
      //           ${filterCatStr}
      //           ${filterProdStr}
      //       GROUP BY 
      //           p.id
      //   )  AS fds ON e.product_id = fds.id INNER JOIN  user_installation_details uisd on uisd.fk_wad_id=e.id)As final_data
      // ${whereClause}
      //  order by ${sort_by} ${sort_order}
      //  LIMIT ${limit} OFFSET ${offset};
      // `,[company_id]

      //   );

      return res_data


    } catch (err) {
      console.log(err)
      throw err
    }
  }


  getInstallationMailCredentials(business_id) {
    console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select imc.*,bu.send_installation_mail from installation_mail_credentials imc,business_user bu where imc.business_id=? and bu.business_id=?',
        [business_id, business_id],
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

  checkIfInstallationMailCredentials(business_id) {
    console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select imc.* from installation_mail_credentials imc where imc.business_id=?',
        [business_id, business_id],
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

  updateInstallationMailCredentials(body, business_id) {
    console.log(business_id)
    return new Promise((resolve, reject) => {
      let send_installation_mail = 0
      // console.log(body.email.trim())
      if (!body.email || !body.email.trim()) {
        return reject("Invalid email")
      }
      if (body.send_installation_mail) {
        send_installation_mail = body.send_installation_mail
      }
      db.query(
        'update installation_mail_credentials set email=? where business_id=?',
        [body.email.trim(), business_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            db.query(
              'update business_user set send_installation_mail=? where business_id=?',
              [send_installation_mail, business_id], (err, res2) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve("Updated!")

                }
              })


          }
        }
      );
    });
  }

  CreateInstallationMailCredentials(body, business_id) {
    console.log(business_id)
    return new Promise((resolve, reject) => {
      let send_installation_mail = 0
      // console.log(body.email.trim())
      if (!body.email || !body.email.trim()) {
        return reject("Invalid email")
      }
      if (body.send_installation_mail) {
        send_installation_mail = body.send_installation_mail
      }
      db.query(
        'INSERT INTO installation_mail_credentials (business_id, email) VALUES (?,?)',
        [business_id, body.email.trim()],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            db.query(
              'update business_user set send_installation_mail=? where business_id=?',
              [send_installation_mail, business_id], (err, res2) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve("Updated!")

                }
              })


          }
        }
      );
    });
  }


  CreateNewDashboardRole(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'insert into dashboard_roles (role_name,company_id) values(?,?)',
        [body.role_name, business_id],
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
  updateDashboardRole(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'update  dashboard_roles set role_name=? where id=? and company_id=?',
        [body.role_name, body.role_id, business_id],
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
  getDashboardRoleByID(body, business_id) {
    console.log(body.role_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select * from dashboard_roles  where id=? and company_id=?',
        [body.role_id, business_id],
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

  getAllDashboardRoles(business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select * from dashboard_roles  where  company_id=?',
        [business_id],
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

  CreateNewDashboardRolePermission(fk_role_id, fk_permission_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'insert into dashboard_roles_permission (fk_role_id,fk_permission_id) values(?,?)',
        [fk_role_id, fk_permission_id],
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
  deleteDashboardRoleById(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'delete  from dashboard_roles  where id=? and company_id=?',
        [body.role_id, business_id],
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
  deleteDashboardRolePermissions(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'delete  from dashboard_roles_permission  where fk_role_id=?',
        [body.role_id],
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



  getDashboardRolePermissionsById(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select drp.fk_permission_id from dashboard_roles_permission drp inner join dashboard_roles dr on drp.fk_role_id=dr.id  where drp.fk_role_id=? and dr.company_id=? ',
        [body.role_id, business_id],
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

  getDashboardRolePermissionsNameById(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select permission_name from dasboard_permissions where id in (select drp.fk_permission_id from dashboard_roles_permission drp inner join dashboard_roles dr on drp.fk_role_id=dr.id  where drp.fk_role_id=? and dr.company_id=?) ',
        [body.role_id, business_id],
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

  CreateNewDashboardUser(body, password, business_id, is_root) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'insert into dashboard_users (company_id,email,name,password,is_root) values(?,?,?,?,?)',
        [business_id, body.email, body.name, password, is_root],
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

  CreateNewDashboardUserRole(role_id, user_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'insert into dashboard_user_roles (fk_role_id,fk_dashboard_user_id) values(?,?)',
        [role_id, user_id],
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


  UpdateDashboardUserDataWithPassword(body, password, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'update  dashboard_users set email=?,name=?,password=? where id=? and  company_id=? ',
        [body.email, body.name, password, body.id, business_id],
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
  UpdateDashboardUserDataWithoutPassword(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'update  dashboard_users set email=?,name=? where id=? and  company_id=? ',
        [body.email, body.name, body.id, business_id],
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

  DeleteDashboardUser(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'update  dashboard_users set is_deleted=1 where id=? and  company_id=? ',
        [body.id, business_id],
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
  DeleteDashboardUserRole(user_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'delete from dashboard_user_roles where fk_dashboard_user_id=?',
        [user_id],
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

  getDashboardUserRole(user_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select fk_role_id from dashboard_user_roles where fk_dashboard_user_id=?',
        [user_id],
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

  getDashboardUserCountByRoleID(role_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select count(du.id) as total_users from dashboard_user_roles dur inner join  dashboard_users du on dur.fk_dashboard_user_id=du.id where dur.fk_role_id=? and du.is_deleted!=1',
        [role_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result)
            return resolve(result[0].total_users)

          }
        }
      );
    });
  }
  getDashboardUserDataByID(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select email,name,id,created_at from dashboard_users  where id=? and company_id=? and is_deleted!=1',
        [body.id, business_id],
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

  getAdminCount(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select count(dr.id) as admin_count from dashboard_users du inner join dashboard_user_roles dur on du.id=dur.fk_dashboard_user_id inner join dashboard_roles dr on dr.id=dur.dur.fk_role_id where  du.company_id=? and du.is_deleted!=1 and dr.role_name=Admin',
        [business_id],
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

  getDashboardUsersList(body, business_id) {
    // console.log(business_id)
    return new Promise((resolve, reject) => {
      db.query(
        'select du.name,du.email,du.id,dr.role_name from dashboard_users du inner join dashboard_user_roles dur on du.id=dur.fk_dashboard_user_id inner join dashboard_roles dr on dr.id=dur.fk_role_id where  du.company_id=? and du.is_deleted!=1 ',
        [business_id],
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


  doesDasboardEmailAlreadyExist(email) {
    console.log(email)
    return new Promise((resolve, reject) => {
      db.query(
        'select du.id,du.email,du.company_id ,du.name ,du.is_root from dashboard_users du inner join business_user bu on du.company_id=bu.business_id where du.email=? and du.is_deleted!=1 and bu.is_deleted!=1',
        [email],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {

            return resolve(result);

          }
        }
      );
    });
  }

  doesDasboardEmailAlreadyExistUpdate(email, id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select du.id,du.email,du.company_id ,du.name ,du.is_root from dashboard_users du inner join business_user bu on du.company_id=bu.business_id where du.email=? and du.id!=? and du.is_deleted!=1 and bu.is_deleted!=1',
        [email, id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            console.log(result)

            return resolve(result);

          }
        }
      );
    });
  }

  getAlphanumericData = async (alphanumeric, company_id) => {
    try {
      const data = await db.promise().query(`SELECT 
                          ep.alphanumeric,
                          ep.print AS printing_date,
                          ep.linked_to_master as linked_to_master_at,
                          ep.dispatched_from_factory as dispatched_from_factory_at,
                          ep.serial_number,
                          COALESCE(tqs.total_scan_count, 0) AS total_scan_count,
                          COALESCE(rs.red_scan_count, 0) AS red_scan_count,
                          wad.created_on AS warranty_availed_date,
                          pl.product_name,
                          pl.product_model,
                          pi.image as image_url,
                          wr.month as warranty_months,
                          wr.year as warranty_year
                      FROM encoded_product ep
                      LEFT JOIN product_list pl on  pl.id=ep.product_id
                      LEFT JOIN warranty wr on wr.product_id=ep.product_id
                      LEFT JOIN product_image pi on pi.product_id=ep.product_id
                      LEFT JOIN (
                          SELECT
                              fk_encoded_product_id,
                              COUNT(*) AS red_scan_count
                          FROM red_qr_scans
                          GROUP BY fk_encoded_product_id
                      ) rs ON ep.id = rs.fk_encoded_product_id
                      LEFT JOIN (
                          SELECT
                              fk_encoded_product_id,
                              COUNT(*) AS total_scan_count
                          FROM total_qr_scans
                          GROUP BY fk_encoded_product_id
                      ) tqs ON ep.id = tqs.fk_encoded_product_id
                      LEFT JOIN warranty_availed_data wad ON ep.alphanumeric = wad.alphanumeric where ep.alphanumeric=? and pl.company_id=?
                      `, [alphanumeric, company_id])

      //     const timelineData=await db.promise().query(`SELECT 

      //     ep.print AS event_date,
      //     cu.id as user_id,
      //     cu.name as user_name,
      //     cu.email as user_email,
      //     "printed" as event_name,
      //     cu.is_deleted as user_deleted

      // FROM encoded_product ep
      // LEFT JOIN product_list pl on  pl.id=ep.product_id
      //       LEFT JOIN company_user cu on ep.factory_operator_id=cu.id
      //       where ep.alphanumeric=? and pl.company_id=?;



      //         SELECT
      //             *

      //         FROM red_qr_scans

      //     where alphanumeric=?;

      //         SELECT
      //             *
      //         FROM total_qr_scans

      //         where alphanumeric=?;


      // `,[alphanumeric,company_id,alphanumeric,alphanumeric])


      // First Query
      const printedEventData = await db.promise().query(`
    SELECT 
        ep.print AS event_date,
        cu.id as user_id,
        cu.name as user_name,
        cu.email as user_email,
        "printed" as event_name,
        cu.is_deleted as user_deleted
    FROM encoded_product ep
    LEFT JOIN product_list pl on pl.id = ep.product_id
    LEFT JOIN company_user cu on ep.factory_operator_id = cu.id
    WHERE ep.alphanumeric = ? AND pl.company_id = ?;
`, [alphanumeric, company_id]);
      let linked_to_master_data, dispatched_from_factory_data, warranty_event_data;
      if (data[0][0].linked_to_master_at) {
        linked_to_master_data = await db.promise().query(`
    SELECT 
        ep.linked_to_master AS event_date,
        cu.id as user_id,
        cu.name as user_name,
        cu.email as user_email,
        "linked-to-master" as event_name,
        cu.is_deleted as user_deleted
    FROM encoded_product ep
    LEFT JOIN product_list pl on pl.id = ep.product_id
    LEFT JOIN company_user cu on ep.linked_to_master_by = cu.id
    WHERE ep.alphanumeric = ? AND pl.company_id = ? ;
`, [alphanumeric, company_id]);
      }

      if (data[0][0].dispatched_from_factory_at) {
        dispatched_from_factory_data = await db.promise().query(`
   SELECT 
       ep.dispatched_from_factory AS event_date,
       gt.shipped_to as shipped_to ,
       gt.bill_number as bill_number,
       gt.vehicle_number as vehicle_number,
       gt.transaction_id as gatekeeper_transaction_id,
       cu.id as user_id,
       cu.name as user_name,
       cu.email as user_email,
       "dispatched-from-factory" as event_name,
       cu.is_deleted as user_deleted
   FROM encoded_product ep
   LEFT JOIN product_list pl on pl.id = ep.product_id
   LEFT JOIN gateKeeper_transaction_data gtd on ep.alphanumeric=gtd.alphanumeric
   LEFT JOIN gateKeeper_transactions gt on gtd.transaction_id=gt.transaction_id
   LEFT JOIN company_user cu on gt.gateKeeper_id = cu.id
   WHERE ep.alphanumeric = ? AND pl.company_id = ? ;
`, [alphanumeric, company_id]);
      }
      // Second Query
      const redScansData = await db.promise().query(`
    SELECT scanned_at as event_date,
    "red-scan" as event_name
    FROM red_qr_scans
    WHERE alphanumeric = ? ;
`, [alphanumeric]);
      let totalScansData;
      // Third Query
      if (data[0][0].warranty_availed_date) {
        totalScansData = await db.promise().query(`
    SELECT scanned_at as event_date,
    "normal-scan" as event_name
    FROM total_qr_scans
    WHERE alphanumeric = ? and scanned_at <= ?;
`, [alphanumeric, data[0][0].warranty_availed_date]);
        warranty_event_data = await db.promise().query(`
SELECT 
  wad.created_on  AS event_date,
    
    
    "warranty-availed" as event_name,
    wad.id as transaction_id,
    wad.customer_id as customer_id,
    wad.name as customer_name,
    wad.email as customer_email,
    wad.IP_city as customer_city,
    wad.IP_state as customer_state,
    wad.IP_country as customer_country,
    wad.longitude,
    wad.latitude
    
FROM encoded_product ep

LEFT JOIN warranty_availed_data wad ON ep.alphanumeric = wad.alphanumeric where ep.alphanumeric=? and wad.company_id=?`, [alphanumeric, company_id]);

      }
      else {
        totalScansData = await db.promise().query(`
    SELECT scanned_at as event_date,
    "normal-scan" as event_name
    FROM total_qr_scans
    WHERE alphanumeric = ? ;
`, [alphanumeric]);
      }
      // console.log(warranty_event_data)
      const mergedEventData = [
        ...(printedEventData && printedEventData[0] ? printedEventData[0] : []),
        ...(redScansData && redScansData[0] ? redScansData[0] : []),
        ...(totalScansData && totalScansData[0] ? totalScansData[0] : []),
        ...(linked_to_master_data && linked_to_master_data[0] ? linked_to_master_data[0] : []),
        ...(dispatched_from_factory_data && dispatched_from_factory_data[0] ? dispatched_from_factory_data[0] : []),
        ...(warranty_event_data && warranty_event_data[0] ? warranty_event_data[0] : [])
      ];

      // Sort the array based on the event_date in ascending order
      mergedEventData.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

      // Now you have the results in variables: printedEventData, redScansData, totalScansData

      return { meta: data[0][0], timelineData: mergedEventData }

    } catch (err) {
      throw err
    }
  }

  getLogoByName(logo_name, company_id) {

    return new Promise((resolve, reject) => {
      if (!logo_name || (logo_name && !logo_name.trim())) {
        resolve({ value: { logo: logo_name }, errors: [{ error: "Logo is Required!" }] })
      }
      db.query(
        'select  * from company_logo where title=? and company_id=?',
        [logo_name, company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            if (!result || (result && result.length <= 0)) {
              resolve({ value: { logo: logo_name }, errors: [{ error: `Logo with title ${logo_name} doesn't exists!` }] })
            }
            console.log('ch' + result);
            return resolve({ value: { logo: logo_name, logo_data: result[0] }, errors: [] });
          }
        }
      );
    });

  }

  getCategoryByName(category_name, company_id) {

    return new Promise((resolve, reject) => {
      if (!category_name || (category_name && !category_name.trim())) {
        resolve({ error: "Category is Required!" })
      }
      db.query(
        'select  * from company_categories where title=? and business_id=?',
        [category_name, company_id],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            if (!result || (result && result.length <= 0)) {
              resolve({ "error": `Category with title ${category_name} doesn't exists!` })
            }
            console.log('ch' + result);
            return resolve({ data: result[0] });
          }
        }
      );
    });

  }

}




module.exports = CompanyRepository;
