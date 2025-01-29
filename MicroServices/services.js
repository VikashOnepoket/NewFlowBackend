const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
var random = require('random-string-alphanumeric-generator');
const QRCode = require('qrcode');
const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcrypt');
const { jsPDF } = require('jspdf');
const imageToUri = require('image-to-uri');
const axios = require('axios');
const excelToJson = require('convert-excel-to-json');

// const fs=require('fs')

const readXlsxFile = require('read-excel-file/node')

const msg91OTP = require('msg91-lib').msg91OTP;
const OTPRepo = require('../Repositories/otp_repository')
const otprepoobj = new OTPRepo()
const msg91otp = new msg91OTP({
  authKey: '388243AutttOTXECf63bc5788P1',
  templateId: '63bd363ed6fc0537b36cc522',
});
const sdk = require('api')('@msg91api/v5.0#6n91xmlhu4pcnz');
sdk.auth('388243AutttOTXECf63bc5788P1');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_VALIDITY = process.env.SESSION_TIMEOUT;
const schedule = require('node-schedule');
const { Console } = require('console');
const { resolve } = require('path');
// const AdminRepository = require('../Repositories/admin_repository');
// const adminRepoobj=new AdminRepository()
class Service {
  constructor() {
    AWS.config.update({
      accessKeyId: 'AKIAUNSBX7DTH6U3QP6D',
      secretAccessKey: 'oAgPWHc/ERqdt4XMZMz/aBW1wVgSlZVYza8BLSz6',
      region: 'Asia Pacific (Mumbai) ap-south-1',
    });
  }






  // Example usage
  // getAllDefaultConfigsAndSetEnv();

  generateOTP(maxLength) {

    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < maxLength; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  sendOTP = async (phone, type, test, sms_template_id) => {
    try {
      console.log(phone + "phon")

      if (!phone) {
        throw new Error("Phone Number Is Required!")
      }

      const OTP = this.generateOTP(4)

      console.log(OTP)
      const expireInOTP = (process.env.OTP_EXPIRATION / (1000 * 60))
      console.log(expireInOTP + "expire")
      const hashedOTP = await this.HashPassword(OTP)

      const saveOtp = await otprepoobj.saveNewOTP(hashedOTP, phone, expireInOTP, type)
      console.log(saveOtp + "sa")
      if (saveOtp) {

        phone = '91' + phone

        const options = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authkey: '388243AutttOTXECf63bc5788P1'
          }
        };



        const otpres = await axios.post(`https://control.msg91.com/api/v5/otp?template_id=${sms_template_id}&mobile=${phone}&otp=${OTP}`, {}, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authkey: '388243AutttOTXECf63bc5788P1'
          }
        })


        // const response =  await sdk.sendotp({template_id:"63bd363ed6fc0537b36cc522",
        // mobile:phone,
        // otp:OTP,
        // otp_expiry:expireInOTP

        // })
        console.log(otpres.data.type);
        console.log(otpres.data);

