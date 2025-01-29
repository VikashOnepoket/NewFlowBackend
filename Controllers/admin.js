const cors = require('cors');
const { Router } = require('express');
const app = Router();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const multer = require('multer');
const ApiValidator = require('../middlewares/RequestValidator/Admin.validator');
const AuthMiddleware = require('../middlewares/authorizationMiddleware/admin.authorization.middleware');
const authmidobj = new AuthMiddleware();

const apiValidatorobj = new ApiValidator();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/temporary_storage/images');
    // cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const AdminManager = require('../Managers/admin_manager');
const admin_manager = new AdminManager();
var upload = multer({ storage: storage });
app.post('/admin_login', (req, res) => {
  admin_manager
    .Login(req.body)
    .then(({ token, response }) => {
      res
        .cookie('accessToken', token, {
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .json({
          token,
          user: response,
        });
      // res.status(200).send(result)
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.post(
  '/company_action',
  upload.fields([{ name: 'avatarUrl', maxCount: 1 }]),
  apiValidatorobj.validateRequest,
  (req, res) => {
    if (req.body.action == 'Update') {
      admin_manager
        .UpdateCompany(req.body, req.files.avatarUrl)
        .then((result) => {
          console.log('rsult in last', result);
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send(err);
        });
    } else if (req.body.action == 'Register') {
      admin_manager
        .RegisterCompany(req.body, req.files.avatarUrl[0])
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send(err);
        });
    } else if (req.body.action == 'Delete') {
      admin_manager
        .DeleteCompany(req.body)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send('Error');
        });
    } else if (req.body.action == 'ADD_Credits') {
      admin_manager
        .AddCompanyCredits(req.body)
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send('Error');
        });
    }
  }
);
app.post('/list_companies', (req, res) => {
  admin_manager
    .ListCompanies(req.body)
    .then((result) => {
      console.log(result);
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);

      res.status(404).send(err);
    });
});
app.post('/get_company_details', (req, res) => {
  admin_manager
    .CompanyDetails(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

app.post('/admin-company-login', async (req, res) => {
  try {
    //console.log(req.body);
    const user = await admin_manager.adminCompanyLogin(req.body);
    res.send(user);
  } catch (err) {
    // //console.log('rourte+err' + err);
    res.status(400).send(err);
  }
});
app.post(
  '/save-new-pdf-template',
  upload.single('template_pdf'),
  apiValidatorobj.validateRequestSaveNewTemplate,

  authmidobj.verifyAdminToken,

  async (req, res) => {
    try {
      //console.log(req.body);
      const user = await admin_manager.SaveNewPDFTemplateDetails(
        req.body,
        req.file
      );
      res.send('Template saved SuccessFully');
    } catch (err) {
      // //console.log('rourte+err' + err);
      res.status(400).send('Unable to add new Template');
    }
  }
);
app.post(
  '/getAllGlobalTemplates',
  authmidobj.verifyAdminToken,
  async (req, res) => {
    try {
      const templatesData = await admin_manager.getAllGlobalTemplates(req.body);
      res.send(templatesData);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

app.post(
  '/edit-pdf-template',
  upload.single('template_pdf'),
  apiValidatorobj.validateRequestEditTemplate,

  authmidobj.verifyAdminToken,

  async (req, res) => {
    try {
      //console.log(req.body);
      const user = await admin_manager.EditPDFTemplateDetails(
        req.body,
        req.file
      );
      res.send(user);
    } catch (err) {
      // //console.log('rourte+err' + err);
      res.status(400).send('Unable to Update Template');
    }
  }
);

app.post('/deleteTemplate', authmidobj.verifyAdminToken, async (req, res) => {
  try {
    const templatesData = await admin_manager.DeleteTemplate(req.body);
    res.send(templatesData);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/getTemplate', authmidobj.verifyAdminToken, async (req, res) => {
  try {
    const templatesData = await admin_manager.GetTemplateByID(req.body);
    res.send(templatesData);
  } catch (err) {
    res.status(400).send(err.message);
  }

});

app.post('/hard_delete_companies',authmidobj.verifyAdminToken,async(req,res)=>{
  try{
    const HardDeleteCompanies=await admin_manager.HardDeleteCompanies(req.body)
    res.send("Deleted")
  }catch(err){
    res.status(400).send(err)
  }
})
app.post('/get_default_configs',authmidobj.verifyAdminToken,async(req,res)=>{
  try{
    const defaultConfigs=await admin_manager.getDefaultConfigs(req.body)
    res.send(defaultConfigs)
  }catch(err){
    res.status(400).send(err)
  }
})

app.post('/update_default_configs',authmidobj.verifyAdminToken,async(req,res)=>{
  try{
    const defaultConfigs=await admin_manager.updateDefaultConfigs(req.body)
    res.send(defaultConfigs)
  }catch(err){
    res.status(400).send(err)
  }
})
app.post('/new-dashboard-permission',authmidobj.verifyAdminToken,async(req,res)=>{
  try{
    const defaultConfigs=await admin_manager.createNewDashboardPermission(req.body)
    res.send(defaultConfigs)
  }catch(err){
    res.status(400).send(err)
  }
})

app.post('/update-dashboard-permission',authmidobj.verifyAdminToken,async(req,res)=>{
  try{
    const defaultConfigs=await admin_manager.updateDashboardPermission(req.body)
    res.send(defaultConfigs)
  }catch(err){
    res.status(400).send(err)
  }
})
app.post('/dashboard-permissions',async(req,res)=>{
  try{
    const defaultConfigs=await admin_manager.getAllDashboardPermissions(req.body)
    res.send(defaultConfigs)
  }catch(err){
    res.status(400).send(err)
  }
})

module.exports = app;
