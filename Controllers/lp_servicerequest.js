const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const JWT_SECRET = process.env.JWT_SECRET;

const db = require('../Database_connection/db');
const OperatorManager = require('../Managers/operator_manager');
const operatorManager = new OperatorManager();
const CompanyRepository = require('../Repositories/company_repository');
const company_repo = new CompanyRepository();
const CustomerManager = require('../Managers/customer_manager');
const customerManager = new CustomerManager();


const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory as buffer
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});


// This GET API will fetch all pending installation form of customer
app.post('/lp_pending_installation', verifyToken, (req, res) => {
    const { id } = req.user;
    const { filter_by_category, filter_by_date, start_date, end_date } = req.body;
    var Select_QUERY;

    //const Select_QUERY = `SELECT uid.id, uid.request_date_time, uid.contact_name, uid.contact_number, uid.contact_address, uid.installation_date, uid.installation_time, uid.installation_status, uid.other_details, lp.product_name, lp.category_title FROM user_installation_details uid JOIN warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric JOIN lp_product_list lp ON lp.product_id = wad.product_id WHERE uid.installation_status = "pending" AND wad.company_id=?`;

    const filter_length = Number(filter_by_category?.length);


    if (filter_length > 0) {
        const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
        Select_QUERY = `SELECT uid.id, uid.request_date_time, uid.contact_name, uid.contact_number, uid.contact_address, uid.installation_date, uid.installation_time, uid.installation_status, uid.other_details, lp.product_name, lp.category_title FROM user_installation_details uid JOIN warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric JOIN lp_product_list lp ON lp.product_id = wad.product_id WHERE uid.installation_status = "pending" AND wad.company_id=? AND lp.category_title IN (${placeholders})`;
    } else {
        Select_QUERY = `SELECT uid.id, uid.request_date_time, uid.contact_name, uid.contact_number, uid.contact_address, uid.installation_date, uid.installation_time, uid.installation_status, uid.other_details, lp.product_name, lp.category_title FROM user_installation_details uid JOIN warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric JOIN lp_product_list lp ON lp.product_id = wad.product_id WHERE uid.installation_status = "pending" AND wad.company_id=?`;
    }


    // Add date filtering
    if (filter_by_date) {
        const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
        if (dateCondition) {
            Select_QUERY += ` AND uid.request_date_time ${dateCondition}`;
        }
    }

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }


        connection.query(Select_QUERY, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(200).json({ message: 'Data not Found' });
            }
            total_count = Number(results.length);

            let data = {
                result: results,
                count: total_count
            }

            res.json(data);
        });

    });
});

app.post('/lp_completed_installation', verifyToken, (req, res) => {
    const { id } = req.user;
    const { filter_by_category, filter_by_date, start_date, end_date } = req.body;
    var Select_QUERY;

    const filter_length = Number(filter_by_category?.length);


    if (filter_length > 0) {
        const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
        Select_QUERY = `SELECT uid.request_date_time, uid.contact_name, uid.contact_number, uid.contact_address, uid.installation_date, uid.installation_time, uid.installation_status, uid.other_details, lp.product_name, lp.category_title FROM user_installation_details uid JOIN warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric JOIN lp_product_list lp ON lp.product_id = wad.product_id WHERE uid.installation_status = "completed" AND wad.company_id=? AND lp.category_title IN (${placeholders})`;
    } else {
        Select_QUERY = `SELECT uid.request_date_time, uid.contact_name, uid.contact_number, uid.contact_address, uid.installation_date, uid.installation_time, uid.installation_status, uid.other_details, lp.product_name, lp.category_title FROM user_installation_details uid JOIN warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric JOIN lp_product_list lp ON lp.product_id = wad.product_id WHERE uid.installation_status = "completed" AND wad.company_id=?`;
    }


    // Add date filtering
    if (filter_by_date) {
        const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
        if (dateCondition) {
            Select_QUERY += ` AND uid.request_date_time ${dateCondition}`;
        }
    }

    //const Select_query = `SELECT uid.request_date_time, uid.contact_name, uid.contact_number, uid.contact_address, uid.installation_date, uid.installation_time, uid.installation_status, uid.other_details, lp.product_name, lp.category_title FROM user_installation_details uid JOIN warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric JOIN lp_product_list lp ON lp.product_id = wad.product_id WHERE uid.installation_status = "completed" AND wad.company_id=?`;

    db.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_QUERY, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(200).json({ message: 'Data not Found' });
            }
            total_count = Number(results.length);

            let data = {
                result: results,
                count: total_count
            }

            res.json(data);

        });

    });

});

