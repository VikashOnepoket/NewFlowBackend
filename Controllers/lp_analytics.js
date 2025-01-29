const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const JWT_SECRET = process.env.JWT_SECRET;

const db = require('../Database_connection/db');




//  analytics_count API endpoint
// app.get('/lp_analytics_count_old', verifyToken, (req, res) => {
//     const { id } = req.user;

//     const { filter_by_category, filter_by_date, start_date, end_date } = req.body;
//     var Select_QUERY;

//     const filter_length = Number(filter_by_category?.length);


//     if (filter_length > 0) {
//         const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
//         Select_QUERY = `SELECT uwc.id, uwc.warranty_id, uwc.created_on, uwc.name as owner_name, uwc.phone_number, uwc.email, uwc.invoice, uwc.address, uwc.reason, uwc.warranty_start, uwc.warranty_end, uwc.warranty_status, lp.product_name, lp.category_title, lp.product_image, uwc.problem_image FROM user_warranty_claim uwc JOIN lp_product_list lp ON uwc.product_id = lp.product_id AND uwc.company_id = lp.company_id WHERE uwc.company_id=? AND lp.category_title IN (${placeholders})`;
//     } else {
//         Select_QUERY = `SELECT uwc.id, uwc.warranty_id, uwc.created_on, uwc.name as owner_name, uwc.phone_number, uwc.email, uwc.invoice, uwc.address, uwc.reason, uwc.warranty_start, uwc.warranty_end, uwc.warranty_status, lp.product_name, lp.category_title, lp.product_image, uwc.problem_image FROM user_warranty_claim uwc JOIN lp_product_list lp ON uwc.product_id = lp.product_id AND uwc.company_id = lp.company_id WHERE uwc.company_id=?`;
//     }


//     // Add date filtering
//     if (filter_by_date) {
//         const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
//         if (dateCondition) {
//             Select_QUERY += ` AND lp_encoded_product.warranty_registered ${dateCondition}`;
//         }
//     }

//     const Select_Query_for_com_and_incom_scan = `select count(case when warranty = 'availed' then 1 end) as complete_scan,
//     count(case when warranty = 'unavailed' then 1 end) as incomplete_scan
//      from lp_encoded_product where factory_operator_id = ?`;


//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting MySQL connection from pool', err);
//             return res.status(500).json({ message: 'Failed to get a database connection' });
//         }

//         connection.query(Select_Query_for_com_and_incom_scan, [id], (error, result1) => {
//             if (error) {
//                 return res.status(500).json({ error: 'Database error' });
//             } else {

//                 const Select_Query_for_total_Scan = `SELECT count(*) as total_scan FROM total_qr_scans tqs JOIN lp_encoded_product lp ON tqs.fk_encoded_product_id = lp.id WHERE lp.factory_operator_id=?`;
//                 connection.query(Select_Query_for_total_Scan, [id], (error, result2) => {
//                     if (error) {
//                         return res.status(500).json({ error: 'Database error' });
//                     } else {
//                         const select_query_for_red_scan = `SELECT count(*) as red_scan FROM red_qr_scans rqs JOIN lp_encoded_product lp ON rqs.fk_encoded_product_id = lp.id WHERE lp.factory_operator_id=?`;
//                         connection.query(select_query_for_red_scan, [id], (error, result3) => {
//                             if (error) {
//                                 return res.status(500).json({ error: 'Database error' });
//                             } else {
//                                 const select_query_for_complete_data = `select wad.customer_id, wad.alphanumeric, wad.name, wad.phone_number, wad.email, wad.invoice, wad.created_on as availed_on, wad.purchased_from, pl.product_name, pl.model_number as product_model from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id where wad.company_id=?`;
//                                 connection.query(select_query_for_complete_data, [id], (error, result4) => {
//                                     if (error) {
//                                         return res.status(500).json({ error: `Database error` });
//                                     } else {
//                                         const select_query_for_incomplete_data = `select * from lp_encoded_product where warranty = "unavailed" and factory_operator_id =?`;
//                                         connection.query(select_query_for_incomplete_data, [id], (error, result5) => {
//                                             if (error) {
//                                                 return res.status(500).json({ error: `Database error` });
//                                             } else {
//                                                 let red = result2[0].total_scan - parseInt(result1[0].complete_scan + result1[0].incomplete_scan);

