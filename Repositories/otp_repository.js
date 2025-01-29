
const db = require('../Database_connection/db');

class OTP{

    saveNewOTP(otp,phone,interval,type){
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM otp WHERE phone = ? and type=?',
                [phone,type],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    console.log(result)

                        if(result&&result.length>0){
                            db.query(
                                `UPDATE otp SET otp = ?, created_at = NOW(), expire_at = NOW() + INTERVAL ${interval} MINUTE, status = 0, is_expired = 0 ,resend_count=1,unsuccessful_attempt=0 WHERE phone = ? and type=?`,
                                [otp,phone,type],
                                (err, result2) => {
                                  if (err) {
                                    console.log("err"+err)
                                    return reject(err);
                                  }
                                  else{
                                    return resolve("1")
                                  }
                                })
                        }

                    else{
                        console.log(otp,phone)
                            db.query(`INSERT INTO otp (otp, created_at, expire_at, phone, status, is_expired,type,resend_count,unsuccessful_attempt) VALUES (?, NOW(), NOW() + INTERVAL ${interval} MINUTE, ?, 0, 0,?,1,0)`,
                                [otp,phone,type],
                                (err, result2) => {
                                  if (err) {
                                    console.log("err"+err)

                                    return reject(err);
                                  }
                                  else{
                                    console.log(result2)
                                    return resolve("1")
                                  }
                                })
                        }

                  }})

        })

    }

    updateOTPExpiration(phone,interval,type,count){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM otp WHERE phone = ? and type=?`,
                [phone,type],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    console.log(result)

                        if(result&&result.length>0){
                            if(result[0].expire_at<Date.now()){
                                return reject("OTP Expired!")
                            }
                            const resend_count=result[0].resend_count+1
                            db.query(
                                `UPDATE otp SET created_at = NOW(), expire_at = NOW() + INTERVAL ${interval} MINUTE,resend_count=?,unsuccessful_attempt=0 WHERE phone = ? and type=?`,
                                [count,phone,type],
                                (err, result2) => {
                                  if (err) {
                                    console.log("err"+err)
                                    return reject(err);
                                  }
                                  else{
                                    return resolve("1")
                                  }
                                })
                        }
                        else{
                            return reject("OTP not Found!")
                        }

                    

                  }})

        })

    }

    updateOTPStatus(phone,type){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM otp WHERE phone = ? and type=?`,
                [phone,type],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    console.log(result)

                        if(result&&result.length>0){
                            if(result[0].expire_at<Date.now()){
                                return reject("OTP Expired!")
                            }
                            db.query(
                                `UPDATE otp SET is_expired=1,status=1 WHERE phone = ? and type=?`,
                                [phone,type],
                                (err, result2) => {
                                  if (err) {
                                    console.log("err"+err)
                                    return reject(err);
                                  }
                                  else{
                                    return resolve("1")
                                  }
                                })
                        }
                        else{
                            return reject("OTP not Found!")
                        }

                    

                  }})

        })

    }

    updateOTPUnsuccessfulAttempts(phone,type){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM otp WHERE phone = ? and type=?`,
                [phone,type],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    console.log(result)

                        if(result&&result.length>0){
                            if(result[0].expire_at<Date.now()){
                                return reject("OTP Expired!")
                            }
                            const unsuccessful_attempt=result[0].unsuccessful_attempt+1


                            db.query(
                                `UPDATE otp SET unsuccessful_attempt=? WHERE phone = ? and type=?`,
                                [unsuccessful_attempt,phone,type],
                                (err, result2) => {
                                  if (err) {
                                    console.log("err"+err)
                                    return reject(err);
                                  }
                                  else{
                                    return resolve("1")
                                  }
                                })
                        }
                        else{
                            return reject("OTP not Found!")
                        }

                    

                  }})

        })

    }

    fetchOTP(phone,type){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM otp WHERE phone = ? and type=?`,
                [phone,type],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    console.log(result)

                        if(result&&result.length>0){

                          return resolve(result[0])
                        }
                        else{
                            return reject("OTP not Found!")
                        }

                    

                  }})

        })

    }


    // blockUser(phone,type){
    //     return new Promise((resolve, reject) => {
    //         db.query(
    //             `SELECT * FROM otp WHERE phone = ? and type=?`,
    //             [phone,type],
    //             (err, result) => {
    //               if (err) {
    //                 return reject(err);
    //               } else {
    //                 console.log(result)

    //                     if(result&&result.length>0){

    //                       return resolve(result[0])
    //                     }
    //                     else{
    //                         return reject("OTP not Found!")
    //                     }

                    

    //               }})

    //     })

    // }


}

module.exports=OTP