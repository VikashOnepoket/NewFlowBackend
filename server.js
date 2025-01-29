const express = require('express');

const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
var path = require('path');
const PORT = 3001;
var bodyParser = require('body-parser');
const SendOtp = require('sendotp');
const { resolveSoa } = require('dns');
const msg91OTP = require('msg91-lib').msg91OTP;
const msg91 = require('msg91').default;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const db = require('./Database_connection/db');
require('./MicroServices/cron');

// const sdk = require('api')('@msg91api/v5.0#6n91xmlhu4pcnz');

// sdk.auth('388243AutttOTXECf63bc5788P1');

require('dotenv').config();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/temporary_storage/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
var corsOptions = {
  origin: [
    'http://localhost:5173',    
    'http://localhost:3000',
    'https://onepoketstage.web.app',
    'https://onepoket.com',
    'https://onepoket.in',
    'https://dev-company.onepoket.com',
    'http://dev-company-new.onepoket.com',
    'http://dev-company-old.onepoket.com',


    'https://dev-company-user.onepoket.com',
    'https://dev.onepoket.com',
    'https://dev-super-admin.onepoket.com',
  ],
  // origin: [
  //   'https://company.onepoket.com',
  //   'http://localhost:3000',
  //   'https://company-user.onepoket.com',
  //   'https://onepoket.com',
  //   'https://super-admin.onepoket.com',
  // ],

  credentials: true,
  methods: ['GET', 'PUT', 'DELETE', 'UPDATE', 'POST', 'PATCH'],
};
var upload = multer({ storage: storage });
const app = express();
const sendOtp = new SendOtp('388243AutttOTXECf63bc5788P1');
// msg91.initialize({ authKey: '388243AutttOTXECf63bc5788P1' });
const msg91otp = new msg91OTP({
  authKey: '388243AutttOTXECf63bc5788P1',
  templateId: '63bd363ed6fc0537b36cc522',
});
const admin_repository = require('./Repositories/admin_repository');
const admin_repo=new admin_repository()
const envUpdate=async()=>{await admin_repo.getAllDefaultConfigsAndSetEnv()
}

envUpdate()

// const msg91otp = new msg91OTP({authKey='xxxxxxxxxxxxxxxxxxxxxx', templateId='xxxxxxxxxxxxxxxxxxxxxx'})

const QR_functions = require('./Controllers/QR_functions');
const company_functions = require('./Controllers/company');
const gateKeeper = require('./Controllers/gatekeeper');
const packer = require('./Controllers/packer');
const admin = require('./Controllers/admin');
const customer = require('./Controllers/customer');
const landingpage = require('./Controllers/landingpage');
const lp_dashboard = require('./Controllers/lp_dashboard');
const lp_analytics = require('./Controllers/lp_analytics');
const lp_profile = require('./Controllers/lp_profile');
const lp_sevicerequest = require('./Controllers/lp_servicerequest');
const MicroService = require('./MicroServices/services');
const micro_service = new MicroService();   
// app.use()

app.use(cors(corsOptions));
app.use(express.json());
app.use(QR_functions);
app.use(company_functions);
app.use(gateKeeper);
app.use(packer);
app.use(admin);
app.use(customer);
app.use(landingpage);
app.use(lp_dashboard);
app.use(lp_analytics);
app.use(lp_profile);
app.use(lp_sevicerequest);
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const CompanyManager = require('./Managers/company_manager');
const companyManager = new CompanyManager();

app.get('/', (req, res) => {
  console.log(req);
});

app.get('/business_logout', (req, res) => {
  res.clearCookie('accessToken');
  res.send({ message: 'Successfully signed out' });
});
app.get('/CustomerSeller_logout', (req, res) => {
  res.clearCookie('accessToken');
  res.send({ message: 'Successfully signed out' });
});
// app.post('/edit_product', upload.fields([{ name: 'newImages', maxCount: 7 }]), (req, res) => {
//     //let img= "https://api-dev.billfy.in/pictures/"+req.file.filename
//     let i = req.body
//     console.log(i)
//     var product_id

