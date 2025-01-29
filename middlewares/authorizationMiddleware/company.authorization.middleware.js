const MicroService = require('../../MicroServices/services');
// const { resolve } = require('path
const micro_service = new MicroService();

const CompanyRepository = require('../../Repositories/company_repository');
const company_repo = new CompanyRepository();
class AuthMiddleware {
  verifyBusinessToken = (req, res, next) => {
    console.log(req.body);
    let accessToken = req.body.token;
    var company_id;
    micro_service
      .VerifyCompanyJWT(accessToken)
      .then((token_data) => {
        console.log(token_data)

        req.user = token_data

        company_repo.doesUserExistById(token_data.user_id,token_data.company_id).then((result)=>{

          if (!result[0].passwordChanged) {
            // If not, redirect or render a page for password change
            
            return res.redirect('https://dev-company.onepoket.com/login/generate_new_password');
          }
          company_repo.doesDashboardUserExistById(token_data.user_id).then((userData)=>{
            console.log(userData)
              if(userData[0].is_root){
                next();

              }
              else{
                company_repo.getDashboardRolePermissionsNameById({role_id:userData[0].fk_role_id},token_data.company_id).then((permissions)=>{
                  
                  if(!permissions.some(permission => permission.permission_name ===req.body.api_access_name )                  ){
                    res.status(500).send("Access Denied!"); 
                  }
                  else{
                    next();
                  }
    
    
                }).catch((err)=>{
                  res.status(500).send(err);          
                })
              }
            


         

          }).catch((err)=>{
            res.status(500).send(err);          })


        }).catch((err)=>{
          console.log(err + 'midd1');
          res.status(500).send(err);
        })


       
      })
      .catch((err) => {
        console.log(err + 'midd');
        res.status(500).send(err);
      });
  };

  verifyBusinessTokenUnProtected = (req, res, next) => {
    console.log(req.body.token);
    let accessToken = req.body.token;
    var company_id;
    micro_service
      .VerifyCompanyJWT(accessToken)
      .then((token_data) => {
        req.user = token_data

        company_repo.doesUserExistById(token_data.user_id,token_data.company_id).then((result)=>{

          if (!result[0].passwordChanged) {
            // If not, redirect or render a page for password change
            
            return res.redirect('https://dev-company.onepoket.com/login/generate_new_password');
          }
         next()

        }).catch((err)=>{
          console.log(err + 'midd1');
          res.status(500).send(err);
        })


       
      })
      .catch((err) => {
        console.log(err + 'midd');
        res.status(500).send(err);
      });
  };
  verifyAPIAccess=async(access)=>{

  }
  verifyBusinessTokenOnly = (req, res, next) => {
    console.log(req.body.token);
    let accessToken = req.body.token;
    var company_id;
    micro_service
      .VerifyCompanyJWT(accessToken)
      .then((token_data) => {
        // req.user = data;
       req.user = token_data

        next();
      })
      .catch((err) => {
        console.log(err + 'midd');
        res.status(500).send(err);
      });
  };
}

module.exports = AuthMiddleware;