app.post('/send_complete_installation_otp', async (req, res) => {
    let i = req.body;
    try {
        let test = 0;
        if (req.body.test) {
            test = req.body.test
        }
        let number = "" + i.phone_number;
        console.log(number);
        if (!number || number.length != 10) {
            console.log("num")
            return res.status(400).send("Invalid phone number, please enter 10 digits without +91 or 0")
        }
        let message = { message: 'OTP sent', otp: process.env.MOCK_OTP }
        // let number = '91' + i.phone_number;
        if (process.env.IS_MOCK_OTP === '0') {
            const sms_template_id = "63bd363ed6fc0537b36cc522";
            const response = await customerManager.sendOTP(number, "comp_install", test, sms_template_id); // can be passed without country code and as string
            console.log(response);
            message = response
        }
        res.send({ data: message });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error });
    }
});

app.post('/resend_complete_installation_otp', async (req, res) => {
    let i = req.body;
    try {
        let number = i.phone_number;
        if (!number || number.length != 10) {
            console.log("num")
            return res.status(400).send("Invalid phone number, please enter 10 digits without +91 or 0")
        }
        let message = 'OTP sent'

        if (process.env.IS_MOCK_OTP === '0') {
            const sms_template_id = "63bd363ed6fc0537b36cc522";
            const response = await customerManager.resendOTP(number, "comp_install", sms_template_id); // can be passed without country code and as string
            console.log(response);
            message = response

        }
        res.send({ data: message });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error });

    }
});


app.get('/lp_rejected_installation', verifyToken, (req, res) => {
    const { id } = req.user;

    const Select_query = `SELECT 
    uid.request_date_time, 
    uid.contact_name, 
    uid.contact_number, 
    uid.contact_address, 
    uid.installation_date, 
    uid.installation_time, 
    uid.installation_status,
    uid.other_details, 
    lp.product_name, 
    lp.category_title 
FROM 
    user_installation_details uid 
JOIN 
    warranty_availed_data wad ON wad.customer_id = uid.customer_id AND wad.alphanumeric = uid.alphanumeric 
JOIN 
    lp_product_list lp ON lp.product_id = wad.product_id 
WHERE 
    uid.installation_status = "rejected" AND wad.company_id=?`;

    db.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_query, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Data not Found' });
            }

            total_count = Number(results.length);

            let data = {
                result: results,
                count: total_count
            }

            res.json(data);
        });

    });

});

app.post('/update_lp_pending_installation', async (req, res) => {
    const id = req.body.id;
    const status = req.body.status;
    const contact_number = req.body.phone_number;
    const otp = req.body.otp;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        try {
            if (status == "completed") {
                var response = await customerManager.verifyOTP(contact_number, otp, "comp_install");
                if (response == "OTP verified") {
                    const update_query = `update user_installation_details set installation_status=? where id =?`;
                    connection.query(update_query, [status, id], (error, results) => {
                        if (error) {
                            console.error('Database error:', error);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        console.log(results);
                        res.status(200).json({ message: 'Updated Successfully  ' });
                    });
                } else {
                    res.status(200).json({ message: response });
                }

            } else if (status == "rejected") {
                console.log(status, "else status");
                const update_query = `update user_installation_details set installation_status=? where id =?`;
                connection.query(update_query, [status, id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Database error' });
                    } else {
                        console.log(results);
                        res.status(200).json({ message: 'Updated Successfully  ' });
                    }
                });

            }

        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }



    });
});
////////////under cunstruction///////////
app.patch('/update_lp_pending_installation_assignto', async (req, res) => {
    const id = req.body.id;
    const tex_id = req.body.id;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        try {
            const update_query = `update user_installation_details set installation_status=? where id =?`;
            connection.query(update_query, [status, id], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Database error' });
                }
                console.log(results);
                res.status(200).json({ message: 'Updated Successfully  ' });
            });
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }



    });
});

