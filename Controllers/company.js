const cors = require('cors');
const { Router } = require('express');
const app = Router();
var path = require('path');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const CompanyManager = require('../Managers/company_manager');
const companyManager = new CompanyManager();
const CompanyrequestValidator = require('../middlewares/RequestValidator/Company.validator');
const companyValidatorObj = new CompanyrequestValidator();
const AuthMiddleware = require('../middlewares/authorizationMiddleware/company.authorization.middleware');
const authmidobj = new AuthMiddleware();
const multer = require('multer');
const Company_token_expiry = process.env.SESSION_TIMEOUT_COMPANY;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/temporary_storage/images');
    // cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
var upload = multer({ storage: storage });


const JWT_VALIDITY = process.env.SESSION_TIMEOUT_COMPANY;
const JWT_SECRET = process.env.JWT_SECRET;
var corsOptions = {
  origin: [
    'http://localhost:3000',
    // 'http://localhost:3002',
    'https://dev-company.onepoket.com',
    'http://dev-company-new.onepoket.com',
    'http://dev-company-old.onepoket.com',

    'https://dev-company-user.onepoket.com',
    'https://dev.onepoket.com',
    'https://dev-super-admin.onepoket.com',
  ],
  // origin: [
  //   'https://company.onepoket.com',
  //   'http://localhost:3000',
  //   'https://company-user.onepoket.com',
  //   'https://onepoket.com',
  //   'https://super-admin.onepoket.com',
  // ],
};
app.use(cors(corsOptions));
// app.use()
// const add_api_access=(req,res,next)=>{
// req.body.api_access_name=
// }
const add_api_access = (api_access_name) => {
  return (req, res, next) => {
    // Add the customValue to the req.body
    req.body.api_access_name = api_access_name;

    // Continue with the next middleware or route handler
    next();
  };
};
app.post('/business_login', (req, res) => {
  let i = req.body;
  console.log(i);
  companyManager
    .Login(i)
    .then((details) => {
      let accessToken = jwt.sign({ user_id: details.user_details.user_id,company_id:details.company_details.business_id }, process.env.JWT_SECRET, {
        expiresIn: process.env.SESSION_TIMEOUT_COMPANY,
      });
      res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .json({
          accessToken,
          data:details
        });
    })
    .catch((err) => {
      if (err == 'User not registered!') {
        res.status(404).send({ message: err });
      } else if (err == 'Invalid credentials!') {
        res.status(401).send({ message: err });
      } else {
        console.log(err);
        res.status(400).send(err);
      }
    });
});
app.post(
  '/edit_company',
  upload.fields([{ name: 'avatarUrl', maxCount: 1 }]),
  add_api_access("Profile"),
  authmidobj.verifyBusinessToken,

  (req, res) => {
    console.log(req.body); 
    console.log(req.files);
    let logos = [];
    if ('avatarUrl' in req.files) {
      logos[0] = req.files.avatarUrl[0];
    }
    companyManager
      .EditCompany(req.body, req.user.company_id, logos)
      .then((result) => {
        console.log(result);
        res.status(200).send(result);
      })
      .catch((error) => {
        console.log(error);
        res.status(404).send(error);
      });
  }
);

app.post('/advanced_search',authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  let i = req.body;
  console.log(req.body);
  companyManager
    .AdvancedSearch(i,req.user.company_id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      if (err == 'Authentication failed') {
        res.status(440).send({ message: err });
      } else {
        res.status(404).send(err);
      }
    });
});

