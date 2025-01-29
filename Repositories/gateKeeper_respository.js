const e = require('express');
const db = require('../Database_connection/db');
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
class GateKeeperRepository {
  Login(body) {
    return new Promise((resolve, reject) => {
      db.query(
        'select cu.* from company_user cu inner join business_user bu on cu.company_id=bu.business_id where cu.email=? and cu.is_deleted!=1 and bu.is_deleted!=1',
        [body.email],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length < 1) {
              return reject('User not registered!');
            } else {
              micro_service
                .VerifyPassword(result[0].password, body.password)
                .then(() => {

                  if(result&&result.length>0){
                    db.query('select display_name from company_details where business_id=?',[result[0].company_id],(err,result1)=>{
      
                      if(err){
                        return reject(err)
                      }
                      else{
                        if(result1&&result1.length>0){
                          result[0].company_name=result1[0].display_name
                          db.query('select factory_name from factory where id=?',[result[0].factory_id],(err,result2)=>{
                            if(err){
                              return reject(err)
      
                            }
                            else{
                              if(result2&&result2.length>0){
                                result[0].factory_name=result2[0].factory_name
                              }
                            }
                          })
                        }
                      }
                    })
                  }

                  return resolve(result);
                })
                .catch((err) => {
                  return reject(err);
                });
              // micro_service.HashPassword(body.password)
              // .then((hashedPassword)=>{
              //     console.log(hashedPassword)
              //     db.query("select * from company_user where email=? and password=?",[body.email,hashedPassword],(err,result1)=>{
              //         if(err){
              //             return reject(err);
              //         }
              //         else{
              //             if(result1.length<1){
              //                 return reject("Invalid credentials!");
              //             }
              //             else{
              //                 return resolve(result1);
              //             }
              //         }
              //     })
              // })
              // .catch((err)=>{
              //     return reject(err)
              // })
            }
          }
        }
      );
    });
  }

  getCompanyUserPassword(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT password from company_user where  id=? and is_deleted!=1',
        [id],
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

  doesCompanyUserExist(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'select id,name,company_id from company_user where email=? and is_deleted!=1',
        [email],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject('error');
          } else {
            if (result.length < 1) {
              return reject('User not registered!');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }

  updateCompanyUserPassword(id, new_password) {
    return new Promise((resolve, reject) => {
      micro_service
        .HashPassword(new_password)
        .then((password) => {
          db.query(
            'update company_user set password=? where id=?',
            [password, id],
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
  Identity(user_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from company_user where id=?',
        [user_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if(result&&result.length>0){
              db.query('select display_name from company_details where business_id=?',[result[0].company_id],(err,result1)=>{

                if(err){
                  return reject(err)
                }
                else{
                  if(result1&&result1.length>0){
                    result[0].company_name=result1[0].display_name
                    db.query('select factory_name from factory where id=?',[result[0].factory_id],(err,result2)=>{
                      if(err){
                        return reject(err)

                      }
                      else{
                        if(result2&&result2.length>0){
                          result[0].factory_name=result2[0].factory_name
                        }
                      }
                    })
                  }
                }
              })
            }
            return resolve(result);
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
  GetMasterQRContents(alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'select alphanumeric from master_QR_data where master_QR_id in(select id from master_QR where alphanumeric=?)',
        [alphanumeric],
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
  RegisterTransaction(user_id, body) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into gateKeeper_transactions(gateKeeper_id,transaction_timestamp,shipped_to,bill_number,vehicle_number) values (?,?,?,?,?)',
        [
          user_id,
          new Date(),
          body.shipped_to,
          body.bill_number,
          body.vehicle_number,
        ],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            db.query(
              'select transaction_id from gateKeeper_transactions where gateKeeper_id=? order by transaction_id desc limit 1',
              [user_id],
              (err, result2) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve(result2[0].transaction_id);
                }
              }
            );
          }
        }
      );
    });
  }
  TransactionDataEntry(transaction_id, data) {
    return new Promise((resolve, reject) => {
      console.log(data)
      for (let i = 0; i < data.length; i++) {
        db.query(
          'insert into gateKeeper_transaction_data(transaction_id,alphanumeric) values (?,?)',
          [transaction_id, data[i].alphanumeric],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
              db.query(
                'update encoded_product set dispatched_from_factory=? where alphanumeric=?',
                [new Date(), data[i].alphanumeric],
                (err, result2) => {
                  if (err) {
                    return reject(err);
                  } else {
                    if (i == data.length - 1) {
                      return resolve();
                    }
                  }
                }
              );
              // if(i==data.length-1){
              //     return resolve()
              // }
            }
          }
        );
      }
    });
  }
  UpdateEncodedProduct(data) {
    return new Promise((resolve, reject) => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        db.query(
          "update encoded_product set status='In transit' where alphanumeric=?",
          [data[i].alphanumeric],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            } else {
              console.log(data[i]);
              console.log(i);
              if (i == data.length - 1) {
                return resolve();
              }
            }
          }
        );
      }
    });
  }
  ScanQR(gateKeeper_id, body, alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into gateKeeper_buffer(gateKeeper_id,alphanumeric,timestamp) values (?,?,?)',
        [gateKeeper_id, alphanumeric, new Date()],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (alphanumeric[0] == 'M' && alphanumeric[1] == '-') {
              db.query(
                'select serial_number from master_QR where alphanumeric in(select alphanumeric from gateKeeper_buffer where gateKeeper_id=?)',
                [gateKeeper_id],
                (err, result2) => {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve(result2);
                  }
                }
              );
            } else {
              db.query(
                'select g.id,g.timestamp, e.serial_number from gateKeeper_buffer g, encoded_product e where e.alphanumeric=g.alphanumeric and e.alphanumeric in(select alphanumeric from gateKeeper_buffer where gateKeeper_id=?)',
                [gateKeeper_id],
                (err, result2) => {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve(result2);
                  }
                }
              );
            }
          }
        }
      );
    });
  }
  CheckGateKeeperBuffer(alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from gateKeeper_buffer where alphanumeric=?',
        [alphanumeric],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length == 0) {
              if (alphanumeric[0] == 'M' && alphanumeric[1] == '-') {
                console.log('yes');
                db.query(
                  'select is_scanned from master_QR where alphanumeric=?',
                  [alphanumeric],
                  (err, result3) => {
                    if (err) {
                      return reject(err);
                    } else {
                      console.log(result3);
                      if (result3[0].is_scanned == 0) {
                        return resolve();
                      } else {
                        return reject('Master QR already in transit');
                      }
                    }
                  }
                );
              } else {
                db.query(
                  'select * from gateKeeper_transaction_data where alphanumeric=?',
                  [alphanumeric],
                  (err, result2) => {
                    if (err) {
                      return reject(err);
                    } else {
                      if (result2.length == 0) {
                        return resolve();
                      } else {
                        return reject('QR already in transit');
                      }
                    }
                  }
                );
              }
            } else {
              return reject('QR already scanned');
            }
          }
        }
      );
    });
  }
  FetchGateKeeperBuffer(gateKeeper_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select g.id,g.timestamp, e.serial_number from gateKeeper_buffer g, encoded_product e where e.alphanumeric=g.alphanumeric and e.alphanumeric in(select alphanumeric from gateKeeper_buffer where gateKeeper_id=?)',
        [gateKeeper_id],
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
  DeleteQR(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from gateKeeper_buffer where id=?',
        [id],
        (err, result1) => {
          if (err) {
            return reject(err);
          } else {
            return resolve();
          }
        }
      );
    });
  }
  ClearBuffer(gateKeeper_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from gateKeeper_buffer where gateKeeper_id=?',
        [gateKeeper_id],
        (err, result1) => {
          if (err) {
            return reject(err);
          } else {
            return resolve();
          }
        }
      );
    });
  }
  GetGateKeeperBuffer(gateKeeper_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select alphanumeric from gateKeeper_buffer where gateKeeper_id=?',
        [gateKeeper_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length == 0) {
              return reject('Buffer empty');
            } else {
              return resolve(result);
            }
          }
        }
      );
    });
  }

  UpdateMasterQRStatus(alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'update master_QR set is_scanned=1 where alphanumeric=?',
        [alphanumeric],
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
}

module.exports = GateKeeperRepository;
