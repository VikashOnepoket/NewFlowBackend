const QRCode = require('qrcode');
const db = require('../Database_connection/db');
const fs = require('fs');
const PDFDocument = require('pdfkit');
var random = require('random-string-alphanumeric-generator');
const { resolve } = require('path');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP';
const JWT_VALIDITY = '7d';
const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();
const util = require('util');
const dbQuery = util.promisify(db.query);
class OperatorRepository {
  alphanumeric = async (
    quantity,
    serial_no,
    factory_operator_id,
    product_id,
    dynamic_qr
  ) => {
    try {
      //   const regex_only_char = '^[a-zA-Z]+$';
      const regex_allowed_characters = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

      console.log(serial_no);
      //   console.log(serial_no.match(regex_only_char));
      if (serial_no.match(regex_allowed_characters) == null) {
        // return reject('Invalid serial number');
        throw new Error(
          'Invalid Serial Number! Input must start with a letter or number, and can only contain letters, numbers, hyphens, and underscores.'
        );
      }
      let regex;
      let numeric = [];
      const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
      const last_char = serial_no[serial_no.length - 1];
      const first_char = serial_no[0];
      if (!isNaN(serial_no)) {
        numeric[1] = '';
        numeric[2] = serial_no;
      } else if (isNaN(last_char)) {
        numeric[1] = serial_no;
        numeric[2] = 1;
      }
      //   if (serial_no.includes('-')) {
      //     regex = /([^-]+)-*(\d+)$/;
      //     regex = /^([^-]+)-*(\d+)$/;

      //     numeric = serial_no.match(regex);
      //     console.log(numeric);
      //     // console.log(numeric[2] + 'numeric1j1');
      //     if (!numeric || numeric[2] == null || !numeric[2]) {
      //       console.log('hi');
      //       numeric = [];
      //       numeric[1] = serial_no;

      //       numeric[2] = 0;
      //     } else {
      //       numeric[1] = numeric[1] + '-';
      //     }
      //     console.log(numeric[2] + 'numeric2');
      //     console.log(regex_zero.exec(numeric[2]));

      //     let count = regex_zero.exec(serial_no)[0].length;
      //     console.log('count' + count);
      //     while (count > 0) {
      //       console.log(count);
      //       numeric[1] = numeric[1] + '0';
      //       count--;
      //     }
      // else if (isNaN(first_char)) {
      //   regex = /(\D*)(\d+)/;
      //   numeric = serial_no.match(regex);
      //   console.log(numeric + 'nan');
      //   if (numeric == null) {
      //     numeric = [];
      //     numeric[1] = serial_no;
      //     numeric[2] = 0;
      //   }
      //   //   }

      //   let count = regex_zero.exec(numeric[2])[0].length;
      //   console.log(count);
      //   while (count > 0) {
      //     numeric[1] = numeric[1] + '0';
      //     count--;
      //   }
      // }
      else {
        // regex = /(\d+)*(\D*)(\d+)/;

        // const regex = /[^0-9]+(\d+)$/;
        // const regex = /([^0-9]+)(\d+)$/;
        const regex = /^(.*[^0-9])(\d+)$/;

        numeric = serial_no.match(regex);
        console.log(numeric + 'nan');

        if (numeric == null) {
          numeric = [];
          numeric[1] = serial_no;
          numeric[2] = 0;
        } else {
          //   const t = numeric[1];
          numeric[1] = numeric[1];
          //   numeric[2] = t;
        }
        //   }

        let count = regex_zero.exec(numeric[2])[0].length;
        console.log(count);
        while (count > 0) {
          numeric[1] = numeric[1] + '0';
          count--;
        }
      }
      //   else {
      //     let numeric = serial_no.match(regex);

      //     console.log(numeric + 'nan');

      //     if (numeric == undefined || numeric == null) {
      //       // If no match is found, assume the entire string is non-digit characters.
      //       numeric = ['', serial_no, 0];
      //     }

      //     let count = regex_zero.exec(numeric[2])[0].length;
      //     console.log(count);

      //     while (count > 0) {
      //       numeric[1] = numeric[1] + '0';
      //       count--;
      //     }

      //     // Assuming you want to increment the numeric part
      //     numeric[2] = parseInt(numeric[2]) + 1;

      //     // If the original serial_no did not end with a digit, append '0' before incrementing
      //     if (numeric[1].length > 0 && !/\d$/.test(serial_no)) {
      //       numeric[2] = '01'; // Starting with '01' if the original string didn't end with a digit
      //     }
      //     console.log('Modified Serial No:', numeric[1] + numeric[2]);
      //   }

      const result2 = await new Promise((resolve, reject) => {
        db.query(
          'select id from QR order by id desc limit 1',
          (err, result) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      const starting_id = result2[0].id;

      let j = 0;

      const promises = [];

      let QRImageData = [];
      let encodedProductInsertionData = [];
      let QRInsertionData = [];
      for (let j = 0; j < quantity; j++) {
        let serial_number, serial;
        if (numeric != null) {
          serial_number = parseInt(numeric[2]) + j;
          if (
            numeric[1].charAt(numeric[1].length - 1) === '0' &&
            (serial_number == 10 ||
              serial_number == 100 ||
              serial_number == 1000)
          ) {
            numeric[1] = numeric[1].slice(0, -1);
          }
          serial = numeric[1] + serial_number;
        } else {
          let strLength = serial_no.length;
          if (strLength > 8) {
            let p1 = serial_no.slice(0, strLength - 4);
            let p2 = serial_no.slice(strLength - 4, strLength);
            serial = p1 + (parseInt(p2) + j - 1).toString();
          } else {
            serial = parseInt(serial_no) + j;
          }
        }
        let alpha = random.randomAlphanumeric(10);
        let warranty = "unavailed";
        encodedProductInsertionData.push([
          alpha,
          product_id,
          serial.toString(),
          new Date(),
          factory_operator_id,
          warranty,
          dynamic_qr
        ]);
        let {filename,shortUrl} = await micro_service.GenerateQR(alpha);
        QRInsertionData.push([
          product_id,
          filename,
          factory_operator_id,
          serial,
        ]);
        QRImageData.push({
          qr_image: filename,
          shortUrl:shortUrl,
          serial_number: serial,
        });
      }

      // const encodedProductQuery =
      //   'INSERT INTO encoded_product (alphanumeric, product_id, serial_number, print, factory_operator_id) VALUES ?';
      // const qrQuery =
      //   'INSERT INTO QR (product_id, qr_image, factory_operator_id, serial_number) VALUES ?';
      // await Promise.all([
      //   new Promise((resolve, reject) => {
      //     db.query(
      //       encodedProductQuery,
      //       [encodedProductInsertionData],
      //       (err, result) => {
      //         if (err) {
      //           reject(err);
      //         } else {
      //           resolve(result);
      //         }
      //       }
      //     );
      //   }),
      //   new Promise((resolve, reject) => {
      //     db.query(qrQuery, [QRInsertionData], (err, result) => {
      //       if (err) {
      //         reject(err);
      //       } else {
      //         resolve(result);
      //       }
      //     });
      //   }),
      // ]);

      // changes made by vikash in encoded_product to lp_encoded_product and qr to lp_qr
      const encodedProductQuery =
        'INSERT INTO lp_encoded_product (alphanumeric, product_id, serial_number, print, factory_operator_id, warranty, dynamic_qr) VALUES ?';
      const qrQuery =
        'INSERT INTO lp_qr (product_id, qr_image, factory_operator_id, serial_number) VALUES ?';
      await Promise.all([
        new Promise((resolve, reject) => {
          db.query(
            encodedProductQuery,
            [encodedProductInsertionData],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        }),
        new Promise((resolve, reject) => {
          db.query(qrQuery, [QRInsertionData], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        }),
      ]);
      return QRImageData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  SortQRImages(QRImagesUnsorted) {
    return new Promise((resolve, reject) => {
      let regex, numeric;
      for (let obj of QRImagesUnsorted) {
        let serial_no = obj.serial_number;
        const first_char = serial_no[0];
        if (!isNaN(serial_no)) {
          obj.sequence = parseInt(serial_no);
        } else {
          //   regex = /(\D*)(\d+)/;
          const regex = /^(.*[^0-9])(\d+)$/;

          numeric = serial_no.match(regex);
          console.log('nssjk' + numeric);

          obj.sequence = parseInt(numeric[2]);
        }
        console.log(obj);
      }
      QRImagesUnsorted.sort((a, b) => {
        return a.sequence - b.sequence;
      });
      return resolve(QRImagesUnsorted);
    });
  }
  GetQrImages(starting_id) {
    return new Promise((resolve, reject) => {
      console.log('qr img');
      db.query(
        'select qr_image,serial_number from QR where id>? order by serial_number',
        [starting_id],
        (err, result2) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            let regex, numeric;
            for (let obj of result2) {
              let serial_no = obj.serial_number;
              if (serial_no.includes('-')) {
                regex = /([^-]+)-(\d+)$/;
                numeric = serial_no.match(regex);
                obj.sequence = parseInt(numeric[2]);
              } else {
                regex = /(\D+)(\d+)/;
                numeric = serial_no.match(regex);
                obj.sequence = parseInt(numeric[2]);
              }
            }
            result2.sort((a, b) => {
              return a.sequence - b.sequence;
            });
            return resolve(result2);
          }
        }
      );
    });

    // select e.alphanumeric,q.qr_image,q.serial_number from encoded_product e, QR q where q.serial_number=e.serial_number and q.id>?
  }

  // Createpdf(result2,QR_copies){
  //     return new Promise((resolve,reject)=>{
  //         console.log("pdf called")
  //         const doc = new PDFDocument({size:'A6'});
  //         let alpha = 'P_pdf-'+random.randomAlphanumeric(5);
  //         let name = alpha + '.pdf'
  //         for (let j = 0; j < result2.length; j++) {

  //             for(let copy=0;copy<QR_copies;copy++){
  //                 let target = result2[j].qr_image
  //                 doc.image(target,{
  //                     width: 200,
  //                     height: 200
  //                 })

  //                 let serial_number = result2[j].serial_number

  //                 doc.text(serial_number,110,270)

  //                 if((j==result2.length-1)&&(copy==QR_copies-1)){
  //                     console.log(j)
  //                     doc.end()
  //                     return resolve(pdfUrl)
  //                 }
  //                 else {
  //                     doc.addPage();
  //                 }
  //             }
  //         }
  //     })
  // }
  SaveFactoryOperatorActionHistory(
    quantity,
    serial_no,
    factory_operator_id,
    product_id,
    QR_copies,
    QR_size,
    last_serial_no,
    last_template_id
  ) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into factory_operator_action_history(business_id,product_id,serial_number,quantity,QR_copies,QR_size,last_serial_no,last_template_id) values (?,?,?,?,?,?,?,?)',
        [
          factory_operator_id,
          product_id,
          serial_no,
          quantity,
          QR_copies,
          null,
          last_serial_no,
          last_template_id,
        ],
        (err, result) => {
          if (err) {
            console.log(err, );
            // reject(err) vikash_qr;
            return resolve();
          } else {
            return resolve();
          }
        }
      );
    });
  }
  // GetFactoryOperatorActionHistory(factory_operator_id, product_id) {
  //   return new Promise((resolve, reject) => {
  //     let sql;
  //     // product_id = product_id + '';
  //     if (product_id && product_id.trim() != null) {
  //       sql = `select * from factory_operator_action_history where  product_id=${product_id} order by id desc limit 1`;
  //     } else {
  //       // sql = `select * from factory_operator_action_history where product_id in (select product_id from factory_operator_action_history where  business_id=${factory_operator_id} order by id desc limit 1) order by id desc limit 1`;
  //       sql = `SELECT *
  //    FROM factory_operator_action_history AS foah
  //    JOIN (
  //        SELECT product_id
  //        FROM factory_operator_action_history
  //        WHERE business_id = ${factory_operator_id}
  //        ORDER BY id DESC
  //        LIMIT 1
  //    ) AS subquery
  //    ON foah.product_id = subquery.product_id
  //    ORDER BY foah.id DESC
  //    LIMIT 1;`;
  //     }
  //     db.query(sql, (err, result) => {
  //       if (err) {
  //         console.log(err);
  //         reject(err);
  //       } else {
  //         if (result.length < 1) {
  //           return resolve('No data available');
  //         } else {
  //           //console.log(result);
  //           let serial = result[0].last_serial_no;
  //           if (serial) {
  //             // const regex = /(\D+)(\d+)/;
  //             // let match = serial.match(regex);
  //             let regex;
  //             let match;
  //             if (!isNaN(serial)) {
  //               result[0].serial_number = parseInt(serial) + 1;
  //             }
  //             // const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
  //             // const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
  //             else {
  //               regex = /^(.*[^0-9])(\d+)$/;

  //               // numeric = serial.match(regex);

  //               // if (serial.includes('-')) {
  //               //   regex = /([^-]+)-(\d+)$/;
  //               //   match = serial.match(regex);
  //               //   match[1] = match[1] + '-';
  //               //   let count = regex_zero.exec(match[2])[0].length;
  //               //   while (count > 0) {
  //               //     match[1] = match[1] + '0';
  //               //     count--;
  //               //   }
  //               // }
  //               //  else {
  //               // regex = /(\D+)(\d+)/;
  //               match = serial.match(regex);

  //               result[0].serial_number =
  //                 match[1] + '' + (parseInt(match[2]) + 1);
  //             }
  //           } else {
  //             result[0].serial_number = 'ABC123';
  //           }
  //           // }
  //           // if (match != null) {
  //           //   let numeric_serial =
  //           //     parseInt(match[2]) + parseInt(result[0].quantity);
  //           //   result[0].serial_number = match[1] + numeric_serial;
  //           //   resolve(result);
  //           // } else {
  //           //   result[0].serial_number =
  //           //     parseInt(serial) + parseInt(result[0].quantity);
  //           resolve(result);
  //           // }
  //         }
  //       }
  //     });
  //   });
  // }

  GetFactoryOperatorActionHistory(factory_operator_id, product_id) {
    return new Promise((resolve, reject) => {
      let sql;
      if (product_id && product_id.trim() != null) {
        sql = `select * from factory_operator_action_history where  product_id=${product_id} order by id desc limit 1`;
      } else {
        sql = `SELECT *
     FROM factory_operator_action_history AS foah
     JOIN (
         SELECT product_id
         FROM factory_operator_action_history
         WHERE business_id = ${factory_operator_id}
         ORDER BY id DESC
         LIMIT 1
     ) AS subquery
     ON foah.product_id = subquery.product_id
     ORDER BY foah.id DESC
     LIMIT 1;`;
      }
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          if (result.length < 1) {
            return resolve('No data available');
          } else {
            //console.log(result);
            let serial = result[0].last_serial_no;
            if (serial) {
              // const regex = /(\D+)(\d+)/;
              // let match = serial.match(regex);
              let regex;
              let match;
              if (!isNaN(serial)) {
                result[0].serial_number = parseInt(serial) + 1;
              }
              // const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
              // const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
              else {
                regex = /^(.*[^0-9])(\d+)$/;

                // numeric = serial.match(regex);

                // if (serial.includes('-')) {
                //   regex = /([^-]+)-(\d+)$/;
                //   match = serial.match(regex);
                //   match[1] = match[1] + '-';
                //   let count = regex_zero.exec(match[2])[0].length;
                //   while (count > 0) {
                //     match[1] = match[1] + '0';
                //     count--;
                //   }
                // }
                //  else {
                // regex = /(\D+)(\d+)/;
                match = serial.match(regex);

                result[0].serial_number =
                  match[1] + '' + (parseInt(match[2]) + 1);
              }
            } else {
              result[0].serial_number = 'ABC123';
            }
            // }
            // if (match != null) {
            //   let numeric_serial =
            //     parseInt(match[2]) + parseInt(result[0].quantity);
            //   result[0].serial_number = match[1] + numeric_serial;
            //   resolve(result);
            // } else {
            //   result[0].serial_number =
            //     parseInt(serial) + parseInt(result[0].quantity);
            resolve(result);
            // }
          }
        }
      });
    });
  }

  SavePdf(serial_number, quantity, pdfUrl, factory_operator_id, template_id) {
    return new Promise((resolve, reject) => {
      let current_dateTime = new Date();
      db.query(
        'insert into factory_operator_QR_history(created_on,starting_serial_number,quantity,pdf_link,business_id,template_id) values (?,?,?,?,?,?)',
        [
          current_dateTime,
          serial_number,
          quantity,
          pdfUrl,
          factory_operator_id,
          template_id,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            // reject(err); vikash_qr
            // return resolve(result);
            return resolve(result);

          } else {
            return resolve(result);
          }
        }
      );
    });
  }
  PdfHistory(factory_operator_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from factory_operator_QR_history where business_id=? order by id desc',
        [factory_operator_id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
  ProductPurchaseOptions(product_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select title, link from lp_purchase_options where product_id=?',
        [product_id],
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
  GetLastMasterQRId() {
    return new Promise((resolve, reject) => {
      db.query(
        'select id from master_QR order by id desc limit 1',
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            if (result.length < 1) {
              return resolve(1);
            } else {
              return resolve(result[0].id);
            }
          }
        }
      );
    });
  }
  SaveMasterQR = async (quantity, serial_no, gateKeeper_id) => {
    // return new Promise((resolve,reject)=>{
    try {
      let QRImageData = [];
      const promises = [];

      const regex_allowed_characters = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

      console.log(serial_no);
      //   console.log(serial_no.match(regex_only_char));
      if (serial_no.match(regex_allowed_characters) == null) {
        // return reject('Invalid serial number');
        throw new Error(
          'Invalid Serial Number! Input must start with a letter or number, and can only contain letters, numbers, hyphens, and underscores.'
        );
      }
      let regex;
      let numeric = [];
      const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
      const last_char = serial_no[serial_no.length - 1];
      const first_char = serial_no[0];
      if (!isNaN(serial_no)) {
        numeric[1] = '';
        numeric[2] = serial_no;
      } else if (isNaN(last_char)) {
        numeric[1] = serial_no;
        numeric[2] = 1;
      }
      // } else if (isNaN(first_char)) {
      //   regex = /(\D*)(\d+)/;
      //   numeric = serial_no.match(regex);
      //   console.log(numeric + 'nan');
      //   if (numeric == null) {
      //     numeric = [];
      //     numeric[1] = serial_no;
      //     numeric[2] = 0;
      //   }
      //   //   }

      //   let count = regex_zero.exec(numeric[2])[0].length;
      //   console.log(count);
      //   while (count > 0) {
      //     numeric[1] = numeric[1] + '0';
      //     count--;
      //   }
      // }
      else {
        // regex = /(\d+)(\D*)(\d+)/;
        // numeric = serial_no.match(regex);
        // console.log(numeric + 'nan');

        // if (numeric == null) {
        //   numeric = [];
        //   numeric[1] = serial_no;
        //   numeric[2] = 0;
        // } else {
        //   numeric[1] = numeric[1] + numeric[2];
        //   numeric[2] = numeric[3];
        // }
        // //   }

        const regex = /^(.*[^0-9])(\d+)$/;

        numeric = serial_no.match(regex);
        console.log(numeric + 'nan');

        if (numeric == null) {
          numeric = [];
          numeric[1] = serial_no;
          numeric[2] = 0;
        } else {
          //   const t = numeric[1];
          numeric[1] = numeric[1];
          //   numeric[2] = t;
        }
        let count = regex_zero.exec(numeric[2])[0].length;
        console.log(count);
        while (count > 0) {
          numeric[1] = numeric[1] + '0';
          count--;
        }
      }

      //   const regex_only_char = '^[a-zA-Z]+$';
      //   if (serial_no.match(regex_only_char) != null) {
      //     return reject('Invalid serial number');
      //   }
      //   let regex;
      //   let numeric;
      //   const regex_zero = /^0*(?=([1-9]\d*|0)$)/;
      //   if (serial_no.includes('-')) {
      //     regex = /([^-]+)-(\d+)$/;
      //     numeric = serial_no.match(regex);
      //     numeric[1] = numeric[1] + '-';
      //     let count = regex_zero.exec(numeric[2])[0].length;
      //     while (count > 0) {
      //       numeric[1] = numeric[1] + '0';
      //       count--;
      //     }
      //   } else {
      //     regex = /(\D+)(\d+)/;
      //     numeric = serial_no.match(regex);
      //     let count = regex_zero.exec(numeric[2])[0].length;
      //     while (count > 0) {
      //       numeric[1] = numeric[1] + '0';
      //       count--;
      //     }
      //   }

      for (let i = 0; i < quantity; i++) {
        // const regex_only_char = '^[a-zA-Z]+$';
        // if (serial_no.match(regex_only_char) != null) {
        //   return reject('Invalid serial number');
        // }
        let serial_number, serial;
        if (numeric != null) {
          serial_number = parseInt(numeric[2]) + i;
          if (
            numeric[1].charAt(numeric[1].length - 1) === '0' &&
            (serial_number == 10 ||
              serial_number == 100 ||
              serial_number == 1000)
          ) {
            numeric[1] = numeric[1].slice(0, -1);
          }
          serial = numeric[1] + serial_number;
        } else {
          let strLength = serial_no.length;
          if (strLength > 8) {
            let p1 = serial_no.slice(0, strLength - 4);
            let p2 = serial_no.slice(strLength - 4, strLength);
            serial = p1 + (parseInt(p2) + i - 1).toString();
          } else {
            serial = parseInt(serial_no) + i;
          }
        }
        console.log(i);
        let promise = new Promise((resolve, reject) => {
          micro_service
            .GenerateMasterQR()
            .then(({ filename, alpha }) => {
              console.log(filename);
              db.query(
                'insert into master_QR(gateKeeper_id,qr_image,serial_number,alphanumeric) values (?,?,?,?)',
                [gateKeeper_id, filename, serial.toString(), alpha],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    QRImageData.push({
                      qr_image: filename,
                      serial_number: serial,
                    });
                    resolve(result);
                    // if(i==quantity-1){
                    //     return resolve(QRImageData)
                    // }
                  }
                }
              );
            })
            .catch((err) => {
              return reject(err);
            });
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      return QRImageData;
      // })
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  GetDefaultMasterQRSerial() {
    return new Promise((resolve, reject) => {
      db.query(
        'select serial_no from master_QR_default_serial order by id desc limit 1',
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result[0].serial_no);
          }
        }
      );
    });
  }
  GetMasterQR(starting_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select qr_image from master_QR where id>?',
        [starting_id],
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
  CustomQR(quantity) {
    return new Promise((resolve, reject) => {
      db.query(
        'select qr_image,serial_number from QR order by id desc limit ?',
        [parseInt(quantity)],
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
  GetProductId(alphanumeric) {
    return new Promise((resolve, reject) => {
      //'select product_id from encoded_product where alphanumeric=?', by Vikash

      db.query(
        'select product_id from lp_encoded_product where alphanumeric=?',
        [alphanumeric],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            return resolve(result[0].product_id);
          }
        }
      );
    });
  }
  LoadFactoryOperator(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from factory_operator where id=?',
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            let user = {
              id: result[0].id,
              name: result[0].name,
              factory_id: result[0].factory_id,
              email: result[0].email,
              company_id: result[0].company_id,
              factory_name: result[0].factory_name,
            };
            return resolve(user);
          }
        }
      );
    });
  }

  HardDeleteCompanyUserDetails = async (id) => {
    try {
      console.log(id)
      const result = await db
        .promise()
        .query(
          'delete from factory_operator_action_history WHERE business_id=?',
          [id]
        );
   
  

        // const logoResult=await db.promise().query()
      
      

       
      const result2 = await db
        .promise()
        .query('delete from factory_operator_QR_history WHERE business_id=?', [id]);
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
        .query('DELETE FROM gateKeeper_buffer WHERE gateKeeper_id = ?', [id]);
    

      const result4 = await db
        .promise()
        .query('DELETE FROM gateKeeper_transaction_data WHERE transaction_id IN (SELECT transaction_id FROM gateKeeper_transactions WHERE gateKeeper_id = ?)', [id]);

    
      // res.send(result)

      const result5 = await db
        .promise()
        .query(
      'delete from product_purchase_options where product_id=? ',  [id] );
     console.log("pur")
      // res.send(result)

      const result6 = await db
        .promise()
        .query('DELETE FROM gateKeeper_transactions WHERE gateKeeper_id = ?', [id]);
        console.log("gtrans")

      // res.send(result)

      const result7 = await db
        .promise()
        .query(
          'DELETE FROM master_QR WHERE gateKeeper_id = ?',
          [id]
        );
        console.log("masterqr")
       
      // console.log(result6);
      // if (result7.length == 0) {
      //   result[0].warranty_registered = 'Warranty not registered';
      // } else {
      //   result[0].warranty_registered = result6[0].warranty_registered;
      // }

      const result8 = await db
        .promise()
        .query('DELETE FROM master_QR_data WHERE master_QR_id IN (SELECT id FROM master_QR WHERE gateKeeper_id = ?)', [id]);
      console.log(result8 + 'r8');

      const result9 = await db
      .promise()
      .query('DELETE FROM packer_buffer WHERE packer_id = ?  ', [id]);
      console.log("r9")
      const result10 = await db
      .promise()
      .query('DELETE FROM packer_Master_QR_buffer WHERE packer_id = ?', [id]);

      const result11 = await db
      .promise()
      .query('DELETE FROM packer_transaction_data WHERE transaction_id IN (SELECT transaction_id FROM packer_transactions WHERE packer_id = ?)', [id]);
      // if (result8) return result[0][0];
      const result12 = await db
      .promise()
      .query('DELETE FROM packer_transactions WHERE packer_id = ?', [id]);
      const result13=await db.promise().query('DELETE from user_access WHERE user_id=?',[id])
      console.log("r13")
      const result17 = await db
      .promise()
      .query(
        'DELETE FROM encoded_product WHERE factory_operator_id = ?',
        [id]
      );
      const result14=await db.promise().query('DELETE FROM company_user WHERE id = ?',[id])
      return 
    } catch (err) {
      throw new Error(err);
    }
  };
}
module.exports = OperatorRepository;