app.post('/export_to_csv',authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  let i = req.body;
  companyManager
    .ExportToCSV(i,req.user.company_id)
    .then((result) => {
      const filename = 'epoch_time.csv';
      const mimetype = 'text/csv';

      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', mimetype);
      res.status(200).send(result);
    })
    .catch((error) => {
      if (error == 'Authentication failed') {
        res.status(440).send({ message: error });
      } else {
        res.status(404).send(error);
      }
    });
});
app.post(
  '/add_logo',
  upload.fields([{ name: 'logo', maxCount: 1 }]),add_api_access("Company Logo"),authmidobj.verifyBusinessToken,
  (req, res) => {
    console.log(req.files);
    console.log(req.body);
    let i = req.body;
    let logos = '';
    if (req.files) {
      logos = req.files.logo;
    }
    if (logos.length == 0) {
      res.status(400).send({ message: "Image did'nt reach" });
    }
    companyManager
      .AddLogos(i, logos,req.user.company_id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(() => {
        res.status(400).send('Error');
      });
  }
);
app.post('/logo', authmidobj.verifyBusinessTokenUnProtected,(req, res) => {
  companyManager
    .GetLogos(req.body,req.user.company_id)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(404).send({ message: 'Error' });
    });
});
app.put('/logo', upload.fields([{ name: 'logo', maxCount: 1 }]),add_api_access("Company Logo"),authmidobj.verifyBusinessToken, (req, res) => {
  console.log(req.body);
  console.log(req.files);
  let i = req.body;
  let logo = '';
  let status = 'title';
  console.log(Object.keys(req.files).length);
  if (Object.keys(req.files).length !== 0) {
    logo = req.files.logo;
    status = 'logo and title';
  }

  companyManager
    .UpdateLogos(i, logo, status,req.user.company_id)
    .then((result) => {
      console.log(result);
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ message: "Image did'nt reach" });
    });
});