//     let category = []
//     if (typeof (i.category) == 'string') {
//         category[0] = JSON.parse(i.category)
//     }
//     else {
//         for (let j = 0; j < i.category.length; j++) {
//             category.push(JSON.parse(i.category[j]))
//         }
//     }
//     let warranty = []
//     if (typeof (i.warranty) == 'string') {
//         warranty[0] = JSON.parse(i.warranty)
//         product_id = JSON.parse(i.warranty).product_id
//     }
//     else {
//         for (let j = 0; j < i.warranty.length; j++) {
//             warranty.push(JSON.parse(i.warranty[j]))
//             product_id = JSON.parse(i.warranty[j]).product_id
//         }
//     }
//     let additionalInfo = []
//     if (typeof (i.additionalInfo) == 'string') {
//         additionalInfo[0] = JSON.parse(i.additionalInfo)
//     }
//     else {
//         for (let j = 0; j < i.additionalInfo.length; j++) {
//             additionalInfo.push(JSON.parse(i.additionalInfo[j]))
//         }
//     }
//     let video = []
//     if (typeof (i.video) == 'string') {
//         if(i.video==''){
//             video[0]=''
//         }
//         else{
//             video[0] = JSON.parse(i.video)
//         }
//     }
//     else {
//         for (let j = 0; j < i.video.length; j++) {
//             video.push(JSON.parse(i.video[j]))
//         }
//     }
//     let delImages = []
//     if (i.delImages) {
//         if (typeof (i.delImages) == 'string') {
//             delImages[0] = JSON.parse(i.delImages)
//         }
//         else {
//             for (let j = 0; j < i.delImages.length; j++) {
//                 delImages.push(JSON.parse(i.delImages[j]))
//             }
//         }
//     }
//     let purchaseOptions = []
//         if (typeof (i.purchaseOptions) == 'string') {
//             if(i.purchaseOptions==''){
//                 purchaseOptions[0]=''
//             }
//             else{
//                 purchaseOptions[0] = JSON.parse(i.purchaseOptions)
//             }
//         }
//         else {
//             for (let j = 0; j < i.purchaseOptions.length; j++) {
//                 purchaseOptions.push(JSON.parse(i.purchaseOptions[j]))
//             }
//         }
//     // let newImages = []
//     // if(req.files.newImages){
//     //     for(let j=0;j<req.files.newImages.length;j++){
//     //         newImages.push(JSON.parse(i.newImages[j]))
//     //     }
//     // }
//     var showManufactureDate
//     if (i.showManufactureDate == 'true') {
//         showManufactureDate = true
//     }
//     else {
//         showManufactureDate = false
//     }
//     if (i.minimumQuantity == "") {
//         i.minimumQuantity = 0
//     }
//     if (i.productCost == "") {
//         i.productCost = 0
//     }
//     let company_logo = JSON.parse(i.company_logo)
//     db.query("UPDATE product_list SET product_name=?,product_description=?,product_model=?,showManufactureDate=? where id=?",
//         [i.product_name, i.productDescription, i.productModel, showManufactureDate, product_id], (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 console.log({ message: "Data saved" })
//                 for (let j of warranty) {
//                     db.query("UPDATE warranty SET name=?,year=?,month=?,customer_id=? where id=?", [j.name, j.year, j.month, j.customer_id, j.id], (err, result) => {
//                         if (err) {
//                             console.log(err)
//                             res.send({ message: "Error" })
//                         }
//                         else {
//                             console.log("Updated warranty")
//                         }
//                     })
//                 }
//                 if (req.files.newImages) {
//                     for (let j of req.files.newImages) {
//                         micro_service.AddImage(j, "product")
//                             .then((p_img) => {
//                                 console.log(p_img)
//                                 db.query("Insert into product_image(product_id,image) values (?,?)", [product_id, p_img], (err, result) => {
//                                     if (err) {
//                                         console.log(err)
//                                         res.send({ message: "Error in product image" })
//                                     }
//                                     else {
//                                         console.log({ message: "Picture inserted" })
//                                     }
//                                 })
//                             })
//                             .catch((err) => {
//                                 console.log(err)
//                             })
//                     }
//                 }
//                 if (i.delImages) {
//                     for (let j of delImages) {
//                         db.query("select image from product_image where id=?", [j.id], (err, result) => {
//                             if (err) {
//                                 console.log("Not found")
//                             }
//                             else {
//                                 console.log(result)
//                                 console.log(result[0].image)
//                                 var name = result[0].image.split('/')
//                                 name = name[4]
//                                 // var filepath = "/var/www/pictures/" + name
//                                 // fs.unlinkSync(filepath)
//                                 db.query("delete from product_image where id=?", [j.id], (err, result) => {
//                                     if (err) {
//                                         console.log(err)
//                                         res.send({ message: "Error" })
//                                     }
//                                     else {

