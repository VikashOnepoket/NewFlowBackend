const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const JWT_SECRET = process.env.JWT_SECRET;

const db = require('../Database_connection/db');
const CompanyRepository = require('../Repositories/company_repository');
const company_repo = new CompanyRepository();

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory as buffer
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});


// this API endpoint will upload logos
app.post('/upload_logo', verifyToken, upload.single('image'), (req, res) => {
    const { id } = req.user;
    const { file } = req;
    const title = req.body.title;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use the original filename if available
    const fileName = file.originalname || 'unknown';

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        // Save the image as a BLOB in the database
        connection.query('INSERT INTO image (name, image, company_id, title) VALUES (?, ?, ?, ?)', [fileName, file.buffer, id, title], (error) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(200).json({ message: 'File uploaded and saved to database' });
        });
    });
});

// this API endpoint will remove logos
app.delete('/delete_logo', verifyToken, (req, res) => {
    const { id } = req.user;
    const logo_id = req.body.id;


    // Use the original filename if available
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        if (logo_id) {
            connection.query('DELETE FROM image WHERE id= ? AND company_id=?', [logo_id, id], (error) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Database error' });
                } else {
                    res.status(200).json({ message: 'Logo removed successfully' });
                }
            });
        } else {
            res.status(400).json({ message: "Logo id is missing" })

        }
    });
});

// this API endpoint will fetch all logo
app.get('/get_all_logo', verifyToken, (req, res) => {
    const { id } = req.user;
    console.log(id);

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }


        connection.query('SELECT * FROM image WHERE company_id = ?', [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Image not found' });
            }


            const images = results.map(image => ({
                id: image.id,
                title: image.title,
                image: `data:image/jpeg;base64,${image.image.toString('base64')}` // Convert binary data to Base64
            }));

            res.json(images); // Send images as JSON
        });

    });
});


app.post('/lp_get_credits_transactions_details', verifyToken, (req, res) => {
    const { id } = req.user;
    let total_count = 0;
    let total_page = 0;

    const { filter_by_category, filter_by_date, start_date, end_date } = req.body;
    var Select_QUERY;

    const filter_length = Number(filter_by_category?.length);


    if (filter_length > 0) {
        const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
        Select_QUERY = `SELECT DATE_FORMAT(cqc.created_on, '%Y-%m-%d %H:%i:%s') as datetime, cqc.transaction_remarks as remarks, CASE WHEN cqc.is_debited = 1 THEN amount ELSE 0 END AS debit, CASE WHEN cqc.is_credited = 1 THEN amount ELSE 0 END AS credit, cqc.remaining_credits as running_balance, lp_product_list.product_name, lp_product_list.category_title FROM company_qr_credits cqc join lp_product_list on cqc.product_id = lp_product_list.product_id WHERE business_id = ? AND lp_product_list.category_title IN (${placeholders})`;
    } else {
        Select_QUERY = `SELECT DATE_FORMAT(cqc.created_on, '%Y-%m-%d %H:%i:%s') as datetime, cqc.transaction_remarks as remarks, CASE WHEN cqc.is_debited = 1 THEN amount ELSE 0 END AS debit, CASE WHEN cqc.is_credited = 1 THEN amount ELSE 0 END AS credit, cqc.remaining_credits as running_balance, lp_product_list.product_name, lp_product_list.category_title FROM company_qr_credits cqc join lp_product_list on cqc.product_id = lp_product_list.product_id WHERE business_id = ?`;
    }

    


    // Add date filtering
    if (filter_by_date) {
        const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
        if (dateCondition) {
            Select_QUERY += ` AND cqc.created_on ${dateCondition}`;
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
            const pageSize = req.body.items_per_page || 20; // Number of blogs per page

            total_page = Math.ceil(total_count / pageSize);

            let data = {
                results,
                total_count,
                total_page,
            }

            res.status(200).json(data);

        });

    });

})


//incomplete
app.post('/lp_forget_password', verifyToken, (req, res) => {
    const { id } = req.user;
    const password = req.body.password;
    const repassword = req.body.repassword;


    if(password != repassword){
        return res.status(400).json({message: 'Password should match'});
    }

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        // Save the image as a BLOB in the database
        connection.query('UPDATE table <table_name> set password = ?', [password], (error) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(200).json({ message: 'success msg' });
        });
    });
});

//incomplete
app.post('/lp_send_password_resend_mail', verifyToken, (req, res) => {
    const { id } = req.user;
    const email = req.body.email;


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        // Save the image as a BLOB in the database
        connection.query('UPDATE table <table_name> set password = ?', [password], (error) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(200).json({ message: 'success msg' });
        });
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
