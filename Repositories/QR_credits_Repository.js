const db = require('../Database_connection/db');

class QRCreditRepository {
  insertQRCreditTransaction = async (transactionData) => {
    try {
      const sql = `
            INSERT INTO company_qr_credits
            (pdf_url,business_id, transaction_remarks, created_on, amount, is_debited, is_credited, transaction_type, debited_by, remaining_credits, credited_by, product_id)
            VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

      const values = [
        transactionData.pdf_url,
        transactionData.business_id,
        transactionData.transaction_remarks,
        transactionData.created_on,
        transactionData.amount,

        transactionData.is_debited,
        transactionData.is_credited,
        transactionData.transaction_type,
        transactionData.debited_by,
        transactionData.remaining_credits,
        transactionData.credited_by,
        transactionData.product_id
      ];

      await db.promise().query(sql, values);
      //   connection.release();
    } catch (error) {
      throw error;
    }
  };
}

module.exports = QRCreditRepository;