        if (otpres.data.type === 'success') {
          if (test) {
            return { message: "OTP Sent", resend_attempt_left: process.env.MAX_RESEND_OTP_COUNT - 1, wrong_OTP_attempts_left: process.env.MAX_UNSUCCESSFUL_OTP_ATTEMPT, otp: OTP }

          }
          return { message: "OTP Sent", resend_attempt_left: process.env.MAX_RESEND_OTP_COUNT - 1, wrong_OTP_attempts_left: process.env.MAX_UNSUCCESSFUL_OTP_ATTEMPT }
        }
        else {
          throw new Error(otpres.data.message)
        }
      }
      else {
        throw new Error("Unable to send OTP!")
      }




    }
    catch (err) { throw err }

  }

  resendOTP = async (phone, type, sms_template_id) => {
    try {
      console.log(phone + "phon")

      if (!phone) {
        throw new Error("Phone Number Is Required!")
      }
      const expireInOTP = (process.env.OTP_EXPIRATION / (1000 * 60))




      const phonenew = '91' + phone
      const otpData = await otprepoobj.fetchOTP(phone, type)
      if (otpData.resend_count >= process.env.MAX_RESEND_OTP_COUNT) {
        if (process.env.BLOCK_USER) {
          return ("Block User")
        }
        else {
          throw new Error("Max resend limit reached! please try again later.")
        }

      }
      //  if(otpData.expire_at<Date.now()){
      //   throw new Error("OTP Expired!")
      //  }
      //  if(otpData.status){
      //   throw new Error("OTP already Verified!")

      //  }

      // const options = {
      //   method: 'POST',
      //   headers: {
      //     accept: 'application/json',
      //     'content-type': 'application/json',
      //     authkey: '388243AutttOTXECf63bc5788P1'
      //   }
      // };

      // const otpres=await axios.post(`https://control.msg91.com/api/v5/otp/retry?retrytype=text&mobile=${phonenew}`,{}, {headers: {
      //   accept: 'application/json',
      //   'content-type': 'application/json',
      //   authkey: '388243AutttOTXECf63bc5788P1'
      // }})

      // const options = {
      //   method: 'POST',
      //   headers: {
      //     accept: 'application/json',
      //     'content-type': 'application/json',
      //     authkey: '388243AutttOTXECf63bc5788P1'
      //   }
      // };

      // const otpres=await axios.post(`https://control.msg91.com/api/v5/otp?template_id=63bd363ed6fc0537b36cc522&mobile=${phonenew}&otp=${OTP}`,{}, {headers: {
      //   accept: 'application/json',
      //   'content-type': 'application/json',
      //   authkey: '388243AutttOTXECf63bc5788P1'
      // }})


      // const response =  await sdk.sendotp({template_id:"63bd363ed6fc0537b36cc522",
      // mobile:phone,
      // otp:OTP,
      // otp_expiry:expireInOTP

      // })

      const resend = await this.sendOTP(phone, type, sms_template_id)

      console.log(otpData)
      if (resend.message === 'OTP Sent') {
        const updateOtp = await otprepoobj.updateOTPExpiration(phone, expireInOTP, type, otpData.resend_count + 1)
        return { message: "OTP Sent", resend_attempt_left: process.env.MAX_RESEND_OTP_COUNT - (otpData.resend_count + 1), wrong_OTP_attempts_left: parseInt(process.env.MAX_UNSUCCESSFUL_OTP_ATTEMPT) }
      }
      else {
        throw new Error("Unable To Send OTP!")
      }




    }
    catch (err) {
      console.log(err)
      throw err
    }

  }


  verifyOTP = async (phone, otp, type, send_otp_count) => {
    try {
      console.log(phone + "phon")

      if (!phone) {
        throw new Error("Phone Number Is Required!")
      }


      otp = `${otp}`
      const otpData = await otprepoobj.fetchOTP(phone, type)
      if (otpData.unsuccessful_attempt >= process.env.MAX_UNSUCCESSFUL_OTP_ATTEMPT || otpData.resend_count > process.env.MAX_RESEND_OTP_COUNT) {
        if (process.env.BLOCK_USER) {
          return ("Block User")
        }
        else {
          throw new Error("Wrong OTP entered too many times, please try again later.")
        }

      }

      const otp_match = await this.matchHashedOTP(otpData.otp, otp)

      if (!otp_match) {
        const updateOTPUnsuccessfulAttempts = await otprepoobj.updateOTPUnsuccessfulAttempts(phone, type)
        let error = new Error("Wrong OTP!")
        error.send_attempt_left = process.env.MAX_SEND_OTP_COUNT - send_otp_count
        error.resend_attempt_left = process.env.MAX_RESEND_OTP_COUNT - otpData.resend_count
        error.wrong_OTP_attempts_left = process.env.MAX_UNSUCCESSFUL_OTP_ATTEMPT - (otpData.unsuccessful_attempt + 1)

        throw error
      }
      if (otp_match) {
        if (otpData.status) {
          throw new Error("OTP already Verified!")


        }
      }
      if (otpData.is_expired) {
        throw new Error("OTP Expired!")
        throw new Error("OTP Expired!")
      }

      if (otpData.expire_at < Date.now()) {
        throw new Error("OTP Expired!")
      }

      else if (otp_match) {
        const updateOTPStatus = await otprepoobj.updateOTPStatus(phone, type)
        return ("OTP verified")
      }




      else {
        throw new Error("Wrong OTP!")
      }




      // const response =  await sdk.sendotp({template_id:"63bd363ed6fc0537b36cc522",
      // mobile:phone,
      // otp:OTP,
      // otp_expiry:expireInOTP






    }
    catch (err) {
      console.log(err)
      throw err
    }

  }

  convertExcelToJSON = (file_url) => {
    try {

      const result = excelToJson({
        sourceFile: file_url,
        header: {

          rows: 2 // 2, 3, 4, etc.
        },
        columnToKey: {
          'A': 'product_name',
          'B': 'product_model',
          'C': 'prod_description',
          'D': 'warranty_in_years',
          'E': 'warranty_in_months',
          'F': 'show_manufacture_date',
          'G': 'addition_detail_title',
          'H': 'addition_detail_desc',
          'I': 'store_name',
          'J': 'review_link',
          'K': 'video_link',
          'L': "product_desc_for_customer",
          'M': 'product_image',
          'N': 'categories',
          'O': 'logo',
          'P': 'installation_required',
        }
      });
      console.log(result)

      return (result.Sheet1)

    } catch (err) {
      console.log(err)
      throw err

    }
    // readXlsxFile(fs.createReadStream('OnePoketBulkProduct.xlsx')).then(( rows ) => {
    //     // console.log(error)
    //   console.log(rows)
    // })
  }


  VerifyJWT(token) {
    return new Promise((resolve, reject) => {
      var company_id;
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          console.log(err);
          return reject('Authentication failed');
        } else {
          company_id = decoded.userId;
          return resolve(company_id);
        }
      });
    });
  }

  VerifyCompanyJWT(token) {
    return new Promise((resolve, reject) => {
      var company_id;
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          console.log(err);
          return reject('Authentication failed');
        } else {
          // company_id = decoded.userId;
          return resolve(decoded);
        }
      });
    });
  }

  writeToLog(message, path) {
    const logFilePath = path;

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Create the log entry
    const logEntry = `[${timestamp}] ${message}\n`;

    // Append the log entry to the log file
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });

  }
  GetAphanumericfromShortendUrl = async (shortId) => {
    try {
      console.log(shortId);
      const data = await axios.get(`https://1pkt.in/originalUrl/${shortId}`);
      // console.log(data);
      if (data.data.originalUrl) {
        // console.log(originalUrl);
        const origArray = data.data.originalUrl.split('/');
        const len = origArray.length;
        const alpha_numeric = origArray[len - 1];
        console.log(alpha_numeric);
        return alpha_numeric;
      } else {
        console.log('not');
        throw new Error('unable to find alphanumeric shortened url');
      }
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  };
  VerifyCompanyUserJWT(token) {
    return new Promise((resolve, reject) => {
      var user_id;
      var user_access;
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          console.log(err + 'errr');
          return reject('Authentication failed');
        } else {
          user_id = decoded.userId;
          user_access = decoded.user_access;
          return resolve({ user_id, user_access });
        }
      });
    });
  }
  GenerateToken(user_id, expireIn) {
    return new Promise((resolve, reject) => {
      var accessToken = jwt.sign({ userId: user_id }, JWT_SECRET, {
        expiresIn: expireIn,
      });
      return resolve(accessToken);
    });
  }


  //  verifyOTP= async (phone_number,otp) => {

  //     let number = '91' +phone_number;
  //     try {
  //         // console.log(phone_number + 'pros');
  //         var response = await msg91otp.verify(number, parseInt(otp));

  //       console.log(response);
  //       return response
  //     } catch (error) {
  //       console.log("-------"+error);
  //       throw error.message
  //     }
  //   }
  GenerateCompanyUserToken(user_id, user_access, expireIn) {
    return new Promise((resolve, reject) => {
      let access = [];
      for (let i of user_access) {
        access.push(i.user_type);
      }
      let payload = {
        userId: user_id,
        user_access: access,
      };
      var accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: expireIn,
      });
      return resolve(accessToken);
    });
  }
  GenerateMasterQR = async () => {
    // return new Promise((resolve, reject) => {
    try {
      let alpha = 'M-' + random.randomAlphanumeric(10);
      let filename = '/var/www/temporary_storage/Master_QR/' + alpha + '.png';
      // let filename = 'uploads/' + alpha + '.jpg';
      let data = process.env.DOMAIN + alpha;

      const shortdata = await axios.post('https://1pkt.in/shorten', {
        originalUrl: data,
      });
      await QRCode.toFile(filename, shortdata.data.shortenedUrl, {
        margin: 0,
      });

      return { filename, alpha };
    } catch (err) {
      throw new Error(err);
    }
    //   let data = process.env.DOMAIN + alpha;
    //   QRCode.toFile(filename, data)
    //     .then((qr) => {
    //       return resolve({ filename, alpha });
    //     })
    //     .catch((err) => {
    //       return reject(err);
    //     });
    // });
  };
  AddLogo(file) {
    return new Promise((resolve, reject) => {
      console.log('filepath ' + file.paths);
      const fileContent = fs.readFileSync(file.path);
      const s3 = new AWS.S3({
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        region: process.env.STORAGE_REGION,
        endpoint: process.env.STORAGE_ENDPOINT,
      });
      const params = {
        Bucket: process.env.STORAGE_BUCKET,
        Key: `company_logo/${file.originalname}`,
        Body: fileContent,
      };
      s3.upload(params, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Failed to upload the file');
        } else {
          console.log('File uploaded successfully:', data.Location);
          return resolve(data.Location);
        }
      });
    });
  }
  AddImage(file, type) {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(file.path);
      const s3 = new AWS.S3({
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        region: process.env.STORAGE_REGION,
        endpoint: process.env.STORAGE_ENDPOINT,
      });
      let folder_location;
      if (type == 'product') {
        folder_location = 'product_image';
      } else if (type == 'company_avatar') {
        folder_location = 'company_avatar';
      } else if (type == 'warranty_invoice') {
        folder_location = 'warranty_invoice';
      }
      const params = {
        Bucket: process.env.STORAGE_BUCKET,
        Key: `${folder_location}/${file.originalname}`,
        Body: fileContent,
      };
      console.log('Add img' + file);
      s3.upload(params, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Failed to upload the file');
        } else {
          console.log('File uploaded successfully:', data.Location);
          return resolve(data.Location);
        }
      });
    });
  }
  GenerateQR = async (alpha) => {
    // return new Promise((resolve, reject) => {
    try {
      let filename = '/var/www/temporary_storage/Product_QR/' + alpha + '.jpg';
      // let filename = 'uploads/' + alpha + '.jpg';

      let data = process.env.DOMAIN + alpha;
      const shortdata = await axios.post('https://1pkt.in/shorten', {
        originalUrl: data,
      });
      // console.log(shortdata);
      // shortdata.data.shortenedUrl
      await QRCode.toFile(filename, shortdata.data.shortenedUrl, {
        margin: 0,
      });
      // await QRCode.toFile(filename, data)
      return { filename, shortUrl: shortdata.data.shortenedUrl };
      // .then(qr => {
      //     console.log(filename)
      //     return filename
      // })
      // .catch((err) => {
      //     return reject(err)
      // })
    } catch (err) {
      throw err;
    }
    // })
  };
  CreatePdf(filename) {
    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3({
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        region: process.env.STORAGE_REGION,
        endpoint: process.env.STORAGE_ENDPOINT,
      });

      const doc = new PDFDocument({ size: 'A6' });
      let alpha = 'M_pdf-' + random.randomAlphanumeric(5);
      let name = alpha + '.pdf';
      doc.image(filename, {
        width: 200,
        height: 200,
      });
      doc.end();

      const params = {
        Bucket: process.env.STORAGE_BUCKET,
        Key: `master_pdf/${name}`,
        Body: doc,

        ContentType: 'application/pdf',
      };
      s3.upload(params, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('File uploaded successfully:', data.Location);
        return resolve(data.Location);
      });
    });
  }
  Createpdf = async (result2, QR_copies, type) => {
    return new Promise((resolve, reject) => {
      console.log(process.env.STORAGE_ACCESS_KEY_ID);
      const s3 = new AWS.S3({
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        region: process.env.STORAGE_REGION,
        endpoint: process.env.STORAGE_ENDPOINT,
      });
      var doc = new jsPDF('l', 'mm', [54, 25], true);
      // var doc = new jsPDF({
      //     orientation: 'l',
      //     unit: 'mm',
      //     format: [54, 25],
      //    // putOnlyUsedFonts:true,
      //    // floatPrecision: 16 // or "smart", default is 16
      // });
      let alpha;
      if (type == 'master') {
        alpha = 'M_pdf-' + random.randomAlphanumeric(5);
      } else {
        alpha = 'P_pdf-' + random.randomAlphanumeric(5);
      }
      let name = alpha + '.pdf';
      const pdfFilePath = `/var/www/temporary_storage/documents/${name}`;
      // const pdfFilePath = `uploads/${name}`;

      let itr = 1;

      for (let j = 0; j < result2.length; j++) {
        for (let copy = 0; copy < QR_copies; copy++) {
          let target = result2[j].qr_image;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6);
          if (itr % 2 == 1) {
            doc.rect(3, 1, 23, 23);
            let imgData = imageToUri(target);
            doc.addImage(imgData, 'JPEG', 6, 2, 17, 17);
            console.log(result2[j]);
            let serial_number = result2[j].serial_number;
            doc.text(serial_number, 3.9 + 10.5, 21, { align: 'center' });
          } else {
            doc.rect(28, 1, 23, 23);
            let imgData = imageToUri(target);
            doc.addImage(imgData, 'JPEG', 27 + 4, 2, 17, 17);
            let serial_number = result2[j].serial_number;
            doc.text(serial_number, 27 + 1.9 + 10.5, 21, { align: 'center' });
          }

          if (itr % 2 == 0 && j != result2.length - 1) {
            doc.addPage([54, 25]);
          }
          if (j == result2.length - 1 && copy == QR_copies - 1) {
            doc.save(pdfFilePath);
          }
          itr++;
        }
      }
      fs.readFile(pdfFilePath, (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return reject('Unable to read file');
        }
        console.log('data file   ' + data);

        let params;
        if (type == 'master') {
          params = {
            Bucket: process.env.STORAGE_BUCKET,
            Key: `master_pdf/${name}`,
            Body: data,
            ContentDisposition: 'inline',
            ContentType: 'application/pdf',
          };
        } else {
          params = {
            Bucket: process.env.STORAGE_BUCKET,
            Key: `product_pdf/${name}`,
            Body: data,
            ContentDisposition: 'inline',
            ContentType: 'application/pdf',
          };
        }
        console.log('a');
        s3.upload(params, (err, data) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log('File uploaded successfully:', data.Location);
          this.RemoveFile(pdfFilePath)
            .then(() => {
              return resolve(data.Location);
            })
            .catch(() => {
              return resolve(data.Location);
            });
          // return data.Location
        });
      });
    });
  };

  CreateCustomPdf = async (templateData, result2, QR_copies, type) => {
    return new Promise(async (resolve, reject) => {
      const s3 = new AWS.S3({
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        region: process.env.STORAGE_REGION,
        endpoint: process.env.STORAGE_ENDPOINT,
      });
      let {
        page_height,
        page_width,
        labels_in_row,
        labels_left_margin,
        lables_height,
        lables_width,
        use_rect,
        rect_top_margin,
        rect_left_margin,
        rect_width,
        rect_height,
        qr_size,
        qr_left_padding,
        qr_top_padding,
        serial_top_margin,
        font_size,
        is_text,
        image_url,
        text,
      } = templateData;
      if (process.env.PRINT_LINK && process.env.PRINT_LINK === '1' && result2[0].shortUrl) {
        page_height = page_height + 3
      }
      console.log(result2 + 'res2');
      var doc = new jsPDF('l', 'mm', [page_width, page_height], true);

      let alpha;
      if (type == 'master') {
        alpha = 'M_pdf-' + random.randomAlphanumeric(5);
      } else {
        alpha = 'P_pdf-' + random.randomAlphanumeric(5);
      }
      let name = alpha + '.pdf';

      // ... (rest of the code)

      doc.setFont('helvetica', 'bold');
      let itr = 1;
      let label_margin = labels_left_margin;
      let lastXpos = labels_left_margin;

      // ... (rest of the code)

      for (let j = 0; j < result2.length; j++) {
        // ... (rest of the code)

        // doc.roundedRect(0, 0, page_width, page_width, 0, 0, 'F');

        for (let copy = 0; copy < QR_copies; copy++) {
          // ... (rest of the code)
          let target = result2[j].qr_image;

          let rectX = lastXpos + rect_left_margin;
          // if (copy != 0) {
          //   label_margin = lastXpos;
          // }
          // doc.setFillColor('FFFFFF');

          // doc.roundedRect(
          //   labels_left_margin,
          //   0,
          //   lables_width,
          //   lables_height,
          //   2,
          //   2,
          //   'F'
          // );

          if (use_rect) {
            doc.rect(rectX, rect_top_margin, rect_width, rect_height);
            // doc.setLineWidth(0.8);
            // doc.setDrawColor('#ff7000');
            // doc.roundedRect(
            //   rectX,
            //   rect_top_margin,
            //   rect_width,
            //   rect_height,
            //   2,
            //   2,
            //   'S'
            // );
          }

          let imgData = imageToUri(target);

          let qrX = rectX + qr_left_padding;
          // doc.setDrawColor('#ff7000');

          doc.addImage(
            imgData,
            'JPEG',
            qrX,
            rect_top_margin + qr_top_padding,
            qr_size,
            qr_size
          );
          let serial_number = result2[j].serial_number;

          let textX = qrX + qr_size / 2;
          doc.setFontSize(font_size);
          // doc.setTextColor('#000');

          doc.text(
            serial_number,
            textX,
            rect_top_margin + qr_top_padding * 2 + qr_size + serial_top_margin,
            {
              align: 'center',
            }
          );

          if (process.env.PRINT_LINK && process.env.PRINT_LINK === '1' && result2[j].shortUrl) {
            var modifiedUrl = result2[j].shortUrl.replace(/^https:\/\//, '');


            doc.setFontSize(6)
            doc.textWithLink(modifiedUrl, textX, rect_top_margin + rect_height + 2.2, { url: result2[j].shortUrl, align: 'center' })
          }

          if (is_text || is_text === '1') {
            // let ilData = imageToUri(image_url);
            let ilData = await imageToUri('static-images/qr-code.png');
            doc.addImage(
              ilData,
              'PNG',
              labels_left_margin + rect_left_margin + rect_width + 3,
              lables_height / 4,
              13,
              13
            );

            doc.setFontSize(13);
            // doc.setTextColor('#ff7000');

            doc.text(
              text,
              labels_left_margin + rect_left_margin + rect_width + 17,
              lables_height / 3.2,
              {
                maxWidth: 25,
                lineHeightFactor: 1.3,
              }
            );
          }

          lastXpos = lables_width + lastXpos;
          if (
            itr >= labels_in_row &&
            (j != result2.length - 1 || copy != QR_copies - 1)
          ) {
            itr = 1;
            // doc.setFillColor(229, 225, 225);
            label_margin = labels_left_margin;

            lastXpos = label_margin;
            doc.addPage([page_width, page_height]);
          } else {
            itr++;
          }
        }
      }

      // const pdfData = doc.output();
      const pdfData = doc.output('dataurlstring');
      const pdfBuffer = Buffer.from(pdfData.split(',')[1], 'base64');
      // Create a data URI for the PDF
      // const pdfDataUri = 'data:application/pdf;base64,' + btoa(pdfData);

      // Resolve with the data URI
      // resolve(pdfDataUri);
      let params;
      if (type == 'master') {
        params = {
          Bucket: process.env.STORAGE_BUCKET,
          Key: `master_pdf/${name}`,
          Body: pdfBuffer,
          ContentDisposition: 'inline',
          ContentType: 'application/pdf',
        };
      } else {
        params = {
          Bucket: process.env.STORAGE_BUCKET,
          Key: `product_pdf/${name}`,
          Body: pdfBuffer,
          ContentDisposition: 'inline',
          ContentType: 'application/pdf',
        };
      }
      console.log('a');
      s3.upload(params, (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('File uploaded successfully:', data.Location);
        // this.RemoveFile(pdfFilePath)
        //   .then(() => {
        return resolve(data.Location);
        //   })
        //   .catch(() => {
        //     return resolve(data.Location);
        //   });
        // return data.Location
      });
    });
  };

  // CreateCustomPdf = async () => {};

  // import { jsPDF } from 'jspdf';
  // import image2uri from 'image2uri';
  // import imageToURI from 'image-to-data-uri';
  // CreateCustomPdf = async (templateData, result2, QR_copies, type) => {
  //   return new Promise(async (resolve, reject) => {
  //     const s3 = new AWS.S3({
  //       accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  //       secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  //       region: process.env.STORAGE_REGION,
  //       endpoint: process.env.STORAGE_ENDPOINT,
  //     });
  //     const {
  //       page_height,
  //       page_width,
  //       labels_in_row,
  //       labels_left_margin,
  //       lables_height,
  //       lables_width,
  //       use_rect,
  //       rect_top_margin,
  //       rect_left_margin,
  //       rect_width,
  //       rect_height,
  //       qr_size,
  //       qr_left_padding,
  //       qr_top_padding,
  //       serial_top_margin,
  //       font_size,
  //     } = templateData;

  //     console.log(result2 + 'res2');
  //     var doc = new jsPDF('l', 'mm', [page_width, page_height], true);

  //     let alpha;
  //     if (type == 'master') {
  //       alpha = 'M_pdf-' + random.randomAlphanumeric(5);
  //     } else {
  //       alpha = 'P_pdf-' + random.randomAlphanumeric(5);
  //     }
  //     let name = alpha + '.pdf';

  //     // ... (rest of the code)

  //     doc.setFont('helvetica', 'bold');
  //     doc.setFontSize(font_size);
  //     let itr = 1;
  //     let label_margin = labels_left_margin;
  //     let lastXpos = labels_left_margin;

  //     // ... (rest of the code)

  //     for (let j = 0; j < result2.length; j++) {
  //       // ... (rest of the code)

  //       // doc.roundedRect(0, 0, page_width, page_width, 0, 0, 'F');

  //       for (let copy = 0; copy < QR_copies; copy++) {
  //         // ... (rest of the code)
  //         let target = result2[j].qr_image;

  //         let rectX = lastXpos + rect_left_margin;
  //         // if (copy != 0) {
  //         //   label_margin = lastXpos;
  //         // }
  //         // doc.setFillColor('FFFFFF');

  //         // doc.roundedRect(
  //         //   labels_left_margin,
  //         //   0,
  //         //   lables_width,
  //         //   lables_height,
  //         //   2,
  //         //   2,
  //         //   'F'
  //         // );

  //         if (use_rect) {
  //           doc.rect(rectX, rect_top_margin, rect_width, rect_height);
  //         }

  //         let imgData = imageToUri(target);

  //         let qrX = rectX + qr_left_padding;
  //         doc.addImage(
  //           imgData,
  //           'JPEG',
  //           qrX,
  //           rect_top_margin + qr_top_padding,
  //           qr_size,
  //           qr_size
  //         );
  //         let serial_number = result2[j].serial_number;

  //         let textX = qrX + qr_size / 2;
  //         doc.text(
  //           serial_number,
  //           textX,
  //           1 + qr_top_padding * 2 + qr_size + serial_top_margin,
  //           {
  //             align: 'center',
  //           }
  //         );

  //         lastXpos = lables_width + lastXpos;
  //         if (
  //           itr >= labels_in_row &&
  //           (j != result2.length - 1 || copy != QR_copies - 1)
  //         ) {
  //           itr = 1;
  //           // doc.setFillColor(229, 225, 225);
  //           label_margin = labels_left_margin;

  //           lastXpos = label_margin;
  //           doc.addPage([page_width, page_height]);
  //         } else {
  //           itr++;
  //         }
  //       }
  //     }

  //     // const pdfData = doc.output();
  //     const pdfData = doc.output('dataurlstring');
  //     const pdfBuffer = Buffer.from(pdfData.split(',')[1], 'base64');
  //     // Create a data URI for the PDF
  //     // const pdfDataUri = 'data:application/pdf;base64,' + btoa(pdfData);

  //     // Resolve with the data URI
  //     // resolve(pdfDataUri);
  //     let params;
  //     if (type == 'master') {
  //       params = {
  //         Bucket: process.env.STORAGE_BUCKET,
  //         Key: `master_pdf/${name}`,
  //         Body: pdfBuffer,
  //         ContentDisposition: 'inline',
  //         ContentType: 'application/pdf',
  //       };
  //     } else {
  //       params = {
  //         Bucket: process.env.STORAGE_BUCKET,
  //         Key: `product_pdf/${name}`,
  //         Body: pdfBuffer,
  //         ContentDisposition: 'inline',
  //         ContentType: 'application/pdf',
  //       };
  //     }
  //     console.log('a');
  //     s3.upload(params, (err, data) => {
  //       if (err) {
  //         console.log(err);
  //         return;
  //       }
  //       console.log('File uploaded successfully:', data.Location);
  //       // this.RemoveFile(pdfFilePath)
  //       //   .then(() => {
  //       return resolve(data.Location);
  //       //   })
  //       //   .catch(() => {
  //       //     return resolve(data.Location);
  //       //   });
  //       // return data.Location
  //     });
  //   });
  // };

  // export default Createpdf;

  // Createpdf(result2, QR_copies, type) {
  //     return new Promise((resolve, reject) => {
  //         const s3 = new AWS.S3({
  //             accessKeyId: 'AKIAUNSBX7DTBRPTAUUA',
  //             secretAccessKey: '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',
  //             region: 'ap-south-1',
  //             endpoint: 's3.ap-south-1.amazonaws.com'
  //         });
  //         // const doc = new PDFDocument({ size: 'A6' });
  //         const customWidthMm = 151;   // Custom width in millimeters
  //         const customHeightMm = 95;  // Custom height in millimeters

  //         const pointsPerInch = 72;    // Points per inch
  //         const customWidth = customWidthMm * (pointsPerInch / 25.4);   // Convert mm to points
  //         const customHeight = customHeightMm * (pointsPerInch / 25.4);
  //         const doc = new PDFDocument({ size: [customWidth,customHeight] });
  //         let alpha
  //         if (type == 'master') {
  //             alpha = 'M_pdf-' + random.randomAlphanumeric(5);
  //         }
  //         else {
  //             alpha = 'P_pdf-' + random.randomAlphanumeric(5);
  //         }
  //         let name = alpha + '.pdf'
  //         let itr=1;
  //         for (let j = 0; j < result2.length; j++) {

  //             for (let copy = 0; copy < QR_copies; copy++) {

  //                 let target = result2[j].qr_image
  //                 console.log(target)
  //                 doc.fontSize(12)
  //                 // doc.image(target, {
  //                 //     width: 150,
  //                 //     height: 150
  //                 // })
  //                 // doc.fontSize(25).text("ONEPOKET", customWidth / 2 - 60, 20)
  //                 if(itr%2==1){
  //                     console.log(itr)
  //                     console.log("1->")
  //                     doc.rect(2, 2, customWidth / 2 - 32, customHeight - 5).stroke();
  //                     doc.image(target, 3, 3, { width: customWidth / 2 - 40 });
  //                     let serial_number = result2[j].serial_number
  //                     // const textWidth = doc.widthOfString(serial_number); // Get the width of the text
  //                     // const xPosition = (customWidth/2 - textWidth) / 2;
  //                     // doc.fontSize(12).text(serial_number, xPosition, 210)
  //                     // doc.font('Courier').text(serial_number, 58, 212)
  //                     doc.font('Courier-Bold').text(serial_number, 22, 169, {
  //                         width: customWidth / 2 - 32,
  //                         align: 'justify',
  //                         characterSpacing:0.1
  //                       })
  //                 }
  //                 else{
  //                     console.log(itr)
  //                     console.log("2->")
  //                     doc.rect(customWidth / 2 + 11, 2, customWidth / 2 - 32, customHeight - 5).stroke();
  //                     doc.image(target, customWidth / 2 + 14, 3, { width: customWidth / 2 - 40 });
  //                     let serial_number = result2[j].serial_number
  //                     // const textWidth = doc.widthOfString(serial_number); // Get the width of the text
  //                     // const xPosition = (customWidth/2 + textWidth) / 2;
  //                     // doc.fontSize(12).text(serial_number, xPosition, 210)
  //                     doc.font('Courier-Bold').text(serial_number, customWidth / 2 + 33 , 169, {
  //                         width: customWidth / 2 - 32,
  //                         align: 'justify',
  //                         characterSpacing:0.1
  //                       })
  //                 }

  //                 if((itr%2==0) && (j!=result2.length-1)){
  //                     doc.addPage();
  //                 }
  //                 if ((j == result2.length - 1) && (copy == QR_copies - 1)) {
  //                     doc.end()
  //                 }
  //                 itr++;

  //             }
  //         }
  //         let params
  //         if (type == 'master') {
  //             params = {
  //                 Bucket: 'onepoket-production-storage',
  //                 Key: `master_pdf/${name}`,
  //                 Body: doc,

  //                 ContentType: 'application/pdf'
  //             };
  //         }
  //         else {
  //             params = {
  //                 Bucket: 'onepoket-production-storage',
  //                 Key: `product_pdf/${name}`,
  //                 Body: doc,

  //                 ContentType: 'application/pdf'
  //             };
  //         }

  //         s3.upload(params, (err, data) => {
  //             if (err) {
  //                 console.error(err);
  //                 return;
  //             }
  //             console.log('File uploaded successfully:', data.Location);
  //             return resolve(data.Location)
  //         });
  //     })
  // }
  // CreateCustomPdf(
  //   result2,
  //   QR_copies,
  //   type,
  //   customLength,
  //   customWidth,
  //   marginTop,
  //   marginBottom,
  //   marginLeft,
  //   marginRight,
  //   pageCapacity,
  //   QRSize,
  //   printSerial
  // ) {
  //   return new Promise((resolve, reject) => {
  //     const s3 = new AWS.S3({
  //       accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  //       secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  //       region: process.env.STORAGE_REGION,
  //       endpoint: process.env.STORAGE_ENDPOINT,
  //     });
  //     customLength = parseInt(customLength) * 2.8346;
  //     customWidth = parseInt(customWidth) * 2.8346;
  //     marginTop = parseInt(marginTop) * 2.8346;
  //     marginLeft = parseInt(marginLeft) * 2.8346;
  //     marginBottom = parseInt(marginBottom) * 2.8346;
  //     marginRight = parseInt(marginRight) * 2.8346;
  //     QRSize = parseInt(QRSize) * 2.8346;
  //     let QRGap = 20;

  //     const doc = new PDFDocument({
  //       size: [customLength, customWidth],
  //       margins: {
  //         top: marginTop,
  //         bottom: marginBottom,
  //         left: marginLeft,
  //         right: marginRight,
  //       },
  //     });
  //     const availableWidth = customWidth - marginLeft - marginRight;
  //     const availableHeight = customLength - marginTop - marginBottom;
  //     let currentX = marginLeft;
  //     let currentY = marginTop;
  //     let textX = currentX;

  //     let alpha;
  //     if (type == 'master') {
  //       alpha = 'M_pdf-' + random.randomAlphanumeric(5);
  //     } else if (type == 'custom') {
  //       alpha = 'C_pdf-' + random.randomAlphanumeric(5);
  //     } else {
  //       alpha = 'P_pdf-' + random.randomAlphanumeric(5);
  //     }
  //     let name = alpha + '.pdf';

  //     let QRCount = 1;
  //     for (let j = 0; j < result2.length; j++) {
  //       let textY = currentY + QRSize + 10;
  //       let target = result2[j].qr_image;
  //       doc.image(target, currentX, currentY, {
  //         width: QRSize,
  //         height: QRSize,
  //       });
  //       QRCount++;
  //       if (printSerial == 'true') {
  //         let serial_number = result2[j].serial_number;
  //         doc.text(serial_number, currentX + 50, textY);
  //       }
  //       currentX = parseInt(currentX) + QRSize + QRGap;

  //       if (
  //         parseInt(currentX) + 20 >=
  //         parseInt(availableWidth) - parseInt(marginRight)
  //       ) {
  //         currentX = parseInt(marginLeft); // Move to the left margin
  //         currentY = parseInt(currentY) + QRSize + QRGap; // Move to the next line
  //       }
  //       if (
  //         parseInt(currentY) + QRSize >=
  //         parseInt(availableHeight) - parseInt(marginBottom)
  //       ) {
  //         currentX = marginLeft;
  //         currentY = parseInt(marginTop);
  //         QRCount = 0;
  //         doc.addPage();
  //       }
  //       if (
  //         QRCount - 1 == parseInt(pageCapacity) ||
  //         (j > parseInt(pageCapacity) && QRCount == parseInt(pageCapacity))
  //       ) {
  //         console.log(`QRCount->${QRCount}`);
  //         console.log(`pageCapacity->${pageCapacity}`);
  //         console.log('QR count');
  //         currentX = marginLeft;
  //         currentY = parseInt(marginTop);
  //         QRCount = 0;
  //         doc.addPage();
  //       }
  //       // if((j==pageCapacity-1)||(j!=0 && j!=(result2.length-1) && ((j+1)%(parseInt(pageCapacity))==0))){
  //       //     currentX=marginLeft
  //       //     currentY=parseInt(marginTop)
  //       //     doc.addPage()
  //       // }
  //       if (j == result2.length - 1) {
  //         doc.end();
  //       }
  //     }

  //     let params;
  //     if (type == 'master') {
  //       params = {
  //         Bucket: process.env.STORAGE_BUCKET,
  //         Key: `master_pdf/${name}`,
  //         Body: doc,

  //         ContentType: 'application/pdf',
  //       };
  //     } else if (type == 'custom') {
  //       params = {
  //         Bucket: process.env.STORAGE_BUCKET,
  //         Key: `custom_pdf/${name}`,
  //         Body: doc,

  //         ContentType: 'application/pdf',
  //       };
  //     } else {
  //       params = {
  //         Bucket: process.env.STORAGE_BUCKET,
  //         Key: `product_pdf/${name}`,
  //         Body: doc,

  //         ContentType: 'application/pdf',
  //       };
  //     }

  //     s3.upload(params, (err, data) => {
  //       if (err) {
  //         console.error(err);
  //         return;
  //       }
  //       console.log('File uploaded successfully:', data.Location);
  //       return resolve(data.Location);
  //     });
  //   });
  // }

  uploadFileTos3 = async (file) => {
    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3({
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        region: process.env.STORAGE_REGION,
        endpoint: process.env.STORAGE_ENDPOINT,
      });

      // const pdfBuffer = file.buffer;

      // const { template_pdf } = body;
      const name = `Template_${Date.now()}.pdf`;

      // Convert the base64 PDF data to a buffer
      const pdfBuffer = Buffer.from(file.split(',')[1], 'base64');

      // Specify the file path where you want to save the PDF
      // const filePath = `uploads/${name}`;

      // Write the PDF buffer to the file
      // fs.writeFile(filePath, pdfBuffer, async (err) => {
      //   if (err) {
      //     console.error('Error saving PDF:', err);
      //     return reject('Unable to save pdf');

      // res.status(500).json({ error: 'Error saving PDF' });
      // } else {
      //   console.log('PDF saved successfully');
      //   const pdfFilePath = filePath;
      //   fs.readFile(pdfFilePath, (err, data) => {
      //     if (err) {
      //       console.error('Error reading file:', err);
      //       return reject('Unable to read file');
      // }
      // console.log('data file   ' + data);

      let params;

      params = {
        Bucket: process.env.STORAGE_BUCKET,
        Key: `QR_templates/${name}`,
        Body: pdfBuffer,
        ContentDisposition: 'inline',
        ContentType: 'application/pdf',
      };

      console.log('a');
      s3.upload(params, (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('File uploaded successfully:', data.Location);
        // this.RemoveFile(pdfFilePath)
        //   .then(() => {
        return resolve(data.Location);
        //   })
        //   .catch(() => {
        //     return resolve(data.Location);
        //   });
        // return data.Location;
      });
      // });
      // res.json({ message: 'PDF saved successfully' });
      //   }
      // });
      // console.log(file.buffer);

      // Specify the file path where you want to save the PDF
      // const filePath = 'uploads/abhinav.pdf';

      // Write the PDF data to the file
      // fs.writeFileSync(filePath, pdfBuffer);

      // const filePath = 'uploads/template1234.pdf';

      // fs.writeFileSync(filePath, Buffer.from(file, 'base64'));
    });
  };

  HashPassword(passwordToBeHashed) {
    return new Promise((resolve, reject) => {
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          console.error(err);
          return reject(err);
        }

        // Hash the password using the generated salt
        bcrypt.hash(passwordToBeHashed, salt, (err, hash) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          // Store the hashed password in your database
          return resolve(hash);
        });
      });
    });
  }
  VerifyPassword(hashedPassword, enteredPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(enteredPassword, hashedPassword, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        if (result) {
          // Passwords match
          return resolve('Password matched');
        } else {
          // Passwords do not match
          return reject('Invalid credentials!');
        }
      });
    });
  }

  matchHashedOTP(hashedotp, enteredotp) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(enteredotp, hashedotp, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        if (result) {
          // Passwords match
          return resolve(1);
        } else {
          // Passwords do not match
          return resolve(0)
        }
      });
    });
  }
  VerifyPasswordChange(hashedPassword, enteredPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(enteredPassword, hashedPassword, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        if (result) {
          // Passwords match
          return resolve('Password matched');
        } else {
          // Passwords do not match
          return reject('Invalid Old Password');
        }
      });
    });
  }
  RemoveFile(FilePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(FilePath, (err) => {
        if (err) {
          console.log(err);
          return reject();
        } else {
          console.log('File deleted:' + FilePath);
          return resolve();
        }
      });
    });
  }
  removeMasterQRFromTemporaryStorage() {
    let folderPath = '/var/www/temporary_storage/Master_QR/';
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(this.folderPath, file);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          } else {
            console.log(`Deleted file: ${file}`);
          }
        });
      });
    });
  }
  removeProductQRFromTemporaryStorage() {
    let folderPath = '/var/www/temporary_storage/Product_QR/';
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(this.folderPath, file);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          } else {
            console.log(`Deleted file: ${file}`);
          }
        });
      });
    });
  }

  generateResetToken = (userId, tokenId, company_id, is_root) => {
    return jwt.sign({ userId, tokenId: tokenId, company_id: company_id, is_root: is_root }, JWT_SECRET, {
      expiresIn: '1h',
    });
  };

  VerifyLinkToken(token) {
    return new Promise((resolve, reject) => {
      var company_id;
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          console.log(err);
          return reject('Link Expired');
        } else {
          // company_id = decoded.userId;
          return resolve(decoded);
        }
      });
    });
  }

  // module.exports = generateResetToken;

  scheduleDailyCleanup() {
    const job = schedule.scheduleJob('0 3 * * *', () => {
      console.log('Running daily cleanup...');
      this.removeMasterQRFromTemporaryStorage();
      this.removeProductQRFromTemporaryStorage();
    });
  }
}

module.exports = Service;
