const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
var random = require('random-string-alphanumeric-generator');
var path = require('path');

const OperatorManager = require('../Managers/operator_manager');
const operatorManager = new OperatorManager();




const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory as buffer
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});



const app = express();
const db = require('../Database_connection/db');
const { error, log } = require('console');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;

// User details API endpoint
app.get('/user_details', verifyToken, (req, res) => {
    const { id } = req.user;

    const Select_QUERY = `SELECT * FROM landing_page_user WHERE id = ?`;


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_QUERY, [id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database error' });
            }

            const user = results[0];
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        });
    });
});

// this API endpoint will save product details
app.post('/add_product_lp', upload.single('image'), (req, res) => {

    const { file } = req;
    const { company_id,
        product_name,
        model_number,
        description,
        warranty_years,
        warranty_months,
        show_manufacture_date,
        installation_details,
        dynamic_qr,
        product_desc_for_customer,
        product_video_link,
        category_title,
        logo_id,
        additionalInfo,
        PurchaseOptions } = req.body;

    const additional_info_data = JSON.parse(additionalInfo);
    const Purchase_options_data = JSON.parse(PurchaseOptions);



    const fileName = file.originalname || 'unknown';

    const INSERT_QUERY = `INSERT INTO lp_product_list (product_name, model_number, description, company_id, warranty_years, warranty_months, show_manufacture_date, installation_details, product_desc_for_customer, product_video_link, category_title, logo_id, product_img_name, product_image, dynamic_qr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(INSERT_QUERY, [product_name, model_number, description, company_id, warranty_years, warranty_months, show_manufacture_date, installation_details, product_desc_for_customer, product_video_link, category_title, logo_id, fileName, file.buffer, dynamic_qr], (err, result) => {
            if (err) {
                console.error('Error executing MySQL query', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                console.log(result.insertId);


                if (additionalInfo) {
                    for (let i = 0; i < additional_info_data.length; i++) {

                        connection.query('INSERT INTO lp_additional_info(product_id, title, description) VALUES (?, ?, ?)', [result.insertId, additional_info_data[i].title, additional_info_data[i].description], (err, result) => {
                            if (err) {
                                console.error('Error executing MySQL query', err);
                                res.status(500).json({ message: 'Internal Server Error' });
                            } else {
                                console.log("additional info data: ", result.insertId);
                            }
                        });
                    }
                }


                if (PurchaseOptions) {
                    for (let i = 0; i < Purchase_options_data.length; i++) {
                        connection.query('INSERT INTO lp_purchase_options(product_id, title, link) VALUES (?, ?, ?)', [result.insertId, Purchase_options_data[i].title, Purchase_options_data[i].link], (err, result) => {
                            if (err) {
                                console.error('Error executing MySQL query', err);
                                res.status(500).json({ message: 'Internal Server Error' });
                            } else {
                                console.log("purchase option data: ", result.insertId);

                            }
                        });
                    }
                }

                res.status(200).json({ message: 'product added' });

            }
        });


    });
});

// this API endpoint will update details by product id
app.put('/edit_product_by_id', upload.single('image'), (req, res) => {
    const { file } = req;
    const { product_id,
        product_name,
        model_number,
        description,
        warranty_years,
        warranty_months,
        show_manufacture_date,
        installation_details,
        product_desc_for_customer,
        product_video_link,
        category_title,
        logo_id,
        additionalInfo,
        PurchaseOptions } = req.body;

    const additional_info_data = JSON.parse(additionalInfo);
    const Purchase_options_data = JSON.parse(PurchaseOptions);

    const fileName = file.originalname || 'unknown';

    const UPDATE_QUERY = `UPDATE lp_product_list SET product_name=?, model_number=?, description=?, warranty_years=?, warranty_months=?, show_manufacture_date =? , installation_details=?, product_desc_for_customer=?, product_video_link=?, category_title=?, logo_id=?, product_img_name=?, product_image=? where product_id=?`;


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(UPDATE_QUERY, [product_name, model_number, description, warranty_years, warranty_months, show_manufacture_date, installation_details, product_desc_for_customer, product_video_link, category_title, logo_id, fileName, file.buffer, product_id], (err, result) => {
            if (err) {
                console.error('Error executing MySQL query', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                console.log(result);

                if (additionalInfo) {
                    for (let i = 0; i < additional_info_data.length; i++) {
                        connection.query('UPDATE lp_additional_info SET title=?, description=? where product_id=? AND id=?', [additional_info_data[i].title, additional_info_data[i].description, product_id, additional_info_data[i].id], (err, result) => {
                            if (err) {
                                console.error('Error executing MySQL query', err);
                                res.status(500).json({ message: 'Internal Server Error' });
                            } else {
                                console.log("additional info data: ", result.insertId);
                            }
                        });
                    }
                }

                if (PurchaseOptions) {
                    for (let i = 0; i < Purchase_options_data.length; i++) {

                        connection.query('UPDATE lp_purchase_options SET title=?, link=? where product_id=? AND id=?', [Purchase_options_data[i].title, Purchase_options_data[i].link, product_id, Purchase_options_data[i].id], (err, result) => {
                            if (err) {
                                console.error('Error executing MySQL query', err);
                                res.status(500).json({ message: 'Internal Server Error' });
                            } else {
                                console.log("purchase option data: ", result.insertId);
                            }
                        });
                    }
                }

                res.status(200).json({ message: 'Updated Successfully  ' });

            }
        });


    });
});

// this API endpoint will fetch all product on behalf of company id
// app.post('/all_product_lp_old', verifyToken, (req, res) => {
//     const { id } = req.user;
//     const filter_by_category = req.body.filter_by_category;
//     var Select_QUERY;

//     const filter_length = Number(filter_by_category?.length);

//     if (filter_length > 0) {
//         const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
//         Select_QUERY = `SELECT * FROM lp_product_list WHERE company_id = ? AND category_title IN (${placeholders})`;
//     } else {
//         Select_QUERY = `SELECT * FROM lp_product_list WHERE company_id = ?`;
//     }

//     console.log(Select_QUERY);



//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting MySQL connection from pool', err);
//             return res.status(500).json({ message: 'Failed to get a database connection' });
//         }

//         connection.query(Select_QUERY, [id], (error, results) => {
//             if (error) {
//                 console.log(error);
//                 return res.status(500).json({ error: 'Database error' });
//             }

//             if (results.length === 0) {
//                 return res.status(404).json({ error: 'Image not found' });
//             }

//             const Products = results.map(product => ({
//                 product_id: product.product_id,
//                 product_name: product.product_name,
//                 model_number: product.model_number,
//                 description: product.description,
//                 warranty_years: product.warranty_years,
//                 warranty_months: product.warranty_months,
//                 show_manufacture_date: product.show_manufacture_date,
//                 installation_details: product.installation_details,
//                 product_desc_for_customer: product.product_desc_for_customer,
//                 created_at: product.created_at,
//                 product_video_link: product.product_video_link,
//                 category_title: product.category_title,
//                 logo_id: product.logo_id,
//                 product_img_name: product.product_img_name,
//                 product_image: product.product_image ? `data:image/jpeg;base64,${product.product_image.toString('base64')}` : null // Convert binary data to Base64
//             }));

//             res.json(Products); // Send images as JSON


//         });
//     });
// });

app.post('/all_product_lp', verifyToken, (req, res) => {
    const { id } = req.user;
    const { filter_by_category, filter_by_date, start_date, end_date } = req.body;
    var Select_QUERY;

    const filter_length = Number(filter_by_category?.length);


    if (filter_length > 0) {
        const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
        Select_QUERY = `SELECT * FROM lp_product_list WHERE company_id = ? AND category_title IN (${placeholders})`;
    } else {
        Select_QUERY = `SELECT * FROM lp_product_list WHERE company_id = ?`;
    }

    // Add date filtering
    if (filter_by_date) {
        const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
        if (dateCondition) {
            Select_QUERY += ` AND created_at ${dateCondition}`;
        }
    }


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_QUERY, [id], (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(200).json({ message: 'Data not found' });
            }

            const Products = results.map(product => ({
                product_id: product.product_id,
                product_name: product.product_name,
                model_number: product.model_number,
                description: product.description,
                warranty_years: product.warranty_years,
                warranty_months: product.warranty_months,
                show_manufacture_date: product.show_manufacture_date,
                installation_details: product.installation_details,
                product_desc_for_customer: product.product_desc_for_customer,
                //created_at: product.created_at,
                created_at : new Date(new Date(product.created_at).getTime() + 19800000),
                product_video_link: product.product_video_link,
                category_title: product.category_title,
                logo_id: product.logo_id,
                dynamic_qr: product.dynamic_qr,
                product_img_name: product.product_img_name,
                product_image: product.product_image ? `data:image/jpeg;base64,${product.product_image.toString('base64')}` : null // Convert binary data to Base64
            }));

            res.json(Products); // Send images as JSON


        });
    });
});


// this API endpoint will fetch one product details on behalf of product id
app.get('/get_product_by_id', (req, res) => {
    const id = parseInt(req.query.id);

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(`SELECT * FROM lp_product_list WHERE product_id = ?`, [id], (error, results) => {
            if (error) {
                console.log(error);
                connection.release();
                return res.status(500).json({ error: 'Database error' });
            }


            var product = results[0];
            if (!product) {
                connection.release();
                return res.status(404).json({ error: 'User not found' });
            }

            connection.query(`SELECT name, image, title FROM image WHERE id = ?`, [results[0].logo_id], (error, logo_data) => {
                if (error) {
                    console.log(error);
                    connection.release();
                    return res.status(500).json({ error: 'Database error' });
                }
                const logo = logo_data.map(image => ({
                    logo_name: image.name,
                    logo_title: image.title,
                    image: image.image ? `data:image/jpeg;base64,${image.image.toString('base64')}` : null // Convert binary data to Base64
                }));
                product.logo_info = logo;
            });

            connection.query(`SELECT id, title, description FROM lp_additional_info WHERE product_id = ?`, [id], (error, ai_result) => {
                if (error) {
                    console.log(error);
                    connection.release();
                    return res.status(500).json({ error: 'Database error' });
                }
                product.additional_info = ai_result;
            });

            connection.query(`SELECT id, title, link FROM lp_purchase_options WHERE product_id = ?`, [id], (error, po_result) => {
                if (error) {
                    console.log(error);
                    connection.release();
                    return res.status(500).json({ error: 'Database error' });
                }
                product.Purchase_options = po_result;
                res.json(product);

            });
        });
    });
});

// this API endpoint will delete one product details on behalf of product id
app.delete('/delete_product_by_id', verifyToken, (req, res) => {
    const { id } = req.user;
    const product_id = parseInt(req.query.id);

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }
        connection.query(`DELETE FROM lp_additional_info WHERE product_id = ?`, [product_id], (error) => {
            if (error) {
                console.log(error);
                connection.release();
                return res.status(500).json({ error: 'Database error' });
            }

            connection.query(`DELETE FROM lp_purchase_options WHERE product_id = ?`, [product_id], (error) => {
                if (error) {
                    console.log(error);
                    connection.release();
                    return res.status(500).json({ error: 'Database error' });
                }

                connection.query(`DELETE FROM lp_product_list WHERE product_id = ? AND company_id = ?`, [product_id, id], (error) => {
                    if (error) {
                        console.log(error);
                        connection.release();
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.status(200).json({ message: 'Product has been deleted' });

                });

            });
        });
    });
});

// this API endpoint will add category into databases
app.post('/add_category', verifyToken, (req, res) => {
    const { id } = req.user;
    const title = req.body.title;
    const description = req.body.description;

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }


        connection.query(`SELECT * FROM categories where company_id=? AND title = ?`, [id, title], (err1, cdata) => {
            if (err1) {
                console.log(error,);
                connection.release();
                return res.status(500).json({ error: 'Database error' });
            } else {
                if (cdata.length != 0) {
                    res.status(200).json({ message: "Duplicate Catecategoy" })

                } else {
                    connection.query('INSERT INTO categories(title, description, company_id) VALUES (?, ?, ?)', [title, description, id], (err, result) => {
                        if (err) {
                            console.error('Error executing MySQL query', err);
                            res.status(500).json({ message: 'Internal Server Error' });
                        } else {
                            console.log("purchase option data: ", result.insertId);
                            res.status(200).json({ message: 'category added' });
                        }
                    });

                }
            }
        });




    });

});

//This API endpoint will get all category on behalf of company id
app.get('/get_all_category', verifyToken, (req, res) => {
    const { id } = req.user;
    console.log(id);

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }


        connection.query('SELECT * FROM categories WHERE company_id = ?', [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Data not found' });
            }
            console.log(results);

            res.json(results); // Send images as JSON
        });

    });
});



app.post('/lp_print_QR', verifyToken, async (req, res) => {
    const { id } = req.user;
    const c_id = id;
    let i = req.body;
    console.log(i);
    if (parseInt(i.quantity) >= parseInt(process.env.QR_QUANTITY)) {
        res.status(400).send(`You can generate PDF with ${process.env.QR_OVERALL - 1} QRs max! Please try with lesser number of QRs.`);

    } else if (parseInt(i.QR_copies) >= parseInt(process.env.QR_COPIES)) {
        res.status(400).send(`You can generate PDF with ${process.env.QR_OVERALL - 1} QRs max! Please try with lesser number of QRs.`);

    } else if (parseInt(i.QR_copies) * parseInt(i.quantity) >= parseInt(process.env.QR_OVERALL)) {
        res.status(400).send(`You can generate PDF with ${process.env.QR_OVERALL - 1} QRs max! Please try with lesser number of QRs.`);
    } else {

        try {
            // this is comming from old gatekeeper_manager.Identity function and that will return user for QR
            user = {
                id: c_id,
                company_id: c_id,
                factory_id: c_id,
            };
            console.log(user);
            const credits_remaining = await GetRemainingQRCredits(c_id);

            console.log('cred', credits_remaining);
            if (process.env.CREDIT_BALANCE_CHECK === '1') {
                //   console.log('Inside-Credit Balance');
                if (credits_remaining >= i.quantity) {
                    operatorManager.PrintQR(req.body, credits_remaining, user)
                        .then((result) => {
                            console.log('mng' + result);
                            setTimeout(() => {
                                res.send(result);
                            }, 500);
                        })
                        .catch((err) => {
                            console.log(err);
                            if (err.message) {
                                res.status(400).send(err.message);
                            }
                            else {
                                res.status(400).send(err);

                            }
                        });
                } else res.status(400).send('Insufficient credits');
            } else {
                operatorManager.PrintQR(req.body, credits_remaining, user)
                    .then((result) => {
                        console.log('mng' + result);
                        setTimeout(() => {
                            res.send(result);
                        }, 500);
                    })
                    .catch((err) => {
                        console.log(err);
                        // res.status(400).send(err);
                        if (err.message) {
                            res.status(400).send(err.message);
                        }
                        else {
                            res.status(400).send(err);

                        }
                    });
            }

        } catch (err) {
            console.log(err);
            res.status(401).send(err);
        }

    }
}
);






function getDateCondition(filter_by_date, start_date, end_date) {
    const today = new Date();
    let startDate, endDate;

    switch (filter_by_date) {
        case 'this_month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'this_week':
            startDate = new Date(today.setDate(today.getDate() - 7));
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(today.setDate(today.getDate() + 7));
            endDate.setHours(23, 59, 59, 999);
           
            break;
        case 'yesterday':
            startDate = new Date(today.setDate(today.getDate() - 1));
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(today.setDate(today.getDate()));
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'today':
            startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
            endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));
   
            break;
        case 'custom_date':
            startDate = new Date(start_date);
            endDate = new Date(end_date);
            break;
        default:
            return null;
    }

    return `BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;
}


// Middleware function  and functions to verify JWT token
async function GetRemainingQRCredits(company_id) {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT credit_limit FROM landing_page_user WHERE id=?',
            [company_id],
            (err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    console.log(result);
                    return resolve(result[0].credit_limit);
                }
            }
        );
    });
};


function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, JWT_SECRET, (jwtError, authData) => {
            if (jwtError) {
                return res.status(403).send({ message: 'authentication denied' });
            } else {
                req.user = authData;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};





module.exports = app;