//                                                 const scans = {
//                                                     total_scan: result2[0].total_scan,
//                                                     complete_scan: result1[0].complete_scan,
//                                                     incomplete_scan: result1[0].incomplete_scan,
//                                                     red_scan: red,
//                                                     complete_scan_data: result4,
//                                                     incomplete_scan_data: result5

//                                                 };
//                                                 res.json(scans);
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         });
//                     }
//                 });


//             }

//             // const user = results[0];
//             // if (!user) {
//             //     return res.status(404).json({ error: 'User not found' });
//             // }
//             // res.json(user);
//         });
//     });
// });

app.post('/lp_analytics_count', verifyToken, (req, res) => {
    const { id } = req.user;

    const { filter_by_category, filter_by_product, filter_by_date, start_date, end_date } = req.body;

    const filter_length = Number(filter_by_category?.length);
    const filter_by_product_length = Number(filter_by_product?.length);


    let select_query_for_complete_data;


    if (filter_length > 0) {
        const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
        select_query_for_complete_data = `select wad.customer_id, wad.invoiceNumber, wad.alphanumeric, wad.name, wad.phone_number, wad.email, wad.invoice, wad.IP_city, wad.created_on as availed_on, wad.purchased_from, pl.product_name, pl.category_title, pl.model_number as product_model from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id where wad.company_id=? AND wad.dynamic_qr ="1" AND wad.invoiceNumber !='' AND pl.category_title IN (${placeholders})`;
    } else {
        select_query_for_complete_data = `select wad.customer_id, wad.invoiceNumber, wad.alphanumeric, wad.name, wad.phone_number, wad.email, wad.invoice, wad.IP_city, wad.created_on as availed_on, wad.purchased_from, pl.product_name, pl.category_title, pl.model_number as product_model from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id where wad.company_id=? AND wad.dynamic_qr ="1" AND wad.invoiceNumber !=''`;
    }

    if (filter_by_product_length > 0) {
        const placeholders_by_product = filter_by_product.map(item => `"${item}"`).join(", ");
        select_query_for_complete_data += ` AND pl.product_name IN (${placeholders_by_product})`;
    }


    // Add date filtering
    if (filter_by_date) {
        const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
        if (dateCondition) {
            select_query_for_complete_data += ` AND wad.created_on ${dateCondition}`;
        }
    }


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        connection.query(select_query_for_complete_data, [id], (error, result1) => {
            if (error) {
                console.log(error, "__1__")
                return res.status(500).json({ error: 'Database error' });
            } else {
                let complete_scan_count = Number(result1.length);

                const select_query_for_incomplete_data = `select lep.id, lep.alphanumeric, lep.product_id, lep.warranty, lep.serial_number, lep.print, pl.product_name from lp_encoded_product lep JOIN lp_product_list pl ON pl.product_id = lep.product_id where warranty = "unavailed" AND lep.dynamic_qr ="1" AND factory_operator_id =?`;
                connection.query(select_query_for_incomplete_data, [id], (error, result2) => {
                    if (error) {
                        console.log(error, "__2__")
                        return res.status(500).json({ error: `Database error` });
                    } else {
                        let incomplete_scan_count = Number(result2.length);

                        //filter for red scan
                        let select_query_for_red_scan;
                        if (filter_length > 0) {
                            const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
                            select_query_for_red_scan = `SELECT rqs.alphanumeric, rqs.scanned_at, pl.product_name, pl.category_title, lep.serial_number, wad.name, wad.email, wad.phone_number FROM red_qr_scans rqs LEFT JOIN lp_encoded_product lep ON rqs.fk_encoded_product_id = lep.id AND rqs.alphanumeric = lep.alphanumeric LEFT JOIN warranty_availed_data wad ON wad.product_id = lep.product_id AND wad.alphanumeric = lep.alphanumeric LEFT JOIN lp_product_list pl ON lep.factory_operator_id = pl.company_id AND lep.product_id = pl.product_id WHERE lep.factory_operator_id = ? AND pl.category_title IN (${placeholders})`;
                        } else {
                            select_query_for_red_scan = `SELECT rqs.alphanumeric, rqs.scanned_at, pl.product_name, pl.category_title, lep.serial_number, wad.name, wad.email, wad.phone_number FROM red_qr_scans rqs LEFT JOIN lp_encoded_product lep ON rqs.fk_encoded_product_id = lep.id AND rqs.alphanumeric = lep.alphanumeric LEFT JOIN warranty_availed_data wad ON wad.product_id = lep.product_id AND wad.alphanumeric = lep.alphanumeric LEFT JOIN lp_product_list pl ON lep.factory_operator_id = pl.company_id AND lep.product_id = pl.product_id WHERE lep.factory_operator_id = ?`;
                        }

                        if (filter_by_product_length > 0) {
                            const placeholders_by_product = filter_by_product.map(item => `"${item}"`).join(", ");
                            select_query_for_red_scan += ` AND pl.product_name IN (${placeholders_by_product})`;
                        }


                        // Add date filtering
                        if (filter_by_date) {
                            const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
                            if (dateCondition) {
                                select_query_for_red_scan += ` AND rqs.scanned_at ${dateCondition}`;
                            }
                        }

                        connection.query(select_query_for_red_scan, [id], (error, result3) => {
                            if (error) {
                                console.log(error, "__3__");
                                return res.status(500).json({ error: `Database error` });
                            } else {

                                let red_scan_count = Number(result3.length);

                                let select_query_for_pending_warranty;
                                if (filter_length > 0) {
                                    const placeholders = filter_by_category.map(item => `"${item}"`).join(", ");
                                    select_query_for_pending_warranty = `select wad.id, wad.customer_id, wad.invoiceNumber, wad.alphanumeric, wad.name, wad.phone_number, wad.email, wad.invoice, wad.IP_city, wad.created_on as availed_on, wad.purchased_from, pl.product_name, pl.category_title, pl.model_number as product_model from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id where wad.company_id=? AND wad.dynamic_qr ="1" AND wad.invoiceNumber = '' AND pl.category_title IN (${placeholders})`;
                                } else {
                                    select_query_for_pending_warranty = `select wad.id, wad.customer_id, wad.invoiceNumber, wad.alphanumeric, wad.name, wad.phone_number, wad.email, wad.invoice, wad.IP_city, wad.created_on as availed_on, wad.purchased_from, pl.product_name, pl.category_title, pl.model_number as product_model from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id where wad.company_id=? AND wad.dynamic_qr ="1" AND wad.invoiceNumber = ''`;
                                }

                                if (filter_by_product_length > 0) {
                                    const placeholders_by_product = filter_by_product.map(item => `"${item}"`).join(", ");
                                    select_query_for_pending_warranty += ` AND pl.product_name IN (${placeholders_by_product})`;
                                }


                                // Add date filtering
                                if (filter_by_date) {
                                    const dateCondition = getDateCondition(filter_by_date, start_date, end_date);
                                    if (dateCondition) {
                                        select_query_for_pending_warranty += ` AND wad.created_on ${dateCondition}`;
                                    }
                                }

                                console.log(select_query_for_pending_warranty);

                                connection.query(select_query_for_pending_warranty, [id], (error, result4) => {
                                    if (error) {
                                        console.log(error, "__4__");
                                        return res.status(500).json({ error: `Database error` });
                                    } else {

                                        let pending_scan_count = Number(result4.length);

                                        let total = parseInt(complete_scan_count + incomplete_scan_count + red_scan_count + pending_scan_count);

                                        let completeScanPercentage = ((complete_scan_count / total) * 100).toFixed(2);
                                        let incompleteScanPercentage = ((incomplete_scan_count / total) * 100).toFixed(2);
                                        let redScanPercentage = ((red_scan_count / total) * 100).toFixed(2);
                                        let pendingScanPercentage = ((pending_scan_count / total) * 100).toFixed(2);

                                        const scans = {
                                            completeScanPercentage,
                                            incompleteScanPercentage,
                                            redScanPercentage,
                                            pendingScanPercentage,
                                            total_scan: total,
                                            complete_scan: complete_scan_count,
                                            incomplete_scan: incomplete_scan_count,
                                            red_scan: red_scan_count,
                                            pending_scan: pending_scan_count,
                                            complete_scan_data: result1,
                                            incomplete_scan_data: result2,
                                            red_scan_data: result3,
                                            pending_scan_data: result4

                                        };
                                        res.json(scans);

                                    }

                                });
                            }
                        })

                    }

                    // const user = results[0];
                    // if (!user) {
                    //     return res.status(404).json({ error: 'User not found' });
                    // }
                    // res.json(user);
                });
            }
        });
    });
});