//                                         console.log("Deleted")
//                                     }
//                                 })
//                             }
//                         })

//                     }
//                 }
//                 for (let j of category) {
//                     db.query("UPDATE product_category SET title=?,description=? where id=?", [j.title, j.description, j.id], (err, result) => {
//                         if (err) {
//                             console.log(err)
//                             res.send({ message: "Error" })
//                         }
//                         else {
//                             console.log("Updated category")
//                         }
//                     })
//                 }
//                 for (let j of additionalInfo) {
//                     db.query("UPDATE additional_info SET title=?,description=? where id=?", [j.title, j.description, j.id], (err, result) => {
//                         if (err) {
//                             console.log(err)
//                             res.send({ message: "Error" })
//                         }
//                         else {
//                             console.log("Updated additional info")
//                         }
//                     })
//                 }
//                 db.query("delete from product_videos where product_id=?", [product_id], (err, result) => {
//                     if (err) {
//                         console.log(err)
//                         res.send({ message: "Error" })
//                     }
//                     else {
//                         if(video[0]!=''){
//                             for (let j of video) {
//                                 db.query("insert into product_videos(video,product_id) values (?,?)", [j.video, product_id], (err, result) => {
//                                     if (err) {
//                                         console.log(err)
//                                         res.send({ message: "Error" })
//                                     }
//                                     else {
//                                         console.log("Updated video")
//                                     }
//                                 })
//                             }
//                         }
//                     }
//                 })
//                 if(company_logo.id==""){
//                     db.query("update product_list set logo=? where id=?",[null,product_id],(err,result)=>{
//                         if(err){
//                             console.log(err)
//                         }
//                         else{
//                             console.log("logo updated-null")
//                         }
//                     })
//                 }
//                 else{
//                     db.query("update product_list set logo=? where id=?",[company_logo.id,product_id],(err,result)=>{
//                         if(err){
//                             console.log(err)
//                         }
//                         else{
//                             console.log("logo updated-img")
//                         }
//                     })
//                 }
//                 db.query("delete from product_purchase_options where product_id=?", [product_id], (err, result) => {
//                     if (err) {
//                         console.log(err)
//                         res.send({ message: "Error" })
//                     }
//                     else {
//                         if(purchaseOptions[0]!=''){
//                             for (let j=0;j<purchaseOptions.length;j++) {
//                                 db.query("insert into product_purchase_options(title,link,product_id,sequence) values (?,?,?,?)", [purchaseOptions[j].title,purchaseOptions[j].link, product_id,parseInt(j)], (err, result) => {
//                                     if (err) {
//                                         console.log(err)
//                                         res.send({ message: "Error" })
//                                     }
//                                     else {
//                                         console.log("Updated purchaseOptions")
//                                     }
//                                 })
//                             }
//                         }
//                     }
//                 })
//                 setTimeout(() => { res.send("Product updated") }, 200)
//             }
//         })

// })