app.post('/add_technical_executive_details', verifyToken, async (req, res) => {
    const { id } = req.user;
    const { executive_details } = req.body;

    if (!executive_details || !Array.isArray(executive_details)) {
        return res.status(400).json({ message: 'Invalid executive details' });
    }

    try {
        const count_result = await executive_details_check(executive_details);
        // Get database connection
        db.getConnection(async (err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection from pool', err);
                return res.status(500).json({ message: 'Failed to get a database connection' });
            }

            if (count_result === 0) {
                const promises = executive_details.map(detail => {
                    return new Promise((resolve, reject) => {
                        const INSERT_QUERY = `INSERT INTO technical_executive_details (name, email, phone_number, rating, company_id) VALUES(?, ?, ?, ?, ?)`;
                        connection.query(INSERT_QUERY, [detail.name, detail.email, detail.phone_number, detail.rating, id], (err, result) => {
                            if (err) {
                                console.error('Error executing MySQL query', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });

                try {
                    await Promise.all(promises);
                    res.status(200).json({ message: 'Executives added successfully' });
                } catch (insertError) {
                    console.error('Error inserting executives', insertError);
                    res.status(500).json({ message: 'Failed to add some executives' });
                }
            } else {
                res.status(409).json({ message: 'Duplicate Entry' });
            }
            connection.release();
        });

    } catch (err) {
        console.error('Unexpected error', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

app.get('/technical_executive_details', verifyToken, (req, res) => {
    const { id } = req.user;

    const Select_query = `SELECT * FROM technical_executive_details WHERE company_id=?`;

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }


        connection.query(Select_query, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Data not Found' });
            }
            total_count = Number(results.length);

            let data = {
                result: results,
                count: total_count
            }

            res.json(data);
        });

    });
});


app.post('/submit_warranty_claim_form', jwtverifyToken, upload.single('image'), (req, res) => {
    const id = req.user;
    console.log(id);
    const { file } = req;
    const { product_id, company_id, warranty_start_date, warranty_end_date, reason, address, invoice } = req.body;
    const name = req.body.name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;

    if (!file) {
        return res.status(400).json({ message: 'Image file is required.' });
    }

    // Generate a unique warranty ID
    const warranty_id = "WBKJ" + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    console.log(warranty_id);


    const INSERT_QUERY = `INSERT INTO user_warranty_claim(warranty_id, address, reason, problem_image, customer_id, product_id, company_id, warranty_start, warranty_end, name, email, phone_number, invoice) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        // Consider storing the image as a file and saving the path instead of the buffer
        connection.query(INSERT_QUERY, [warranty_id, address, reason, file.buffer, id, product_id, company_id, warranty_start_date, warranty_end_date, name, email, phone_number, invoice], (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                return res.status(200).json({ message: 'Form Submitted' });
            }
        });
    });
});

app.post('/company_submit_warranty_claim_form', verifyToken, (req, res) => {
    const { id } = req.user;
    console.log(id);
    const { filter_by_category, filter_by_date, start_date, end_date } = req.body;
    var Select_QUERY;

    const filter_length = Number(filter_by_category?.length);


    if (filter_length > 0) {
        const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
        Select_QUERY = `SELECT uwc.id, uwc.warranty_id, uwc.created_on, uwc.name as owner_name, uwc.phone_number, uwc.email, uwc.invoice, uwc.address, uwc.reason, uwc.warranty_start, uwc.warranty_end, uwc.warranty_status, lp.product_name, lp.category_title, lp.product_image, uwc.problem_image FROM user_warranty_claim uwc JOIN lp_product_list lp ON uwc.product_id = lp.product_id AND uwc.company_id = lp.company_id WHERE uwc.company_id=? AND lp.category_title IN (${placeholders})`;
    } else {
        Select_QUERY = `SELECT uwc.id, uwc.warranty_id, uwc.created_on, uwc.name as owner_name, uwc.phone_number, uwc.email, uwc.invoice, uwc.address, uwc.reason, uwc.warranty_start, uwc.warranty_end, uwc.warranty_status, lp.product_name, lp.category_title, lp.product_image, uwc.problem_image FROM user_warranty_claim uwc JOIN lp_product_list lp ON uwc.product_id = lp.product_id AND uwc.company_id = lp.company_id WHERE uwc.company_id=?`;
    }


    // Add date filtering
    if (filter_by_date) {
        const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
        if (dateCondition) {
            Select_QUERY += ` AND uwc.created_on ${dateCondition}`;
        }
    }


    //const Select_query = `SELECT uwc.id, uwc.warranty_id, uwc.created_on, uwc.name as owner_name, uwc.phone_number, uwc.email, uwc.invoice, uwc.address, uwc.reason, uwc.warranty_start, uwc.warranty_end, uwc.warranty_status, lp.product_name, lp.category_title, lp.product_image, uwc.problem_image FROM user_warranty_claim uwc JOIN lp_product_list lp ON uwc.product_id = lp.product_id AND uwc.company_id = lp.company_id WHERE uwc.company_id=?`;

    db.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_QUERY, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(200).json({ message: 'Data not Found' });
            }
            total_count = Number(results.length);
            let data = {
                result: results,
                count: total_count
            }


            res.json(data);

        });

    });

});

app.post('/get_warranty_claim_by_id', (req, res) => {
    const id = req.body.id;

    const Select_query = `SELECT
    uwc.id,
    uwc.warranty_id, 
    uwc.created_on, 
    uwc.name as owner_name,
    uwc.phone_number,
    uwc.email,
    uwc.invoice, 
    uwc.address,
    uwc.reason,
    uwc.warranty_start,
    uwc.warranty_end,
    uwc.warranty_status, 
    lp.product_name, 
    lp.category_title,    
    lp.product_image,
    uwc.problem_image


FROM 
    user_warranty_claim uwc 
JOIN 
    lp_product_list lp ON uwc.product_id = lp.product_id AND uwc.company_id = lp.company_id
WHERE 
    uwc.id=?`;

    db.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_query, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Data not Found' });
            }

            res.json(results);
        });

    });

});

app.post('/update_warranty_claim_status_by_id', verifyToken, async (req, res) => {
    const { id } = req.user;
    const warranty_claim_id = req.body.id;
    const status = req.body.status;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        try {
            if (status) {
                const update_query = `update user_warranty_claim set warranty_status=? where id =? AND company_id=?`;
                connection.query(update_query, [status, warranty_claim_id, id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Database error' });
                    } else {
                        console.log(results);
                        res.status(200).json({ message: 'Updated Successfully  ' });
                    }
                });

            }

        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }



    });
});


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

function jwtverifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, JWT_SECRET, (jwtError, authData) => {
            if (jwtError) {
                return res.status(403).send({ message: 'authentication denied' });
            } else {
                req.user = authData.userId;
                console.log(authData, "jwtverifyToken")
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};

async function executive_details_check(executive_details) {
    let count = 0;

    for (const executive of executive_details) {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT * FROM technical_executive_details WHERE phone_number=? AND email=?',
                    [executive.phone_number, executive.email],
                    (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    }
                );
            });

            if (result.length > 0) {
                count++;
            }
        } catch (error) {
            console.error(`Error querying ${executive.name}: ${error.message}`);
        }
    }
    return count;
}

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


module.exports = app;
