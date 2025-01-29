const { Router } = require('express');
const app = Router();
var path = require('path');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const GateKeeperManager = require('../Managers/gateKeeper_manager');
const gatekeeper_manager = new GateKeeperManager();
const CompanyUserApiValidator = require('../middlewares/RequestValidator/company-user.validator');
const CompanyUserApiValidatorobj = new CompanyUserApiValidator();
const CommonHelper = require('../CommonHelper/helper');
const commonHelperObj = new CommonHelper();
const AuthMiddleware = require('../middlewares/authorizationMiddleware/company-user.authorization.middleware');
const authmidobj = new AuthMiddleware();
app.post('/company_user_login', (req, res) => {
  gatekeeper_manager
    .Login(req.body)
    .then(({ user, accessToken }) => {
      res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
        })
        .status(200)
        .json({
          accessToken,
          user: user,
        });
    })
    .catch((error) => {
      if (error == 'User not registered!') {
        res.status(404).send({ message: error });
      } else if (error == 'Invalid credentials!') {
        res.status(401).send({ message: error });
      } else {
        console.log(error);
        res.status(404).send('Error');
      }
    });
});
app.post('/company_user_identity', (req, res) => {
  gatekeeper_manager
    .Identity(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/gateKeeper_scan', (req, res) => {
  gatekeeper_manager
    .ScanQR(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/gateKeeper_fetch_buffer', (req, res) => {
  gatekeeper_manager
    .FetchGateKeeperBuffer(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/gateKeeper_delete_buffer', (req, res) => {
  gatekeeper_manager
    .DeleteQR(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/gateKeeper_clear_buffer', (req, res) => {
  gatekeeper_manager
    .ClearBuffer(req.body)
    .then(() => {
      res.status(200).send('Buffer cleared');
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post(
  '/gateKeeper_dispatch',
  CompanyUserApiValidatorobj.gateKeeperDispatchValidator(),
  commonHelperObj.checkforerrors,
  (req, res) => {
    console.log(req.body);
    gatekeeper_manager
      .Dispatch(req.body)
      .then(() => {
        res.status(200).send('Dispatched');
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });
  }
);

app.post(
  '/change-company-user-password',
  authmidobj.verifyCompanyUserToken,
  (req, res) => {
    gatekeeper_manager
      .ChangeCompanyUserPassword(
        req.user.user_id,
        req.body.old_password,
        req.body.new_password
      )
      .then((Data) => {
        res.send(Data);
      })
      .catch((err) => {
        // console.error('Error fetching transactions:', error);
        res.status(400).send(err);
      });
  }
);
app.post('/forget-company-user-password', async (req, res) => {
  try {
    const data = await gatekeeper_manager.forgetPassword(req.body);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});
app.post('/reset-company-user-password', async (req, res) => {
  try {
    const data = await gatekeeper_manager.resetPassword(req.body);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});
module.exports = app;
