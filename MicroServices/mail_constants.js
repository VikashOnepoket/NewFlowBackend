
class MailConstants{
    Subject(product_name){
        let subject = `Warranty Registration Confirmation for Your ${product_name}`;
        return subject
    }
    Body(customer_name,product_brand,product_name,serial_number,warranty_period){
        let body='<h3>Dear '+customer_name+',</h3><span>Thank you for choosing '+product_brand+' and registering your warranty using OnePocket! We are delighted to inform you that your warranty registration has been successfully processed. Your satisfaction and peace of mind are our top priorities, and we are committed to providing you with excellent service throughout the warranty period.</span><br/><br/><span>Here are the details of your product registration:<br/> Product:'+product_name+'<br/>Serial Number:'+serial_number+'<br/>Warranty Period:'+warranty_period+'<br/><br/>To access your warranty details and manage your warranty, please visit our OnePocket dashboard by clicking on the following link: "https://dev-customer.onepoket.com".We recommend bookmarking this link for future reference. If you have any questions or need assistance, feel free to reach out to us on info@onepoket.com.<br/>Thank you once again for choosing '+product_brand+'.We value your trust and look forward to serving you in the future. If you have any feedback or suggestions, we would love to hear from you.<br/><br/>Best regards,<br/>Team Onepoket<span/>';
//         let body=`
// Dear ${customer_name},

// Thank you for choosing ${product_brand} and registering your warranty using OnePocket! We are delighted to inform you that your warranty registration has been successfully processed. Your satisfaction and peace of mind are our top priorities, and we are committed to providing you with excellent service throughout the warranty period.
        
// Here are the details of your product registration: 

// Product: ${product_name}
// Serial Number: ${serial_number}
// Warranty Period: ${warranty_period}
// To access your warranty details and manage your warranty, please visit our OnePocket dashboard by clicking on the following link: "https://dev-customer.onepoket.com"

// We recommend bookmarking this link for future reference. If you have any questions or need assistance, feel free to reach out to us on info@onepoket.com.

// Thank you once again for choosing ${product_brand}. We value your trust and look forward to serving you in the future. If you have any feedback or suggestions, we would love to hear from you.

// Best regards,
// Team Onepoket`;
        
        return body
    }
}

module.exports = MailConstants;