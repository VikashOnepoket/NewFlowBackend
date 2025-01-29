// const mysql = require('mysql2');
// // const jwt = require('jsonwebtoken')
// const QRCode = require('qrcode');
// var random = require('random-string-alphanumeric-generator');

// // const db = mysql.createPool({
// //     connectionLimit : 100,
// //     user:"swapnil",
// //     host: "127.0.0.1",
// //     password: "U%7m09L6&h^f",
// //     database:"Billify",
// // });

// // async function print_QR(req,res,next){
// //     let i = req.body;
// //     console.log(i)
// //     req.send({message:"Result"});

// // }
// // const shortdata = await axios.post('https://1pkt.in/shorten', {
// //         originalUrl: data,
// let alpha = 'M-' + random.randomAlphanumeric(10);
// //   let filename = '/var/www/temporary_storage/Master_QR/' + alpha + '.png';
// let filename = 'DUMMYQR/' + alpha + '.jpg';
// //       });
// QRCode.toFile(filename, 'https://1pkt.in/edePSK', { margin: 0 });
const readXlsxFile = require('read-excel-file/node')
const excelToJson = require('convert-excel-to-json');

const fs=require('fs')

convertExcelToJSON=()=>{

    // const schema={
    //    "Product Details":
       
    //    {
    //     prop:"product_name",
    //     type:String
    //    }
    // }
    const result = excelToJson({
        sourceFile: 'OnePoketBulkProduct.xlsx',
        header:{
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
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
            'L':"product_desc_for_customer",
            'M': 'product_image',
            'N': 'categories',
            'O': 'logo',
            'P': 'installation_required',
        }
    });
    console.log(result)
  
  
    // readXlsxFile(fs.createReadStream('OnePoketBulkProduct.xlsx')).then(( rows ) => {
    //     // console.log(error)
    //   console.log(rows)
    // })
  }

  convertExcelToJSON()