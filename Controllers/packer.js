const { Router } = require('express');
const app = Router();
var path = require('path');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const PackerManager = require('../Managers/packer_manager');
const { resolve } = require('path');
const packer_manager = new PackerManager();

app.post('/packer_scan', (req, res) => {
  packer_manager
    .Scan(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});
app.post('/remove_QR', (req, res) => {
  packer_manager
    .RemoveQR(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/packer_link_QR', (req, res) => {
  packer_manager
    .LinkQR(req.body)
    .then((result) => {
      if (result == 'QR already scanned!') {
        res.send(400).send(result);
      } else {
        res.status(200).send(result);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});
app.post('/packer_dispatch', (req, res) => {
  packer_manager
    .Dispatch(req.body)
    .then(() => {
      res.status(200).send('Dispatched!');
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/packer_fetch', (req, res) => {
  packer_manager
    .packerHistory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/clear_buffer', (req, res) => {
  packer_manager
    .clearBuffer(req.body)
    .then(() => {
      // console.log(result);
      res.status(200).send('Buffer cleared');
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.post('/scan_masterQR', (req, res) => {
  packer_manager
    .ScanMasterQR(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});
app.post('/remove_masterQR', (req, res) => {
  packer_manager
    .RemoveMasterQR(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/get_current_masterQr', (req, res) => {
  packer_manager
    .GetCurrentMasterQR(req.body)
    .then((result) => {
      res.status(200).send(result[0]);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});


module.exports = app;
