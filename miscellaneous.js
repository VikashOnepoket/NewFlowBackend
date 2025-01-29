// app.post('/edit_company',upload.fields([{name: 'avatarUrl', maxCount: 1}]),(req,res)=>{
//     let i = req.body;
//     // let accessToken = i.token
//     // var id
//     // jwt.verify(accessToken,JWT_SECRET,function(err,decoded){
//     //     if(err){
//     //         console.log(err)
//     //     }
//     //     else{
//     //         id=decoded.userId
//     //     }
//     // })
//     console.log(i)
//     let avatarUrl=""
//     console.log(req.files)
//     console.log(req.files.avatarUrl[0].filename)
//     if(req.files){
//         avatarUrl="https://dev-api.billfy.in/pictures/"+req.files.avatarUrl[0].filename

//     db.query("update company_details set address=?,avatarUrl=?,display_name=?,owner_name=?,phone=? where business_id=?",
//     [i.address,avatarUrl,i.display_name,i.owner_name,i.phone,i.business_id],(err,result)=>{
//         if(err){
//             console.log(err);
//             res.send(err);
//         }
//         else{

//             db.query("select c.* ,b.email from company_details c,business_user b where b.business_id=c.business_id and b.business_id=?",[i.business_id],(err,result2)=>{
//                 if(err){
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else{
//                     console.log(result2)
//                     res.send(result2[0]);
//                 }
//             })
//         }
//     })
// }
//     else{
//         db.query("update company_details set address=?,display_name=?,owner_name=?,phone=? where business_id=?",
//         [i.address,i.display_name,i.owner_name,i.phone,i.business_id],(err,result)=>{
//         if(err){
//             console.log(err);
//             res.send(err);
//         }
//         else{
//             console.log(i.id)
//             db.query("select * from company_details where business_id=?",[i.business_id],(err,result2)=>{
//                 if(err){
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else{
//                     console.log(result2)
//                     res.send(result2[0]);
//                 }
//             })
//         }
//     })
//     }
// })
// app.post('/distributor_profile_creation', (req, res) => {
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'

//     let i = req.body

//     let accessToken = i.token
//     var c_id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             c_id = decoded.userId
//         }
//     })

//     let role = "distributor"
//     db.query("INSERT INTO business_user(email,password,role) values (?,?,?)", [i.email, i.password, role], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             db.query("SELECT * from business_user where email=? and password=?", [i.email, i.password], (err, result1) => {
//                 if (err) {
//                     console.log(err)
//                 }
//                 else {
//                     let id = result1[0].business_id
//                     db.query("INSERT INTO distributor_details(enterprise_name,phone,address,GST_no,PAN,owner_name,pincode,state,aadhar_no,business_id,company,city) values (?,?,?,?,?,?,?,?,?,?,?,?)",
//                         [i.enterprise_name, i.phone, i.address, i.GST_no, i.PAN, i.owner_name, i.pincode, i.state, i.aadhar_no, id, c_id, i.city], (err, result) => {
//                             if (err) {
//                                 console.log(err)
//                             }
//                             else {
//                                 db.query("select b.email,b.password, d.enterprise_name, d.phone,d.address,d.GST_no,d.PAN,d.owner_name,d.pincode,d.state,d.aadhar_no,d.business_id,d.total_sales,d.sales_percentage,d.company,d.city from business_user b, distributor_details d where b.business_id=d.business_id and b.role='distributor' order by b.business_id desc limit 1", (err, result5) => {
//                                     if (err) {
//                                         res.send({ message: "Error" })
//                                     }
//                                     else {
//                                         res.send(result5[0])
//                                     }

//                                 })
//                             }
//                         })
//                 }

//             })

//         }
//     })

// })
// app.post('/distributor_profile_delete', (req, res) => {
//     let i = req.body
//     db.query("DELETE FROM business_user where business_id=?", [i.id], (err, result) => {
//         if (err) {
//             console.log(err)
//             res.send({ message: "Error" })
//         }
//         else {
//             db.query("DELETE FROM distributor_details where business_id=?", [i.id], (err, result2) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     res.send({ message: "Distributor deleted" })
//                 }
//             })

//         }
//     })
// })
// app.post('/distributor_data', (req, res) => {
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let i = req.body
//     // let cookie = req.cookies
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//         }
//     })
//     console.log(id)
//     db.query("Select b.email,d.* from business_user b, distributor_details d where b.business_id=? and d.business_id=?", [id, id], (err, result) => {
//         if (err) {
//             res.send({ message: "Error" })
//         }
//         else {
//             res.send(result[0])
//         }
//     })
// })
// app.post('/distributor_profile_update', (req, res) => {
//     let i = req.body

//     db.query("UPDATE distributor_details SET enterprise_name=?,phone=?,address=?,GST_no=?,PAN=?,owner_name=?,pincode=?,state=?,aadhar_no=?,city=? WHERE business_id=?",
//         [i.enterprise_name, i.phone, i.address, i.GST_no, i.PAN, i.owner_name, i.pincode, i.state, i.aadhar_no, i.city, i.business_id], (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 db.query("UPDATE business_user SET email=?, password=? where business_id=?", [i.email, i.password, i.business_id], (err, result2) => {
//                     if (err) {
//                         res.send({ message: "Error" })
//                     }
//                     else {
//                         db.query("select b.email,b.password, d.enterprise_name, d.phone,d.address,d.GST_no,d.PAN,d.owner_name,d.pincode,d.state,d.aadhar_no,d.business_id,d.total_sales,d.sales_percentage,d.company,d.city from business_user b, distributor_details d where b.business_id=d.business_id and b.business_id=?", [i.business_id], (err, result5) => {
//                             if (err) {
//                                 res.send({ message: "Error" })
//                             }
//                             else {
//                                 res.send(result5[0])
//                             }

//                         })
//                     }
//                 })

//             }
//         })

// })

// app.post('/add_product',upload.fields([{name: 'productImage', maxCount: 10}]),(req,res)=>{
//     console.log(req)
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let i = req.body
//     console.log(i)
//     console.log(i.category)
//     // if(i.category){
//     //     i.category=JSON.parse(i.category)

//     // }
//     let category = []
//     if(typeof(i.category)=='string'){
//         category[0] = JSON.parse(i.category)
//     }
//     else{
//         for(let j=0;j<i.category.length;j++){
//             category.push(JSON.parse(i.category[j]))
//         }
//     }
//     let warranty = []
//     if(typeof(i.warranty)=='string'){
//         warranty[0] = JSON.parse(i.warranty)
//     }
//     else{
//         for(let j=0;j<i.warranty.length;j++){
//             warranty.push(JSON.parse(i.warranty[j]))
//         }
//     }
//     let additionalInfo = []
//     if(typeof(i.additionalInfo)=='string'){
//         additionalInfo[0] = JSON.parse(i.additionalInfo)
//     }
//     else{
//         for(let j=0;j<i.additionalInfo.length;j++){
//             additionalInfo.push(JSON.parse(i.additionalInfo[j]))
//         }
//     }
//     let video = []
//     if(typeof(i.video)=='string'){
//         video[0] = JSON.parse(i.video)
//     }
//     else{
//         for(let j=0;j<i.video.length;j++){
//             video.push(JSON.parse(i.video[j]))
//         }
//     }
//     let img
//     if(req.body.productImage){
//         img= req.body.productImage
//     }
//     else{
//         img=""
//     }
//     //let i = JSON.parse(req.body)
//     // let i = req.body
//     let accessToken = i.token
//     // i.category=JSON.parse(i.category)
//     // i.warranty=JSON.parse(i.warranty)
//     // i.additioalInfo=JSON.parse(i.additionalInfo)
//     var company_id
//     jwt.verify(accessToken,JWT_SECRET,function(err,decoded){
//         if(err){
//             console.log(err)
//         }
//         else{
//             company_id=decoded.userId
//         }
//     })
//     var showManufactureDate
//     if(i.showManufactureDate=='true'){
//         showManufactureDate=true
//     }
//     else{
//         showManufactureDate=false
//     }
//     let date = new Date()
//     db.query("INSERT INTO product_list(product_name,added_at,product_description,product_model,quantity,company_id,showManufactureDate) VALUES (?,?,?,?,?,?,?)",
//     [i.product_name,date,i.productDescription,i.productModel,0,company_id,showManufactureDate],(err,result)=>{
//         if(err){
//             console.log(err)
//             res.send({message:"Error in data"})
//         }
//         else{
//             console.log({message:"Data saved"})
//             db.query("SELECT id FROM product_list where company_id=? order by id desc limit 1",[company_id],(err,result1)=>{
//                 if(err){
//                     res.send({message:"Error in id"})
//                 }
//                 else{
//                     let id = result1[0].id
//                     for(let j of warranty){
//                         db.query("INSERT INTO warranty(product_id,name,year,month) values (?,?,?,?)",
//                         [id,j.name,j.year,j.month],(err,result3)=>{
//                             if(err){
//                                 res.send({message:"Error in warranty"})
//                             }
//                             else{
//                                 console.log({message:"Data saved"})
//                             }
//                         })
//                     }
//                     for(let j of category){

//                         db.query("INSERT INTO product_category(product_id,title,description) values (?,?,?)",
//                         [id,j.title,j.description],(err,result4)=>{
//                             if(err){
//                                 res.send({message:"Error in product category"})
//                             }
//                             else{
//                                 console.log({message:"Product added"})
//                             }
//                         })
//                     }
//                     for(let j of additionalInfo){

//                         db.query("INSERT INTO additional_info(product_id,title,description) values (?,?,?)",
//                         [id,j.title,j.description],(err,result)=>{
//                             if(err){
//                                 res.send({message:"Error in additional info"})
//                             }
//                             else{
//                                 console.log({message:"additional info added"})
//                             }
//                         })
//                     }
//                     for(let j of video){

//                         db.query("INSERT INTO product_videos(product_id,video) values (?,?)",
//                         [id,j.video],(err,result)=>{
//                             if(err){
//                                 res.send({message:"Error in video"})
//                             }
//                             else{
//                                 console.log({message:"video added"})
//                             }
//                         })
//                     }
//                     for(let j of req.files.productImage){
//                         console.log(j.url)
//                         micro_service.AddImage(j,"product")
//                         .then((p_img)=>{
//                             db.query("Insert into product_image(product_id,image) values (?,?)",[id,p_img],(err,result)=>{
//                                 if(err){
//                                     console.log(err)
//                                     res.send({message:"Error in product image"})
//                                 }
//                                 else{
//                                     console.log({message:"Picture inserted"})
//                                 }
//                             })
//                         })
//                         .catch((err)=>{
//                             console.log(err)
//                         })
//                         // let p_img="https://dev-api.billfy.in/pictures/"+j.filename

//                     }
//                 }
//             })
//         }
//     })

//     setTimeout(()=>{res.send("Product added")},200)
// })
// app.post('/create_gatekeeper_profile', (req, res) => {
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'

//     let i = req.body

//     let accessToken = i.token
//     var c_id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             c_id = decoded.userId
//         }
//     })
//     db.query("INSERT INTO gateKeeper_user(email,password,factory_id,factory_name,company_id,name) values (?,?,?,?,?,?)",
//         [i.email, i.password, i.factory_id, i.factory_name, c_id, i.name], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send({ message: "Error" });
//             }
//             else {
//                 db.query("select * from gateKeeper_user order by id desc limit 1", (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         res.send(result2[0])
//                     }
//                 })
//                 // res.send({message:"Gatekeeper created!"})
//             }
//         })
// })
// app.post('/edit_gatekeeper_profile', (req, res) => {
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'

//     let i = req.body


//     db.query("update gateKeeper_user set email=?,password=?,name=?,factory_id=?,factory_name=? where id=?",
//         [i.email, i.password, i.name, i.factory_id, i.factory_name, i.id], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send({ message: "Error" });
//             }
//             else {
//                 db.query("select * from gateKeeper_user where id=?", [i.id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         res.send(result2[0])
//                     }
//                 })
//                 // res.send({message:"Gatekeeper updated!"})
//             }
//         })
// })
// app.post('/fetch_gateKeeper', (req, res) => {
//     let i = req.body;
//     let accessToken = i.token
//     var company_id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             company_id = decoded.userId
//         }
//     })
//     db.query("SELECT * from gateKeeper_user where company_id=?", [company_id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send(result);
//         }
//     })
// })
// app.post('/delete_gateKeeper', (req, res) => {
//     let i = req.body;
//     db.query("DELETE FROM gateKeeper_user where id=?", [i.id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send({ message: "gatekeeper deleted" });
//         }
//     })
// })
// app.post('/distributor_list', (req, res) => {
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'

//     let i = req.body

//     let accessToken = i.token
//     var c_id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             c_id = decoded.userId
//         }
//     })
//     if (i.keyword == "") {
//         db.query("select b.email,b.password, d.enterprise_name, d.phone,d.address,d.GST_no,d.PAN,d.owner_name,d.pincode,d.state,d.aadhar_no,d.business_id,d.total_sales,d.sales_percentage,d.company,d.city from business_user b, distributor_details d where b.business_id=d.business_id and d.company=?", [c_id], (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 res.send(result)
//             }
//         })
//     }
//     else {
//         db.query("select b.email,b.password, d.enterprise_name, d.phone,d.address,d.GST_no,d.PAN,d.owner_name,d.pincode,d.state,d.aadhar_no,d.business_id,d.total_sales,d.sales_percentage,d.company,d.city from business_user b, distributor_details d where b.business_id=d.business_id and d.company=? and d.business_id in (select business_id from distributor_details where ? in (enterprise_name,phone,address,GST_no,PAN,owner_name,pincode,state,aadhar_no,total_sales,sales_percentage,company,city))", [c_id, i.keyword], (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 res.send(result)
//             }
//         })
//     }
// })
// app.post('/distributor_details', (req, res) => {
//     let i = req.body

//     db.query("select b.email, d.enterprise_name, d.phone,d.address,d.GST_no,d.PAN,d.owner_name,d.pincode,d.state,d.aadhar_no,d.business_id,d.total_sales,d.sales_percentage,d.company,d.city from business_user b, distributor_details d where b.business_id=? and d.business_id=?", [i.id, i.id], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             res.send(result)
//         }
//     })
// })
// app.post('/map_warranty', (req, res) => {
//     let i = req.body
//     db.query("UPDATE warranty SET purchase_date=?,warranty_end_date=?,customer_id=? WHERE product_id=?",
//         [new Date(i.purchase_date), new Date(i.warranty_end_date), i.customer_id, i.product_id], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "Error" })
//             }
//             else {
//                 res.send({ message: "Warranty mapped for the customer." })
//             }
//         })
// })
// app.get('/warranty_product_list', (req, res) => {
//     let i = req.query
//     db.query("select c.display_name,p.product_name,p.image,p.id,w.id as warranty_id from company_details c, product_list p,warranty w where c.business_id=p.company_id and p.id in(select product_id from warranty where customer_id=?)",
//         [i.customer_id], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "Error" })
//             }
//             else {
//                 res.send(result)
//             }
//         })
// })
// app.get('/warranty_product_details', (req, res) => {
//     let i = req.query
//     db.query("select p.product_name,p.product_price,p.product_description,p.image,w.purchase_date,w.warranty_end_date from product_list p,warranty w where p.id in(select product_id from warranty where id=?)",
//         [i.warranty_id], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "Error" })
//             }
//             else {
//                 res.send(result)
//             }
//         })
// })
// app.post('/add_warranty', (req, res) => {
//     let i = req.body
//     db.query('SELECT id FROM product_list where product_model=?', [i.product_model], (err, result) => {
//         if (err) {
//             console.log(err)
//             res.send({ message: "Error" })
//         }
//         else {
//             var product_id = result[0].id
//             db.query("INSERT INTO warranty(product_id,purchase_date,warranty_end_date,customer_id) VALUES (?,?,?,?)",
//                 [product_id, new Date(i.purchase_date), new Date(i.warranty_end_date), i.customer_id], (err, result1) => {
//                     if (err) {
//                         console.log(err)
//                         res.send({ message: "Error" })
//                     }
//                     else {
//                         res.send({ message: "Warranty added!" })
//                     }
//                 })
//         }
//     })
// })
// app.post('/gateKeeper_login',(req,res)=>{
//     const JWT_VALIDITY = '7d'
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let i = req.body
//     db.query("SELECT * FROM gateKeeper_user where email=? and password=?",
//     [i.email,i.password],(err,result)=>{
//         if(err){
//             console.log(err)
//         }

//         else if(result.length<1){
//             res.send({message:"Gatekeeper not registered"})
//         }
//         else{
//             var accessToken = jwt.sign({ userId: result[0].id }, JWT_SECRET, {
//                 expiresIn: JWT_VALIDITY,
//               });
//               res
//               .cookie("accessToken",accessToken,{
//                 httpOnly:true,

//               })
//               .status(200)
//               .json({
//                 accessToken,
//                 user: {
//                   id: result[0].id,
//                   name: result[0].name,
//                   company_id: result[0].company_id,
//                   email:result[0].email,
//                   enterprise_name:result[0].enterprise_name
//                 },
//               },)
//         }
//     })
// })


// app.post('/distributor_request', (req, res) => {
//     let i = req.body
//     db.query("INSERT INTO company_requests(distributor_id,product_id,company_id,quantity) VALUES (?,?,?,?)",
//         [i.distributor_id, i.product_id, i.company_id, i.quantity], (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 res.send({ message: "Request sent!" })
//             }
//         })
// })
// function generateTableRow(doc, x, y, c1, c2) {
//     doc.fontSize(10)
//         .image(c1, 50, y)
//         .image(c2, 100, y)
    // .text(c3, 280, y, { width: 90, align: 'right' })
    // .text(c4, 370, y, { width: 90, align: 'right' })
    // .text(c5, 0, y, { align: 'right' });
// }
// function pdf(result2){
//     let QRTableTop = 330;
//     console.log(result2[0].qr_image)
//     const doc = new PDFDocument();
//     let alpha = random.randomAlphanumeric(5);
//     let name = alpha+'.pdf'
//     let path="/var/www/pdf/"+name
//     doc.pipe(fs.createWriteStream(path));

//     for(let j=0;j<result2.length;j++){
//         console.log(result2[j].qr_image)
//         let ab = result2[j].qr_image.split('/')
//         let target = '/var/www/qr/'+ab[4];
//         console.log(target)
//         doc.image(target,{
//             fit:[350,350],
//             align:'center',
//             valign:'center'
//         })
//         // let sequence_alpha=result2[j].alphanumeric
//         // doc.text(sequence_alpha,150,400)
//         // let url="https://billfy-verify.netlify.app/"+sequence_alpha
//         // doc.text(url,150,450)
//         if(j!=result2.length-1){
//             doc.addPage();
//         }


//     }
//     doc.end()
//     let response = "https://api-dev.billfy.in/pdf/"+name
//     // let response = name
//     return response;
// }
// const again = (product_id,serial_number) => {
//     let alpha = random.randomAlphanumeric(10);
//     db.query("insert into encoded_qr(alphanumeric,product_id,serial_number) values (?,?,?)",[alpha,product_id,serial_number],(err,result)=>{
//         if(err){
//             again(product_id);
//         }
//         else{
//             console.log(result);
//             console.log("inserted")
//             return;
//         }
//     })
// }
// var alphanumeric = async (quantity,serial_no,factory_operator_id,product_id) =>{
//     return new Promise((resolve,reject)=>{
//         console.log("alpha")
//         db.query("select id from QR order by id desc limit 1",(err,result2)=>{
//             if(err){
//                 console.log(err)

//             }
//             else{
//                 console.log(result2)
//                 let starting_id = result2[0].id
//                 console.log(starting_id)
//         for(let j=1;j<=quantity;j++){
//             let serial_number = parseInt(serial_no)+j-1;
//             let alpha = random.randomAlphanumeric(10);
//             db.query("insert into encoded_product(alphanumeric,product_id,serial_number) values (?,?,?)",[alpha,product_id,serial_number],(err,result)=>{
//                 if(err){
//                     console.log("trying again")
//                     again(product_id,serial_number)

//                 }
//                 else{ 

//                     console.log(result);
//                     console.log("inserted")
//                     let filename='/var/www/qr/P'+alpha+'.png'
//                     let path='https://api-dev.billfy.in/qr/P'+alpha+'.png'
//                     // let data = "https://billfy.in/"+alpha
//                     // let data = "https://billfy-verify.netlify.app/"+alpha
//                     let data = "https://dev.billfy.in/registration/"+alpha
//                     QRCode.toFile(filename,data)
//                         .then(qr=>{
//                             db.query("insert into QR(product_id,qr_image,factory_operator_id,serial_number) values (?,?,?,?)",[product_id,path,factory_operator_id,serial_number],(err,result)=>{
//                                 if(err){
//                                     console.log(err)
//                                 }
//                                 else{
//                                     console.log("QR inserted"+j);
//                                     console.log(quantity)
//                                 console.log(j)
//                                 if(j==(quantity)){
//                                     return resolve(starting_id);
//                                 }
//                                 }
//                             })

//                         })

//                 }

//             })
//         }
//     } })
//     })


// }
// app.post('/print_QR',async (req,res)=>{
//     let i = req.body;
//     alphanumeric(i.quantity,i.serial_no,i.factory_operator_id,i.product_id).then((starting_id)=>{
//         console.log("moving forward")
//         console.log(starting_id)
//         db.query("select qr_image from QR where id>?",[starting_id],(err,result2)=>{
//             if(err){
//                 console.log(err)
//             }
//             else{

//                 console.log(result2)
//                 var response = pdf(result2)
//                 console.log(response)
//                 // let filePath = '/var/www/pdf/'+response;
//                 // res.sendFile(response,{ root:filePath}, function (err) {
//                 //     if (err) {
//                 //         console.log(err);
//                 //     } else {
//                 //         console.log('Sent:', response);
//                 //     }
//                 // });
//                 res.send(response)
//                 // let filePath = '/var/www/pdf/'+response;
//                 // res.send(response)
//                 // res.download(filePath)
//                 // res.attachment(filePath)
//                 // var data =fs.readFileSync(response);
//                 // res.contentType("application/pdf");
//                 // res.send(data)
//                 // res.download(response);
//                 // res.download(path.join('/var/www/pdf/',response),(err)=>{
//                 //     console.log(err)
//                 // })
//                 // console.log("downloaded");
//                 // res.download(response)
//                 // res.sendFile(path.join(__dirname,'../../../var/www/pdf',response));
//             }
//         })
//     }).catch((error)=>{
//         console.log(error)
//     }) 
// })
// app.post('/isWarrantyAvailed',(req,res)=>{
//     let i = req.body;
//     db.query("select product_id,warranty,serial_number from encoded_product where alphanumeric=?",[i.alphanumeric],(err,result)=>{
//         if(err){
//             console.log(err);
//             res.send(err);
//         }
//         else{
//             db.query("select pl.product_name,pl.product_description,pl.product_shipping_weight,pi.image,w.year,w.month,pa.title,pa.description from product_list pl, product_image pi,warranty w,additional_info pa where pa.product_id=pl.id and w.product_id=pl.id and pi.product_id=pl.id and pl.id=?",[result[0].product_id],(err,result1)=>{
//                 if(err){
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else{
//                     result1[0].warranty=result[0].warranty;
//                     if(result[0].warranty=="unavailed"){
//                         db.query("update encoded_product set warranty=? where alphanumeric=?",["availed",i.alphanumeric],(err,result2)=>{
//                             if(err){
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else{
//                                 console.log("Updated")
//                             }
//                         })
//                     }
//                     result1[0].serial_number=result[0].serial_number
//                     res.send(result1[0]);
//                 }
//             })
//         }
//     })
// })
// app.post('/print_QR',(req,res)=>{
//     let i = req.body
//     db.query("select id from QR where gateKeeper_id=? order by id desc limit 1",[i.gateKeeper_id],async (err,result)=>{
//         let id=parseInt(result[0].id)
//         console.log(id);
//         let data = '{\n"product_id":'+JSON.stringify(+i.product_id)+',\n"gateKeeper_id":'+JSON.stringify(+i.gateKeeper_id)+'\n}';
//         //let data = JSON.parse("product_id:"+i.product_id)
//         let quantity = parseInt(i.quantity)
//         for(let j=0;j<quantity;j++){
//             console.log(id+1+j)
//             let file=id+1+j;
//             var filename='/var/www/qr/P'+file+'.png'
//             var path='https://api-dev.billfy.in/qr/P'+file+'.png'
//             await QRCode.toFile(filename,data)
//                 .then(qr=>{
//                     db.query("insert into QR(product_id,qr_image,gateKeeper_id) values (?,?,?)",[i.product_id,path,i.gateKeeper_id],(err,result1)=>{
//                         if(err){
//                             console.log(err)
//                         }
//                         else{
//                             console.log("QR inserted"+j);
//                             if(j==quantity-1){
//                                 db.query("select qr_image from QR where id>?",[id],async (err,result2)=>{
//                                     if(err){
//                                         console.log(err)
//                                     }
//                                     else{
//                                         // res.send(result2)
//                                         console.log(result2)
//                                         var response = pdf(result2)
//                                         console.log(response)
//                                         res.send(response)
//                                         // const doc = new PDFDocument();
//                                         // let path="/var/www/pdf/output.pdf"
//                                         // doc.pipe(fs.createWriteStream(path));
//                                     }
//                                 })
//                             }
//                         }
//                     })
//                 })
//                 .catch(err=>{
//                     console.log("QR error");
//                 })

//             console.log(j);

//         }
//         // .then()

//     })

// })
// router.post('/print_QR',QR_controller.print_QR)
// app.post('/create_pdf', (req, res) => {
//     const doc = new PDFDocument();
//     let path = "/var/www/pdf/output.pdf"
//     doc.pipe(fs.createWriteStream(path));

//     doc.image('/var/www/qr/P310.png', {
//         fit: [250, 300],
//         align: 'center',
//         valign: 'center'
//     });
//     doc.end()
//     res.send({ message: "https://api-dev.billfy.in/pdf/output.pdf" })
// })
// app.post('/add_company_category', (req, res) => {
//     let i = req.body
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let cookie = req.cookies
//     // console.log(cookie.accessToken)

//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     db.query("INSERT INTO company_categories(business_id,title,description) values(?,?,?)",
//         [id, i.title, i.description], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "error" })
//             }
//             else {
//                 res.send({ message: "Category inserted" })
//             }
//         })
// })
// app.post('/edit_company_category', (req, res) => {
//     let i = req.body

//     db.query("UPDATE company_categories SET title=?,description=? WHERE id=?",
//         [i.title, i.description, i.id], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "error" })
//             }
//             else {
//                 res.send({ message: "Category updated" })
//             }
//         })
// })
// app.post('/get_company_category', (req, res) => {
//     let i = req.body
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let cookie = req.cookies
//     // console.log(cookie.accessToken)

//     let accessToken = i.token
//     console.log(accessToken)
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     db.query("SELECT * FROM company_categories where business_id=?",
//         [id], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "error" })
//             }
//             else {
//                 res.send(result)
//             }
//         })
// })
// app.post('/delete_company_category', (req, res) => {
//     let i = req.body

//     db.query("DELETE FROM company_categories WHERE id=?",
//         [i.id], (err, result) => {
//             if (err) {
//                 console.log(err)
//                 res.send({ message: "error" })
//             }
//             else {
//                 res.send({ message: "Category deleted" })
//             }
//         })
// })
// app.get('/product_category', (req, res) => {
//     let i = req.body
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let cookie = req.cookies
//     // console.log(cookie.accessToken)

//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     console.log(id)
//     db.query("SELECT category from company_categories where business_id=?", [id], (err, result) => {
//         if (err) {
//             res.send({ message: "Error" })
//         }
//         else {
//             res.send(result)
//         }
//     })
// })
// app.post('/company_order', (req, res) => {
//     let i = req.body
//     db.query("INSERT INTO company_orders(distributor_id,product_id,company_id,quantity) VALUES (?,?,?,?)",
//         [i.distributor_id, i.product_id, i.company_id, i.quantity], (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 res.send({ message: "Order approved!" })
//             }
//         })
// })
// app.post('/register_customer', upload.fields([{ name: 'avatarUrl', maxCount: 1 }]), (req, res) => {
//     let i = req.body;
//     let avatarImage = "https://api-dev.billfy.in/pictures/" + req.files.avatarUrl[0].filename
//     db.query("insert into customerSeller_user(role,phone_number) values (?,?)", ["customer", i.phone_number], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             db.query("select id,phone_number from customerSeller_user where phone_number=?", [i.phone_number], (err, result2) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     let id = result2[0].id;
//                     let phone = result2[0].phone_number;
//                     console.log(phone);
//                     console.log(id);
//                     let dob = new Date(i.date_of_birth);
//                     db.query("insert into customer_details(name,date_of_birth,business_id,email,avatarImage) values (?,?,?,?,?)",
//                         [i.name, dob, id, i.email, avatarImage], (err, result3) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 db.query("select * from customer_details where business_id=?", [id], (err, result4) => {
//                                     if (err) {
//                                         console.log(err);
//                                         res.send(err);
//                                     }
//                                     else {
//                                         var accessToken = jwt.sign({ userId: id }, JWT_SECRET, {
//                                             expiresIn: JWT_VALIDITY,
//                                         });
//                                         res
//                                             .cookie("accessToken", accessToken, {
//                                                 httpOnly: true,
//                                                 secure: true
//                                             })
//                                             .status(200)
//                                             .json({
//                                                 accessToken,
//                                                 user: {
//                                                     role: "customer",
//                                                     email: result4[0].email,
//                                                     id: result4[0].business_id,
//                                                     avatarUrl: result4[0].avatarImage,
//                                                     name: result4[0].name,
//                                                     date_of_birth: result4[0].date_of_birth,
//                                                     phone_number: phone,

//                                                 },
//                                             },)
//                                     }
//                                 })
//                             }
//                         })
//                 }
//             })
//         }
//     })
// })
// app.post('/register_seller', upload.fields([{ name: 'avatarUrl', maxCount: 1 }]), (req, res) => {
//     let i = req.body;
//     console.log(i.email)
//     let avatarImage = "https://api-dev.billfy.in/pictures/" + req.files.avatarUrl[0].filename
//     db.query("insert into customerSeller_user(role,phone_number) values (?,?)", ["seller", i.phone_number], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             db.query("select id,phone_number from customerSeller_user where phone_number=?", [i.phone_number], (err, result2) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     let id = result2[0].id;
//                     let phone = result2[0].phone_number;
//                     console.log(phone);
//                     console.log(id);
//                     let dob = new Date(i.date_of_birth);
//                     db.query("insert into seller_details(address,gst,shop_name,business_id,owner_name,state,city,email,avatarImage) values (?,?,?,?,?,?,?,?,?)",
//                         [i.address, i.gst, i.shop_name, id, i.owner_name, i.state, i.city, i.email, avatarImage], (err, result3) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 db.query("select * from seller_details where business_id=?", [id], (err, result4) => {
//                                     if (err) {
//                                         console.log(err);
//                                         res.send(err);
//                                     }
//                                     else {
//                                         var accessToken = jwt.sign({ userId: id }, JWT_SECRET, {
//                                             expiresIn: JWT_VALIDITY,
//                                         });
//                                         res
//                                             .cookie("accessToken", accessToken, {
//                                                 httpOnly: true,
//                                                 secure: true
//                                             })
//                                             .status(200)
//                                             .json({
//                                                 accessToken,
//                                                 user: {
//                                                     role: "seller",
//                                                     email: result4[0].email,
//                                                     id: id,
//                                                     avatarUrl: result4[0].avatarImage,
//                                                     address: result4[0].address,
//                                                     gst: result4[0].gst,
//                                                     phone_number: phone,
//                                                     shop_name: result4[0].shop_name,
//                                                     owner_name: result4[0].owner_name,
//                                                     state: result4[0].state,
//                                                     city: result4[0].city,
//                                                 },
//                                             },)
//                                     }
//                                 })
//                             }
//                         })
//                 }
//             })
//         }
//     })
// })
// app.post('/delete_account', (req, res) => {
//     let i = req.body;
//     db.query("select id from customerSeller_user where phone_number=?", [i.phone_number], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             let id = result[0].id;
//             db.query("delete from seller_details where business_id=?", [id], (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     db.query("delete from customer_details where business_id=?", [id], (req, result) => {
//                         if (err) {
//                             console.log(err);
//                             res.send(err);
//                         }
//                         else {
//                             db.query("delete from customerSeller_user where id=?", [id], (req, result) => {
//                                 if (err) {
//                                     console.log(err);
//                                     res.send(err);
//                                 }
//                                 else {
//                                     res.send({ message: "Account deleted!" })
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })

// })
// app.post('/update_seller', upload.fields([{ name: 'avatarUrl', maxCount: 1 }]), (req, res) => {
//     let i = req.body;
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     let avatarImage = "https://api-dev.billfy.in/pictures/" + req.files.avatarUrl[0].filename
//     db.query("update seller_details set address=?,gst=?,shop_name=?,owner_name=?,state=?,city=?,email=?,avatarImage=? where business_id=?",
//         [i.address, i.gst, i.shop_name, i.owner_name, i.state, i.city, i.email, avatarImage, id], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send(err);
//             }
//             else {
//                 db.query("select phone_number from customerSeller_user where id=?", [id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         db.query("select * from seller_details where business_id=?", [id], (err, result4) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 var accessToken = jwt.sign({ userId: id }, JWT_SECRET, {
//                                     expiresIn: JWT_VALIDITY,
//                                 });
//                                 res
//                                     .cookie("accessToken", accessToken, {
//                                         httpOnly: true,
//                                         secure: true
//                                     })
//                                     .status(200)
//                                     .json({
//                                         accessToken,
//                                         user: {
//                                             role: "seller",
//                                             email: result4[0].email,
//                                             id: id,
//                                             avatarUrl: result4[0].avatarImage,
//                                             address: result4[0].address,
//                                             gst: result4[0].gst,
//                                             phone_number: result2[0].phone_number,
//                                             shop_name: result4[0].shop_name,
//                                             owner_name: result4[0].owner_name,
//                                             state: result4[0].state,
//                                             city: result4[0].city,
//                                         },
//                                     },)
//                             }
//                         })
//                     }
//                 })

//             }
//         })
// })
// app.post('/update_customer', (req, res) => {
//     let i = req.body;
//     let avatarImage = "https://api-dev.billfy.in/pictures/" + req.files.avatarUrl[0].filename
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     let dob = new Date(i.date_of_birth)
//     db.query("update customer_details set name=?,date_of_birth=?,email=?,avatarImage=? where business_id=?",
//         [i.name, dob, i.email, avatarImage, id], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send(err);
//             }
//             else {
//                 db.query("select phone_number from customerSeller_user where id=?", [id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         db.query("select * from customer_details where business_id=?", [id], (err, result4) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 var accessToken = jwt.sign({ userId: id }, JWT_SECRET, {
//                                     expiresIn: JWT_VALIDITY,
//                                 });
//                                 res
//                                     .cookie("accessToken", accessToken, {
//                                         httpOnly: true,
//                                         secure: true
//                                     })
//                                     .status(200)
//                                     .json({
//                                         accessToken,
//                                         user: {
//                                             role: "customer",
//                                             email: result4[0].email,
//                                             id: result4[0].business_id,
//                                             avatarUrl: result4[0].avatarImage,
//                                             name: result4[0].name,
//                                             date_of_birth: result4[0].date_of_birth,
//                                             phone_number: result2[0].phone_number,

//                                         },
//                                     },)
//                             }
//                         })
//                     }
//                 })
//             }
//         })
// })
// app.post('/customerSeller_token', (req, res) => {
//     let i = req.body
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     db.query("select * from customerSeller_user where id=?", [id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             if (result[0].role == 'customer') {
//                 db.query("select * from customer_details where business_id=?", [id], (err, result1) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         console.log(result1)
//                         var accessToken = jwt.sign({ userId: result1[0].business_id }, JWT_SECRET, {
//                             expiresIn: JWT_VALIDITY,
//                         });
//                         res
//                             .cookie("accessToken", accessToken, {
//                                 httpOnly: true,
//                                 secure: true
//                             })
//                             .status(200)
//                             .json({
//                                 accessToken,
//                                 status: true,
//                                 user: {
//                                     role: "customer",
//                                     email: result1[0].email,
//                                     id: result1[0].business_id,
//                                     avatarUrl: result1[0].avatarImage,
//                                     name: result1[0].name,
//                                     date_of_birth: result1[0].date_of_birth,
//                                     phone_number: result[0].phone_number,

//                                 },
//                             },)
//                     }
//                 })
//             }
//             else if (result[0].role == 'seller') {
//                 db.query("select * from seller_details where business_id=?", [result[0].id], (err, result1) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         var accessToken = jwt.sign({ userId: result1[0].business_id }, JWT_SECRET, {
//                             expiresIn: JWT_VALIDITY,
//                         });
//                         res
//                             .cookie("accessToken", accessToken, {
//                                 httpOnly: true,
//                                 secure: true
//                             })
//                             .status(200)
//                             .json({
//                                 accessToken,
//                                 status: true,
//                                 user: {
//                                     role: "seller",
//                                     email: result1[0].email,
//                                     id: result1[0].business_id,
//                                     avatarUrl: result1[0].avatarImage,
//                                     address: result1[0].address,
//                                     gst: result1[0].gst,
//                                     phone_number: result[0].phone_number,
//                                     shop_name: result1[0].shop_name,
//                                     owner_name: result1[0].owner_name,
//                                     state: result1[0].state,
//                                     city: result1[0].city,
//                                 },
//                             },)
//                     }
//                 })
//             }
//         }
//     })
// })
// app.post('/add_factory_operator', (req, res) => {
//     let i = req.body
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//         }
//     })
//     db.query("INSERT INTO factory_operator(name,factory_id,email,password,company_id,factory_name) VALUES (?,?,?,?,?,?)", [i.name, i.factory_id, i.email, i.password, id, i.factory_name], (err, result) => {
//         if (err) {
//             console.log(err)
//             res.send(err);
//         }
//         else {
//             db.query("SELECT * FROM factory_operator order by id desc limit 1", (err, result2) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     res.send(result2[0])
//                 }
//             })
//             // res.send({message:"Factory opertor added!"})
//         }
//     })
// })
// app.post('/update_factory_operator', (req, res) => {
//     let i = req.body;
//     db.query("UPDATE factory_operator SET name=?,factory_id=?,email=?,password=?,company_id=?,factory_name=? where id=?",
//         [i.name, i.factory_id, i.email, i.password, i.company_id, i.factory_name, i.id], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send(err);
//             }
//             else {
//                 db.query("SELECT * FROM factory_operator where id=?", [i.id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         res.send(result2[0])
//                     }
//                 })
//             }
//         })
// })
// app.post('/delete_factory_operator', (req, res) => {
//     let i = req.body;
//     db.query("DELETE FROM factory_operator WHERE id=?", [i.id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send({ message: "Factory opertor deleted!" })
//         }
//     })
// })
// app.post('/factory_operator_list', (req, res) => {
//     let i = req.body
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//         }
//     })
//     db.query("SELECT * FROM factory_operator WHERE company_id=?", [id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send(result)
//         }
//     })
// })
// app.post('/add_factory', async (req, res) => {
//     let i = req.body;
//     console.log(i)
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     db.query("insert into factory(company_id,factory_name) values (?,?)", [id, i.factory_name], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             db.query("select id from factory where factory_name=?", [i.factory_name], (err, result2) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     console.log(result2[0])
//                     let factory_id = result2[0].id
//                     for (let j of i.products) {
//                         console.log(j)
//                         db.query("insert into factory_product(factory_id,product_id) values (?,?)", [factory_id, j.product_id], (err, result3) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 console.log("product added!")

//                             }
//                         })

//                     }

//                 }
//             })
//             setTimeout(() => {
//                 db.query("select id from factory where factory_name=?", [i.factory_name], (err, result) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         let id = result[0].id;
//                         db.query("select * from factory where id=?", [id], (err, result2) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 let r1 = result2[0];
//                                 // r1.products=[];
//                                 db.query("select product_id from factory_product where factory_id=?", [id], (err, result3) => {
//                                     if (err) {
//                                         console.log(err);
//                                         res.send(err);
//                                     }
//                                     else {
//                                         r1.products = result3
//                                         console.log(r1);
//                                         res.send(r1);
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 })
//             }, 200)
//         }
//     })
// })
// app.post('/fetch_factory', (req, res) => {
//     let i = req.body;
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     // let key = i.keyword + '%';
//     db.query("select * from factory where company_id=?", [id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             // res.send(result);
//             let r1 = result;
//             let cnt = 0;
//             for (let j of r1) {
//                 cnt++;
//                 j.products = [];
//                 db.query("select product_id,id from factory_product where factory_id=?", [j.id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         j.products = result2
//                     }
//                 })
//                 // if(cnt==r1.length-1){
//                 //     res.send(r1)
//                 // }


//             }
//             setTimeout(() => {
//                 res.send(r1)
//             }, 200)
//         }
//     })
// })
// app.post('/fetch_factory_product', (req, res) => {
//     let i = req.body;
//     db.query("select * from factory_product where factory_id=?", [i.factory_id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send(result)
//         }
//     })
// })
// app.post('/update_factory', (req, res) => {
//     let i = req.body;
//     console.log(i)
//     db.query("update factory set factory_name=? where id=?", [i.factory_name, i.id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             // res.send({message:"Factory updated!"})
//             db.query("delete from factory_product where factory_id=?", [i.id], (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     for (let j of i.products) {
//                         db.query("insert into factory_product(factory_id,product_id) values (?,?)", [i.id, j.product_id], (err, result3) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 console.log("product added!")

//                             }
//                         })
//                     }
//                 }
//             })
//             setTimeout(() => {
//                 let id = i.id;
//                 console.log(id)
//                 db.query("select * from factory where id=?", [id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         console.log(result2)
//                         console.log(result2[0])
//                         let r1 = result2[0];
//                         // r1.products=[];
//                         db.query("select product_id from factory_product where factory_id=?", [id], (err, result3) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send(err);
//                             }
//                             else {
//                                 r1.products = result3
//                                 console.log(r1);
//                                 res.send(r1);
//                             }
//                         })
//                     }
//                 })
//             }, 200)
//         }

//     })
// })
// app.post('/update_factory_product', (req, res) => {
//     let i = req.body;
//     db.query("update factory_product set product_id=? where id=?", [i.product_id, i.id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send({ message: "Product updated" })
//         }
//     })
// })
// app.post('/delete_factory', (req, res) => {
//     let i = req.body;
//     db.query("delete from factory_product where factory_id=?", [i.id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             db.query("delete from factory where id=?", [i.id], (err, result2) => {
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 else {
//                     res.send({ message: "Factory deleted!" })
//                 }
//             })
//         }
//     })
// })
// app.post('/delete_factory_product', (req, res) => {
//     let i = req.body;
//     db.query("delete from factory_product where id=?", [i.id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send({ message: "Factory product deleted!" })
//         }
//     })
// })
// app.post('/search', (req, res) => {
//     let i = req.body;
//     console.log(i)
//     let key = i.keyword + '%'
//     db.query("select id,factory_name from factory where factory_name like ?", [key], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send(result);
//         }
//     })
// })
// app.post('/distributor_search', (req, res) => {
//     let i = req.body;
//     db.query("select * from distributor_details where ? in (enterprise_name,phone,address,GST_no,PAN,owner_name,pincode,state,aadhar_no,total_sales,business_id,sales_percentage,company,city)",
//         [i.keyword], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send(err);
//             }
//             else {
//                 res.send(result);
//             }
//         })
// })
// app.post('/product_category_search', (req, res) => {
//     let i = req.body;
//     db.query("select * from product_list where id in(select product_id from product_category where title=?)", [i.keyword], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             res.send(result);
//         }
//     })
// })
// app.post('/factory_operator_login', (req, res) => {
//     let i = req.body;
//     db.query("select * from factory_operator where email=? and password=?", [i.email, i.password], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else if (result.length < 1) {
//             res.send({ message: "Factory operator not registered" })
//         }
//         else {
//             var accessToken = jwt.sign({ userId: result[0].id }, JWT_SECRET, {
//                 expiresIn: JWT_VALIDITY,
//             });
//             res
//                 .cookie("accessToken", accessToken, {
//                     httpOnly: true,

//                 })
//                 .status(200)
//                 .json({
//                     accessToken,
//                     user: {
//                         id: result[0].id,
//                         name: result[0].name,
//                         factory_id: result[0].factory_id,
//                         email: result[0].email,
//                         company_id: result[0].company_id,
//                         factory_name: result[0].factory_name
//                     },
//                 },)
//         }
//     })
// })
// app.post('/factory_operator_logout', (req, res) => {
//     let i = req.body;
//     res.clearCookie(i.token)
//     res.send({ message: "Successfully signed out" })
// })
// app.post('/load_factory_operator', (req, res) => {
//     let i = req.body;
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//             console.log(id)
//         }
//     })
//     db.query("select * from factory_operator where id=?", [id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send(err);
//         }
//         else {
//             var accessToken = jwt.sign({ userId: result[0].id }, JWT_SECRET, {
//                 expiresIn: JWT_VALIDITY,
//             });
//             res
//                 .cookie("accessToken", accessToken, {
//                     httpOnly: true,

//                 })
//                 .status(200)
//                 .json({
//                     accessToken,
//                     user: {
//                         id: result[0].id,
//                         name: result[0].name,
//                         factory_id: result[0].factory_id,
//                         email: result[0].email,
//                         company_id: result[0].company_id,
//                         factory_name: result[0].factory_name
//                     },
//                 },)
//         }
//     })
// })
// app.post('/company_customers', (req, res) => {
//     let i = req.body;
//     let accessToken = i.token
//     var company_id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             company_id = decoded.userId
//         }
//     })
//     // select cd.name,cd.date_of_birth,cd.business_id,cd.email,cs.phone_number from customer_details cd, customerSeller_user cs where cs.id=cd.business_id and cd.business_id in(select distinct customer_id from warranty_availed_data where product_id in(select id from product_list where company_id=?))
//     companyManager.CompanyCustomers(i, company_id, function (err, result) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.send(result)
//         }
//     });


// })
// app.post('/link_QR', (req, res) => {
//     let i = req.body
//     let data = JSON.stringify(i)
//     db.query("select id from master_QR where gateKeeper_user=? order by id desc limit 1", [i.gateKeeper_id], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             let id
//             if (result.length < 1) {
//                 id = 0
//             }
//             else {
//                 id = result[0].id
//                 let quantity = i.quantity
//                 let data = []
//                 for (let j of i.data) {
//                     data.append(j)
//                 }
//                 var filename = '/var/www/qr/M' + id + 1 + '.png'
//                 var path = 'http://3.110.216.215/qr/P' + id + 1 + j + '.png'
//                 QRCode.toFile(filename, data, {
//                 }, function (err, QRcode) {
//                     if (err) return console.log(err)
//                     console.log('done')
//                 })
//                 db.query("insert into master_QR(gateKeeper_id,qr_image) values (?,?)", [i.gateKeeper_id, path], (err, result1) => {
//                     if (err) {
//                         console.log(err)

//                     }
//                     else {
//                         console.log("saved")
//                         db.query("select qr_image from master_QR where id>?", [id], (err, result2) => {
//                             if (err) {
//                                 console.log(err)
//                             }
//                             else {
//                                 res.send(result2)
//                             }
//                         })
//                     }
//                 })
//             }
//         }
//     })

// })
// app.post("/profile_edit", upload.fields([{ name: 'avatarImage', maxCount: 1 }]), (req, res) => {
//     let i = req.body;
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             id = decoded.userId
//         }
//     })
//     let avatarUrl = ""
//     if (req.files) {
//         avatarUrl = "https://api-dev.billfy.in/pictures/" + req.files.avatarImage.filename
//     }
//     db.query("update company_details set address=?,avatarUrl=?,display_name=?,owner_name=?,phone=? where business_id=?",
//         [i.address, i.avatarUrl, i.display_name, i.owner_name, i.phone, id], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.send(err);
//             }
//             else {
//                 db.query("select * from company_details where business_id=?", [id], (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     }
//                     else {
//                         res.send(result2);
//                     }
//                 })
//             }
//         })
// })
// app.post('/product_details', (req, res) => {
//     let i = req.body
//     db.query("SELECT * FROM product_list WHERE id=?", [i.id], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             let r1 = result;
//             console.log(result)
//             if(result[0].logo==null){
//                 db.query("select avatarUrl from company_details where business_id = (select company_id from product_list where id=?)",[i.id],(err,logo_result)=>{
//                     if(err){
//                         console.log(err)
//                     }
//                     else{
//                         result[0].company_logo={
//                             id:"",
//                             title:"Default",
//                             logo:logo_result[0].avatarUrl
//                         }
//                     }
//                 })
//             }
//             else{
//                 db.query("select id,logo,title from company_logo where id=?",[result[0].logo],(err,logo_result)=>{
//                     if(err){
//                         console.log(err)
//                     }
//                     else{
//                         result[0].company_logo={
//                             id:logo_result[0].id,
//                             title:logo_result[0].title,
//                             logo:logo_result[0].logo
//                         }
//                     }
//                 })
//             }
//             db.query("select * from warranty where product_id=?", [i.id], (err, result2) => {
//                 if (err) {
//                     console.log(err)
//                     req.send({ message: "Error" })
//                 }
//                 else {
//                     let r2 = result2;
//                     for (let i of r1) {
//                         i.warranty = []
//                         for (let j of r2) {
//                             if (i['id'] == j['product_id']) {
//                                 i.warranty.push(j)
//                             }
//                         }
//                     }
//                 }
//             })
//             db.query("select * from product_image where product_id=?", [i.id], (err, result3) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r2 = result3;
//                     for (let i of r1) {
//                         i.images = []
//                         for (let j of r2) {
//                             if (i['id'] == j['product_id']) {
//                                 i.images.push(j)
//                             }
//                         }
//                     }
//                     // res.send(result)
//                 }
//             })
//             db.query("select * from product_category where product_id=?", [i.id], (err, result4) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r4 = result4;
//                     for (let i of r1) {
//                         i.category = []
//                         for (let j of r4) {
//                             if (i['id'] == j['product_id']) {
//                                 i.category.push(j)
//                             }
//                         }
//                     }
//                     // res.send(result)
//                 }
//             })
//             db.query("select * from product_purchase_options where product_id=? order by sequence", [i.id], (err, result7) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r5 = result7;
//                     for (let i of r1) {
//                         i.purchaseOptions = []
//                         for (let j of r5) {
//                             if (i['id'] == j['product_id']) {
//                                 i.purchaseOptions.push(j)
//                             }
//                         }
//                     }
//                     // res.send(result)
//                 }
//             })
//             db.query("select * from product_videos where product_id=?", [i.id], (err, result5) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r5 = result5;
//                     for (let i of r1) {
//                         i.video = []
//                         for (let j of r5) {
//                             if (i['id'] == j['product_id']) {
//                                 i.video.push(j)
//                             }
//                         }
//                     }
//                     // res.send(result)
//                 }
//             })
//             db.query("select warranty_registered from encoded_product where product_id=?",[i.id],(err,result6)=>{
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else{
//                     console.log(result6)
//                     if(result6.length==0){
//                         result[0].warranty_registered="Warranty not registered"
//                     }
//                     else{
//                         result[0].warranty_registered=result6[0].warranty_registered
//                     }
                    
//                 }
//             })
//             db.query("select * from additional_info where product_id=?", [i.id], (err, result3) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r2 = result3;
//                     for (let i of r1) {
//                         i.additionalInfo = []
//                         for (let j of r2) {
//                             if (i['id'] == j['product_id']) {
//                                 i.additionalInfo.push(j)
//                             }
//                         }
//                     }
//                     res.send(result[0])
//                 }
//             })
//         }
//     })
// })

// app.post('/me', (req, res) => {
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let i = req.body
//     console.log(i)
//     // let cookie = req.cookies
//     let accessToken = i.token
//     var id
//     jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
//         if (err) {
//             console.log(err)
//             res.status(404).send("Authentication failed")
//         }
//         else {
//             id = decoded.userId
//         }
//     })
//     console.log(id)
//     db.query("SELECT role,email from business_user where business_id=?", [id], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             if (result[0].role == 'company') {
//                 db.query("select b.email, c.* from business_user b, company_details c where b.business_id=c.business_id and b.business_id=?", [id], (err, result1) => {
//                     if (err) {
//                         console.log(err)
//                     }
//                     else {
//                         res
//                             .cookie("accessToken", accessToken, {
//                                 httpOnly: true,
//                                 secure: true,
//                             })
//                             .status(200)
//                             .json({
//                                 accessToken,
//                                 user: {
//                                     role: "company",
//                                     id: id,
//                                     avatarUrl: result1[0].avatarUrl,
//                                     display_name: result1[0].display_name,
//                                     owner_name: result1[0].owner_name,
//                                     phone: result1[0].phone,
//                                     address: result1[0].address,
//                                     email: result1[0].email,
//                                     helpline_number: result1[0].helpline_number,
//                                     helpline_email: result1[0].helpline_email
//                                 },
//                             })


//                     }
//                 })
//             }
//             if (result[0].role == 'distributor') {
//                 db.query("select b.ebusiness_idmail, c.* from business_user b, distributor_details c where b.business_id=c.business_id and b.business_id=?", [id], (err, result2) => {
//                     if (err) {
//                         console.log(err)
//                     }
//                     else {
//                         res
//                             .cookie("accessToken", accessToken, {
//                                 httpOnly: true,
//                                 secure: true
//                             })
//                             .status(200)
//                             .json({
//                                 accessToken,
//                                 user: {
//                                     role: "distributor",
//                                     id: id,
//                                     GST_no: result2[0].GST_no,
//                                     enterprise_name: result2[0].enterprise_name,
//                                     owner_name: result2[0].owner_name,
//                                     phone: result2[0].phone,
//                                     address: result2[0].address,
//                                     PAN: result2[0].PAN,
//                                     pincode: result2[0].pincode,
//                                     state: result2[0].state,
//                                     aadhar_no: result2[0].aadhar_no,
//                                     email: result2[0].email
//                                 },
//                             },)
//                     }
//                 })
//             }

//         }
//     })


// })
// app.post('/CustomerSeller_login', (req, res) => {
//     const JWT_VALIDITY = '7d'
//     const JWT_SECRET = 'AHBWUF4vIPtv6UDYhGHlEa6QTNpYSKmP'
//     let i = req.body
//     db.query("SELECT * from customerSeller_user where email=? and password=?", [i.email, i.password], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else if (result.length < 1) {
//             res.send({ message: "User not registered" })
//         }
//         else {
//             if (result[0].role == 'seller') {
//                 db.query("SELECT * from seller_details where business_id=?", [result[0].id], (err, result1) => {
//                     if (err) {
//                         console.log(err)
//                     }
//                     else {
//                         var accessToken = jwt.sign({ userId: result1[0].id }, JWT_SECRET, {
//                             expiresIn: JWT_VALIDITY,
//                         });
//                         res
//                             .cookie("accessToken", accessToken, {
//                                 httpOnly: true,
//                                 secure: true
//                             })
//                             .status(200)
//                             .json({
//                                 accessToken,
//                                 user: {
//                                     role: "seller",
//                                     id: result1[0].uid,
//                                     address: result1[0].address,
//                                     created_at: result[0].created_at,
//                                     display_name: result1[0].display_name,
//                                     gst: result[0].gst,
//                                     profile_image: result[0].profile_image,
//                                     shop_name: result1[0].shop_name,
//                                     email: result[0].email
//                                 },
//                             },)

//                     }
//                 })
//             }
//             if (result[0].role == 'customer') {
//                 db.query("SELECT * from customer_details where business_id=?", [result[0].id], (err, result2) => {
//                     if (err) {
//                         console.log(err)
//                     }
//                     else {
//                         var accessToken = jwt.sign({ userId: result2[0].id }, JWT_SECRET, {
//                             expiresIn: JWT_VALIDITY,
//                         });
//                         res
//                             .cookie("accessToken", accessToken, {
//                                 httpOnly: true,
//                                 secure: true
//                             })
//                             .status(200)
//                             .json({
//                                 accessToken,
//                                 user: {
//                                     role: "customer",
//                                     id: result2[0].uid,
//                                     name: result2[0].name,
//                                     date_of_birth: result2[0].date_of_birth,
//                                     mobile: result2[0].mobile,
//                                     email: result[0].email,

//                                 },
//                             },)
//                     }
//                 })
//             }
//         }
//     })
// })

// app.post('/factory_product', (req, res) => {
//     let i = req.body;
//     let id = i.factory_id;
//     db.query("select product_name,product_model,id from product_list where id in(select product_id from factory_product where factory_id=?)", [id], (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         else {
//             // res.send(result)
//             let r1 = result
//             db.query("select month, year,id,product_id from warranty where product_id in(select product_id from factory_product where factory_id=?)", [id], (err, result2) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r2 = result2

//                     for (let i of r1) {
//                         i.warranty = ""
//                         let cnt = 1
//                         for (let j of r2) {
//                             if ((i['id'] == j['product_id']) && (cnt < 2)) {
//                                 i.warranty = j
//                                 cnt = cnt + 1
//                             }
//                         }
//                     }

//                 }
//             })
//             db.query("select product_id, image, id from product_image where product_id in(select product_id from factory_product where factory_id=?)", [id], (err, result3) => {
//                 if (err) {
//                     console.log(err)
//                     res.send({ message: "Error" })
//                 }
//                 else {
//                     let r3 = result3

//                     for (let i of r1) {
//                         i.images = ""
//                         let cnt = 1
//                         for (let j of r3) {
//                             if ((i['id'] == j['product_id']) && (cnt < 2)) {
//                                 i.images = j
//                                 cnt = cnt + 1
//                             }
//                         }
//                     }
//                     res.json(r1)
//                 }
//             })

//         }
//     })
// })