app.post('/get_logo_by_id',authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  companyManager
    .GetLogo(req.body,req.user.company_id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
});
app.post('/delete_logo',add_api_access("Company Logo"),authmidobj.verifyBusinessToken, (req, res) => {
  companyManager
    .DeleteLogo(req.body,req.user.company_id)
    .then(() => {
      res.status(200).send('Image deleted');
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post(
  '/add_company_user',
  upload.any(),
  add_api_access("Users"),
  authmidobj.verifyBusinessToken,
  companyValidatorObj.validateRequestAddCompanyUser,
  (req, res) => {
    console.log(req.body);
    companyManager
      .AddCompanyUser(req.body,req.user.company_id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(404).send(err);
      });
  }
);
app.post(
  '/edit_company_user',
  upload.any(),
  add_api_access("Users"),

  authmidobj.verifyBusinessToken,
  companyValidatorObj.validateRequestEditCompanyUser,
  (req, res) => {
    console.log(req.body);
    companyManager
      .EditCompanyUser(req.body)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(404).send(err);
      });
  }
);
app.post('/company_user_types', (req, res) => {
  companyManager
    .CompanyUserTypes(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.post('/list_company_user', authmidobj.verifyBusinessToken,add_api_access("Users"),
(req, res) => {
  companyManager
    .ListCompanyUser(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/company_user_data', add_api_access("Users"),(req, res) => {
  console.log(req.body);
  companyManager
    .CompanyUserData(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.post('/delete_company_user', add_api_access("Users"),(req, res) => {
  companyManager
    .DeleteCompanyUser(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/inventory', (req, res) => {
  console.log('inv')
  companyManager
    .Inventory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});


app.post('/alphanumeric_data', (req, res) => {
  console.log('alpha')
  companyManager
    .getAlphanumericDetails(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err)
      res.status(404).send(err);
    });
});
app.post('/bulk_upload_product',upload.single("product_file"),
add_api_access("Products"),
authmidobj.verifyBusinessToken,(req,res)=>{
  console.log(req.file)
  companyManager
  .bulkUploadProduct(req.file.path,req.user.company_id)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    console.log(err)
    res.status(404).send(err);
  });



})

app.post('/dispatched_products', (req, res) => {
  companyManager
    .DispatchedProducts(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post(
  '/add_product',
  upload.fields([{ name: 'productImage', maxCount: 10 }]),
  add_api_access("Products"),
  authmidobj.verifyBusinessToken,
  companyValidatorObj.validateRequestAddProduct,

  (req, res) => {
    console.log(req.body);
    console.log(req.files);
    let productImage;
    if ('productImage' in req.files) {
      productImage = req.files.productImage;
    } else {
      productImage = '';
    }
    companyManager
      .AddProduct(req.body, productImage)
      .then(() => {
        res.status(200).send('Product added');
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  }
);
app.post(
  '/edit_product',

  upload.fields([{ name: 'newImages', maxCount: 10 }]),
  add_api_access("Products"),

  authmidobj.verifyBusinessToken,
  companyValidatorObj.validateRequestEditProduct,
  (req, res) => {
    // console.log(req.body);
    // console.log(req.files);
    let productImage;
    if ('newImages' in req.files) {
      productImage = req.files.newImages;
    } else {
      productImage = '';
    }
    console.log(productImage);
    companyManager
      .EditProduct(req.body, productImage)
      .then(() => {
        res.status(200).send('Product updated');
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  }
);

app.post('/delete_product',  add_api_access("Products"),
authmidobj.verifyBusinessToken, (req, res) => {
  companyManager
    .DeleteProduct(req.body)
    .then((result) => {
      res.status(200).send('Product Deleted');
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/search', authmidobj.verifyBusinessTokenUnProtected,(req, res) => {
  companyManager
    .SearchFactory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/product_list',authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  companyManager
    .ProductList(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.post('/company_customers',  add_api_access("Acquired Customers"),
authmidobj.verifyBusinessToken, (req, res) => {
  let i = req.body;
  companyManager
    .CompanyCustomers(req.body,req.user.company_id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});
app.post('/product_category_search',authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  companyManager
    .ProductCategorySearch(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send({ message: 'No product found' });
    });
});
app.post('/delete_factory_product', add_api_access("Factory"), authmidobj.verifyBusinessToken,(req, res) => {
  companyManager
    .DeleteFactoryProduct(req.body)
    .then((result) => {
      res.status(200).send({ message: result });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/delete_factory',add_api_access("Factory"), authmidobj.verifyBusinessToken,(req, res) => {
  companyManager
    .DeleteFactory(req.body)
    .then((result) => {
      res.status(200).send({ message: result });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/update_factory_product',add_api_access("Factory"), authmidobj.verifyBusinessToken,(req, res) => {
  companyManager
    .UpdateFactoryProduct(req.body)
    .then((result) => {
      res.status(200).send({ message: result });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post(
  '/update_factory',
  add_api_access("Factory"),
  authmidobj.verifyBusinessToken,
  companyValidatorObj.validateRequestAddFactory,
  (req, res) => {
    companyManager
      .UpdateFactory(req.body)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
);
app.post('/fetch_factory_product', authmidobj.verifyBusinessTokenUnProtected,(req, res) => {
  companyManager
    .FetchFactoryProduct(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/fetch_factory', authmidobj.verifyBusinessTokenUnProtected,(req, res) => {
  companyManager
    .FetchFactory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.post('/fetch_factory_details', authmidobj.verifyBusinessTokenUnProtected,async (req, res) => {
  companyManager
    .FetchFactoryDetails(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/factory_available_products', authmidobj.verifyBusinessTokenUnProtected,async (req, res) => {
  companyManager
    .FactoryAvailableProducts(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.post(
  '/add_factory',
  add_api_access("Factory"),
  authmidobj.verifyBusinessToken,
  companyValidatorObj.validateRequestAddFactory,
  (req, res) => {
    companyManager
      .AddFactory(req.body)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
);
app.post('/product_category',  authmidobj.verifyBusinessTokenUnProtected,(req, res) => {
  companyManager
    .ProductCategory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/delete_company_category',  add_api_access("Products"), authmidobj.verifyBusinessToken,(req, res) => {
  companyManager
    .DeleteCompanyCategory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/get_company_category', authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  companyManager
    .GetCompanyCategory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/edit_company_category', add_api_access("Products"), authmidobj.verifyBusinessToken, (req, res) => {
  companyManager
    .EditCompanyCategory(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/add_company_category', add_api_access("Products"), authmidobj.verifyBusinessToken, (req, res) => {
  companyManager
    .AddCompanyCategory(req.body)

    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/factory_product',(req, res) => {
  companyManager
    .FactoryProduct(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.post('/product_details',add_api_access("Products"), authmidobj.verifyBusinessToken, (req, res) => {
  companyManager
    .ProductDetails(req.body)
    .then((result) => {
      console.log('heh');
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});

// app.post('/get-credits-transactions-details', add_api_access("Credits"), authmidobj.verifyBusinessToken,(req, res) => {
app.post('/get-credits-transactions-details', (req, res) => {
  companyManager
    .getTransactionsByBusinessId(req.body)
    .then((formattedData) => {
      res.json(formattedData);
    })
    .catch((error) => {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/change-password', authmidobj.verifyBusinessTokenUnProtected, (req, res) => {
  companyManager
    .ChangePassword(
      req.user.company_id,
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
});

app.post('/change-email', authmidobj.verifyBusinessTokenUnProtected, async (req, res) => {
  try {
    const data = await companyManager.changeEmail(
      req.body,
      req.user.company_id,
      req.user.user_id
    );
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

app.post('/forget-password', async (req, res) => {
  try {
    const data = await companyManager.forgetPassword(req.body);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});
app.post('/reset-password', async (req, res) => {
  try {
    const data = await companyManager.resetPassword(req.body);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

app.post('/verify-email', async (req, res) => {
  try {
    const data = await companyManager.verifyEmail(req.body);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

app.post('/hash-all-passwords', async (req, res) => {
  companyManager
    .HashAllPasword()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.post('/change-new-password',authmidobj.verifyBusinessTokenOnly, (req, res) => {
  console.log(req.user)
  companyManager
    .ChangeNewPassword(
      req.user.company_id,
      req.user.user_id,
      req.body.new_password
    )
    .then((Data) => {
      res.send(Data);
    })
    .catch((err) => {
      // console.error('Error fetching transactions:', error);
      res.status(400).send(err);
    });
});

app.post('/me', authmidobj.verifyBusinessTokenUnProtected,(req, res) => {
  companyManager
    .Identity(req.body)
    .then(({ accessToken, company_details,user_details }) => {
      res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .json({ accessToken, data:{company_details,user_details} });
    })
    .catch((err) => {
      console.log(err)
      res.status(400).send(err);
    });
});

app.post('/get-company-overview',add_api_access("Analytics"),authmidobj.verifyBusinessToken, (req, res) => {
  companyManager.getCompanyOverView(
    req.body,
      req.user
      
      
    )
    .then((Data) => {
      res.send(Data);
    })
    .catch((err) => {
      // console.error('Error fetching transactions:', error);
      res.status(400).send(err);
    });
});

app.post('/get-installation-data',add_api_access("Installation"),authmidobj.verifyBusinessToken, (req, res) => {
  companyManager.getInstallationData(
    req.body,
      req.user
      
      
    )
    .then((Data) => {
      res.send(Data);
    })
    .catch((err) => {
      // console.error('Error fetching transactions:', error);
      res.status(400).send(err);
    });
});


app.post('/get_installation_mail_details',authmidobj.verifyBusinessToken ,async (req, res) => {
  companyManager.getInstallationMailDetails(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  

});

app.post('/update_installation_mail_details',authmidobj.verifyBusinessToken ,async (req, res) => {
  companyManager.updateInstallationMailDetails(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  
});

app.post('/new_dashboard_role',add_api_access("Roles"),authmidobj.verifyBusinessToken , (req, res) => {
console.log(req.body)
  companyManager.createNewDashBoardRole(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  
});
app.post('/update-dashboard-role',add_api_access("Roles"),authmidobj.verifyBusinessToken ,(req, res) => {
  companyManager.updateDashBoardRole(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  
});
app.post('/get-dashboard-role',add_api_access("Roles"),authmidobj.verifyBusinessToken , (req, res) => {
  companyManager.getDashBoardRoleDataById(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  
});

app.post('/delete-dashboard-role',add_api_access("Roles"),authmidobj.verifyBusinessToken , (req, res) => {
  companyManager.deleteDashBoardRoleByID(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  
});

app.post('/dashboard-roles-list',add_api_access("Roles"),authmidobj.verifyBusinessToken , (req, res) => {
  companyManager.getDashboardRolesList(req.body, req.user)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((err) => {
    res.status(404).send(err);
  });

  
});

app.post('/new_dashboard_user',add_api_access("Dashboard users"),authmidobj.verifyBusinessToken , (req, res) => {
  console.log(req.body)
    companyManager.createNewDashBoardUser(req.body, req.user)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  
    
  });
  app.post('/update-dashboard-user',add_api_access("Dashboard users"),authmidobj.verifyBusinessToken ,(req, res) => {
    companyManager.updateDashBoardUser(req.body, req.user)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  
    
  });

  app.post('/dashboard-users-list',add_api_access("Dashboard users"),authmidobj.verifyBusinessToken , (req, res) => {
    companyManager.getDashBoardUsersList(req.body, req.user)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  
    
  });

  app.post('/delete-dashboard-user',add_api_access("Dashboard users"),authmidobj.verifyBusinessToken , (req, res) => {
    companyManager.DeleteDashBoardUser(req.body, req.user)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  
    
  });

  app.post('/get-dashboard-user',add_api_access("Dashboard users"),authmidobj.verifyBusinessToken , (req, res) => {
    companyManager.getDashBoardUserData(req.body, req.user)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  
    
  });

  

module.exports = app;
