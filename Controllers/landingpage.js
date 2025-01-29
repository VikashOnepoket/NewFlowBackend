const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const MicroService = require('../MicroServices/services');
const micro_service = new MicroService();

require('dotenv').config();


const app = express();

const db = require('../Database_connection/db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;


app.post('/user_register', (req, res) => {
    // const { name, phone, email, password } = req.body;
    const name = req.body.name
    const phone = req.body.phone
    const user_email = req.body.email
    const password = req.body.password
    const credit_limit = req.body.credit_limit
    const is_upgraded = "0";

    const INSERT_QUERY = `INSERT INTO landing_page_user (name, phone_number, email, password, credit_limit, is_upgraded) VALUES (?, ?, ?, ?, ?, ?)`;

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }


        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: 'Error hashing password' });
            }

            connection.query(
                `select email from landing_page_user WHERE email=?`, [user_email],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    } else {
                        if (result.length > 0) {
                            res.status(200).json({ message: 'User already registered' });
                        } else {
                            connection.query(INSERT_QUERY, [name, phone, user_email, hashedPassword, credit_limit, is_upgraded], (err, result) => {
                                connection.release();
                                if (err) {
                                    console.error('Error executing MySQL query', err);
                                    res.status(500).json({ message: 'Internal Server Error' });
                                } else {
                                    res.status(200).json({ message: 'User registered successfully' });
                                    return result;
                                }
                            });
                        }
                    }
                }
            );
        });
    });
});

// user_update endpoint
app.put('/user_update', (req, res) => {
    const { name, phone, company_name, industry, company_size, website_url, address, helpline_number, helpline_email} = req.body;
    const UPDATE_QUERY = `UPDATE landing_page_user SET company_name=?, industry=?, company_size=?, website_url=?, address=?, helpline_number=?, helpline_email=? WHERE name=? AND phone_number=?`;

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(UPDATE_QUERY, [company_name, industry, company_size, website_url, address, helpline_number, helpline_email, name, phone], (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.status(200).json({ message: 'All set for Login' });
                return result;
            }
        });
    });
});

// user_login endpoint
app.post('/user_login', (req, res) => {
    const { email, password } = req.body;

    const Select_QUERY = `select * from landing_page_user WHERE email=?`;
    //create db connection
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(Select_QUERY, [email], (err, result) => {
            if (err) {
                console.error('Error executing MySQL query', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.length === 0) {
                    res.send({ message: 'Invalid Credentials', status: false });
                } else {

                    const user = result[0];

                    // Check password
                    bcrypt.compare(password, user.password, (err, compareresult) => {
                        if (err) {
                            return res.status(401).json({ message: 'Invalid Credentials' });
                        }

                        if (!compareresult) {
                            console.log(compareresult);
                            return res.status(401).json({ message: 'Invalid Credentials' });
                        }

                        // Generate JWT token
                        const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '30m' });
                        res.status(200).json({ message: 'Login successfully', token: token, email: email });

                    });
                }
            }
        });
    });


});





module.exports = app;