// app.post(
//   '/edit_product',
//   upload.fields([{ name: 'newImages', maxCount: 7 }]),
//   (req, res) => {
//     //let img= "https://api-dev.billfy.in/pictures/"+req.file.filename
//     let i = req.body;
//     console.log(i);
//     var product_id;

//     let category = [];
//     if (typeof i.category == 'string') {
//       category[0] = JSON.parse(i.category);
//     } else {
//       for (let j = 0; j < i.category.length; j++) {
//         category.push(JSON.parse(i.category[j]));
//       }
//     }
//     let warranty = [];
//     if (typeof i.warranty == 'string') {
//       warranty[0] = JSON.parse(i.warranty);
//       product_id = JSON.parse(i.warranty).product_id;
//     } else {
//       for (let j = 0; j < i.warranty.length; j++) {
//         warranty.push(JSON.parse(i.warranty[j]));
//         product_id = JSON.parse(i.warranty[j]).product_id;
//       }
//     }
//     let additionalInfo = [];
//     if (typeof i.additionalInfo == 'string') {
//       additionalInfo[0] = JSON.parse(i.additionalInfo);
//     } else {
//       for (let j = 0; j < i.additionalInfo.length; j++) {
//         additionalInfo.push(JSON.parse(i.additionalInfo[j]));
//       }
//     }
//     let video = [];
//     if (typeof i.video == 'string') {
//       if (i.video == '') {
//         video[0] = '';
//       } else {
//         video[0] = JSON.parse(i.video);
//       }
//     } else {
//       for (let j = 0; j < i.video.length; j++) {
//         video.push(JSON.parse(i.video[j]));
//       }
//     }
//     let delImages = [];
//     if (i.delImages) {
//       if (typeof i.delImages == 'string') {
//         delImages[0] = JSON.parse(i.delImages);
//       } else {
//         for (let j = 0; j < i.delImages.length; j++) {
//           delImages.push(JSON.parse(i.delImages[j]));
//         }
//       }
//     }
//     let purchaseOptions = [];
//     if (typeof i.purchaseOptions == 'string') {
//       if (i.purchaseOptions == '') {
//         purchaseOptions[0] = '';
//       } else {
//         purchaseOptions[0] = JSON.parse(i.purchaseOptions);
//       }
//     } else {
//       for (let j = 0; j < i.purchaseOptions.length; j++) {
//         purchaseOptions.push(JSON.parse(i.purchaseOptions[j]));
//       }
//     }
//     // let newImages = []
//     // if(req.files.newImages){
//     //     for(let j=0;j<req.files.newImages.length;j++){
//     //         newImages.push(JSON.parse(i.newImages[j]))
//     //     }
//     // }
//     var showManufactureDate;
//     if (i.showManufactureDate == 'true') {
//       showManufactureDate = true;
//     } else {
//       showManufactureDate = false;
//     }
//     if (i.minimumQuantity == '') {
//       i.minimumQuantity = 0;
//     }
//     if (i.productCost == '') {
//       i.productCost = 0;
//     }
//     let company_logo = JSON.parse(i.company_logo);
//     db.query(
//       'UPDATE product_list SET product_name=?,product_description=?,product_model=?,showManufactureDate=? where id=?',
//       [
//         i.product_name,
//         i.productDescription,
//         i.productModel,
//         showManufactureDate,
//         product_id,
//       ],
//       (err, result) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log({ message: 'Data saved' });
//           for (let j of warranty) {
//             db.query(
//               'UPDATE warranty SET name=?,year=?,month=?,customer_id=? where id=?',
//               [j.name, j.year, j.month, j.customer_id, j.id],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                   res.send({ message: 'Error' });
//                 } else {
//                   console.log('Updated warranty');
//                 }
//               }
//             );
//           }
//           if (req.files.newImages) {
//             for (let j of req.files.newImages) {
//               micro_service
//                 .AddImage(j, 'product')
//                 .then((p_img) => {
//                   console.log(p_img);
//                   db.query(
//                     'UPDATE  product_image SET image=? WHERE product_id=?',
//                     [p_img, product_id],
//                     (err, result) => {
//                       if (err) {
//                         console.log(err);
//                         res.send({ message: 'Error in product image' });
//                       } else {
//                         console.log({ message: 'Picture inserted' });
//                       }
//                     }
//                   );
//                 })
//                 .catch((err) => {
//                   console.log(err);
//                 });
//             }
//           }
//           if (i.delImages) {
//             for (let j of delImages) {
//               db.query(
//                 'select image from product_image where id=?',
//                 [j.id],
//                 (err, result) => {
//                   if (err) {
//                     console.log('Not found');
//                   } else {
//                     console.log(result);
//                     console.log(result[0].image);
//                     var name = result[0].image.split('/');
//                     name = name[4];
//                     // var filepath = "/var/www/pictures/" + name
//                     // fs.unlinkSync(filepath)
//                     db.query(
//                       'delete from product_image where id=?',
//                       [j.id],
//                       (err, result) => {
//                         if (err) {
//                           console.log(err);
//                           res.send({ message: 'Error' });
//                         } else {
//                           console.log('Deleted');
//                         }
//                       }
//                     );
//                   }
//                 }
//               );
//             }
//           }
//           for (let j of category) {
//             db.query(
//               'INSERT IGNORE INTO product_category(product_id,title,description) values (?,?,?)',
//               [product_id, j.title, j.description],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                   res.send({ message: 'Error' });
//                 } else {
//                   console.log('Updated category');
//                 }
//               }
//             );
//           }
//           for (let j of additionalInfo) {
//             db.query(
//               'UPDATE additional_info SET title=?,description=? where product_id=?',
//               [j.title, j.description, j.id],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                   res.send({ message: 'Error' });
//                 } else {
//                   console.log('Updated additional info');
//                 }
//               }
//             );
//           }
//           db.query(
//             'delete from product_videos where product_id=?',
//             [product_id],
//             (err, result) => {
//               if (err) {
//                 console.log(err);
//                 res.send({ message: 'Error' });
//               } else {
//                 if (video[0] != '') {
//                   for (let j of video) {
//                     db.query(
//                       'insert into product_videos(video,product_id) values (?,?)',
//                       [j.video, product_id],
//                       (err, result) => {
//                         if (err) {
//                           console.log(err);
//                           res.send({ message: 'Error' });
//                         } else {
//                           console.log('Updated video');
//                         }
//                       }
//                     );
//                   }
//                 }
//               }
//             }
//           );
//           if (company_logo.id == '') {
//             db.query(
//               'update product_list set logo=? where id=?',
//               [null, product_id],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log('logo updated-null');
//                 }
//               }
//             );
//           } else {
//             db.query(
//               'update product_list set logo=? where id=?',
//               [company_logo.id, product_id],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log('logo updated-img');
//                 }
//               }
//             );
//           }
//           db.query(
//             'delete from product_purchase_options where product_id=?',
//             [product_id],
//             (err, result) => {
//               if (err) {
//                 console.log(err);
//                 res.send({ message: 'Error' });
//               } else {
//                 if (purchaseOptions[0] != '') {
//                   for (let j = 0; j < purchaseOptions.length; j++) {
//                     db.query(
//                       'insert into product_purchase_options(title,link,product_id,sequence) values (?,?,?,?)',
//                       [
//                         purchaseOptions[j].title,
//                         purchaseOptions[j].link,
//                         product_id,
//                         parseInt(j),
//                       ],
//                       (err, result) => {
//                         if (err) {
//                           console.log(err);
//                           res.send({ message: 'Error' });
//                         } else {
//                           console.log('Updated purchaseOptions');
//                         }
//                       }
//                     );
//                   }
//                 }
//               }
//             }
//           );
//           setTimeout(() => {
//             res.send('Product updated');
//           }, 200);
//         }
//       }
//     );
//   }
// );







app.listen(PORT, () => {
  console.log('Server running');
});
