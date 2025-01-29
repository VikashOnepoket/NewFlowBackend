const e = require('express');
const db = require('../Database_connection/db');

class PackerRepository {
  CheckProductQR(alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from packer_buffer where alphanumeric=?',
        [alphanumeric],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length == 0) {
              db.query(
                'select * from master_QR_data where alphanumeric=?',
                [alphanumeric],
                (err, result2) => {
                  if (err) {
                    return reject(err);
                  } else {
                    if (result2.length == 0) {
                      return resolve();
                    } else {
                      return reject('QR already linked.');
                    }
                  }
                }
              );
            } else {
              return reject('QR already scanned');
            }
          }
        }
      );
    });
  }
  CheckMasterQR(alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from master_QR_data where master_QR_id in(select id from master_QR where alphanumeric=?)',
        [alphanumeric],
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            if (result2.length == 0) {
              return resolve();
            } else {
              return reject('QR already linked.');
            }
          }
        }
      );
    });
  }
  UpdateBuffer(packer_id, alphanumeric) {
    console.log(alphanumeric + 'hiaiaabhi');
    return new Promise((resolve, reject) => {
      if (alphanumeric[0] == 'M' && alphanumeric[1] == '-') {
        return reject('Not a product QR.');
      } else {
        db.query(
          'insert into packer_buffer(packer_id,alphanumeric,timestamp) values(?,?,?)',
          [packer_id, alphanumeric, new Date()],
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
    });
  }
  BufferHistory(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select g.id,g.timestamp, e.serial_number from packer_buffer g, encoded_product e where e.alphanumeric=g.alphanumeric and e.alphanumeric in(select alphanumeric from packer_buffer where packer_id=?)',
        [packer_id],
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
  GetBuffer(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from packer_buffer where packer_id=?',
        [packer_id],
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
  ResolveBuffer(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from packer_buffer where packer_id=?',
        [packer_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log('i resks');
            return resolve();
          }
        }
      );
    });
  }
  Dispatch(packer_id, result) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into packer_transactions(packer_id,transaction_date) values (?,?)',
        [packer_id, new Date()],
        (err, result1) => {
          if (err) {
            return reject(err);
          } else {
            db.query(
              'select transaction_id from packer_transactions where packer_id=? order by transaction_id desc limit 1',
              [packer_id],
              (err, result2) => {
                if (err) {
                  return reject(err);
                } else {
                  let transaction_id = result2[0].transaction_id;
                  for (let i = 0; i < result.length; i++) {
                    db.query(
                      'insert into packer_transactions_data(transaction_id,alphanumeric) values (?,?)',
                      [transaction_id, result[i].alphanumeric],
                      (err, result3) => {
                        if (err) {
                          return reject(err);
                        } else {
                        }
                      }
                    );
                    if (i == result.length - 1) {
                      return resolve();
                    }
                  }
                }
              }
            );
          }
        }
      );
    });
  }
  UpdateEncodedProduct(result) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < result.length; i++) {
        db.query(
          "update encoded_product set status='Ready to be dispatched' where alphanumeric=?",
          [result[i].alphanumeric],
          (err, result) => {
            if (err) {
              return reject(err);
            } else {
            }
          }
        );
        if (i == result.length - 1) {
          return resolve();
        }
      }
    });
  }

  GetMasterQRData(master_QR_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from master_QR_data where master_QR_id=?',
        [master_QR_id],
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
  GetMasterQRid(alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'select id from master_QR where alphanumeric=?',
        [alphanumeric],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result[0].id);
          }
        }
      );
    });
  }
  SaveMasterQRData(result, master_QR_id,user_id) {
    return new Promise((resolve, reject) => {
      console.log('SaveMasterQrData');
      for (let i = 0; i < result.length; i++) {
        console.log(result[i]);
        db.query(
          'insert into master_QR_data(alphanumeric,master_QR_id) values(?,?)',
          [result[i].alphanumeric, master_QR_id],
          (err, result1) => {
            if (err) {
              return reject(err);
            } else {
              console.log(result[i]);
              db.query(
                'update encoded_product set linked_to_master=? , linked_to_master_by=? where alphanumeric=?',
                [new Date(),user_id ,result[i].alphanumeric],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                  }
                }
              );
            }
          }
        );
        if (i == result.length - 1) {
          return resolve();
        }
      }
    });
  }
  ScanMasterQR(packer_id, body, alphanumeric) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into packer_Master_QR_buffer(packer_id,alphanumeric,timestamp) values (?,?,?)',
        [packer_id, alphanumeric, new Date()],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            db.query(
              'select serial_number from master_QR where alphanumeric=?',
              [alphanumeric],
              (err, result2) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve(result2[0].serial_number);
                }
              }
            );
          }
        }
      );
    });
  }
  GetMasterAlphanumeric(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select alphanumeric from packer_Master_QR_buffer where packer_id=? order by id desc',
        [packer_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log(result);
            return resolve(result[0].alphanumeric);
          }
        }
      );
    });
  }
  ResolveMasterBuffer(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from packer_Master_QR_buffer where packer_id=?',
        [packer_id],
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
  CheckForExistingMasterQR(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from packer_Master_QR_buffer where packer_id=?',
        [packer_id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length > 0) {
              return resolve(true);
            } else {
              return resolve(false);
            }
          }
        }
      );
    });
  }
  RemoveQR(id) {
    return new Promise((resolve, reject) => {
      db.query('delete from packer_buffer where id=?', [id], (err, result) => {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
  }
  GetCurrentMasterQR(packer_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select serial_number from master_QR where alphanumeric in(select alphanumeric from packer_Master_QR_buffer where packer_id=?)',
        [packer_id],
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
}

module.exports = PackerRepository;
