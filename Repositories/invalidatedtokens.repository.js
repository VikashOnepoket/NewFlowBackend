const db = require('../Database_connection/db');

class InvalidateTokensRepository {
  InsertNewRecord(business_id, type, user_type) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into invalidated_token(business_id,token_type,user_type) values (?,?,?)',
        [business_id, type, user_type],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log();
            return resolve(result);
          }
        }
      );
    });
  }

  InsertNewEmailRecord(business_id, type, email, user_type) {
    return new Promise((resolve, reject) => {
      db.query(
        'insert into invalidated_token(business_id,token_type,email,user_type) values (?,?,?,?)',
        [business_id, type, email, user_type],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log();
            return resolve(result);
          }
        }
      );
    });
  }

  GetToken(business_id, token_id, user_type) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from invalidated_token where business_id=? and token_id=? and user_type=?',
        [business_id, token_id, user_type],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log();
            return resolve(result);
          }
        }
      );
    });
  }

  DeleteToken(business_id, tokenId, user_type) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from invalidated_token where business_id=? and token_id=? and user_type=?',
        [business_id, tokenId, user_type],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log();
            return resolve(result);
          }
        }
      );
    });
  }

  DeleteTokenByID(business_id, type, user_type) {
    return new Promise((resolve, reject) => {
      db.query(
        'delete from invalidated_token where business_id=? and token_type=? and user_type=? ',
        [business_id, type, user_type],
        (err, result) => {
          if (err) {
            return reject(err);
          } else {
            console.log();
            return resolve(result);
          }
        }
      );
    });
  }
}

module.exports = InvalidateTokensRepository;
