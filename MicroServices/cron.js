const cron = require('node-cron');
const customer_repository=require('../Repositories/customer_repository')
const customerRepoObj=new customer_repository()
cron.schedule('* * * * *', async () => {
    try {
      const currentTime = new Date();
    //   console.log(currentTime + 'curre');
      const UnBlockUser=await customerRepoObj.UnBlockUser()
      const ResetSentOTPCount=await customerRepoObj.ResetSentOTPCount()

    return
    
    
    }catch(err){ console.error('Error in cron job:', err);}})

    process.on('unhandledRejection', (error) => {
        console.error('Unhandled Promise Rejection:', error);
      });
      