app.post('/update_pending_warranty', verifyToken, async (req, res) => {
    const { id } = req.user;
    const customer_id = req.body.customer_id;
    const w_id = req.body.w_id;
    const invoiceNumber = req.body.status;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        try {
            if (invoiceNumber) {
                const update_query = `update warranty_availed_data set invoiceNumber=? where customer_id =? AND company_id=? AND id=?`;
                connection.query(update_query, [invoiceNumber, customer_id, id, w_id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Database error' });
                    } else {
                        console.log(results);
                        res.status(200).json({ message: 'Approved!' });
                    }
                });

            }

        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }



    });
});


app.get('/single_qr_complete_scan', verifyToken, async (req, res) => {
    const { id } = req.user;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool', err);
            return res.status(500).json({ message: 'Failed to get a database connection' });
        }

        try {
            select_query_for_single_qr_complete_data = `select wad.customer_id, wad.invoiceNumber, wad.alphanumeric, wad.name, wad.phone_number, wad.email, wad.invoice, wad.IP_city, wad.created_on as availed_on, wad.purchased_from, pl.product_name, pl.category_title, pl.model_number as product_model from warranty_availed_data wad join lp_product_list pl on pl.product_id = wad.product_id where wad.company_id=? AND wad.dynamic_qr ="0"`;
            connection.query(select_query_for_single_qr_complete_data, [id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Database error' });
                    } else {
                        let count = Number(results.length);
                        const data = {
                            count,
                            results
                        }
                        res.status(200).json(data);
                    }
                });

        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }



    });
});




// function getDateCondition(filter_by_date, start_date, end_date) {
//     const today = new Date();
//     let startDate, endDate;

//     switch (filter_by_date) {
//         case 'this_month':
//             startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//             endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//             break;
//         case 'this_week':
//             startDate = new Date(today.setDate(today.getDate() - 7));
//             startDate.setHours(0, 0, 0, 0);

//             endDate = new Date(today.setDate(today.getDate() + 7));
//             endDate.setHours(23, 59, 59, 999);

//             break;
//         case 'yesterday':
//             startDate = new Date(today.setDate(today.getDate() - 1));
//             startDate.setHours(0, 0, 0, 0);

//             endDate = new Date(today.setDate(today.getDate()));
//             endDate.setHours(23, 59, 59, 999);
//             break;
//         case 'today':
//             startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
//             endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));

//             break;
//         case 'custom_date':
//             startDate = new Date(start_date);
//             endDate = new Date(end_date);
//             break;
//         default:
//             return null;
//     }

//     return `BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;
// }

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
