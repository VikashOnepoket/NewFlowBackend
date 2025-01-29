const db = require('../Database_connection/db');

class PDFTemplatesRepository {
  SaveNewPDFTemplateData = async (body, s3Url) => {
    // return new Promise((resolve, reject) => {
    let use_rect = 0;
    if (
      body.use_rect == 1 ||
      body.use_rect == true ||
      body.use_rect === 'true'
    ) {
      use_rect = 1;
    }
    try {
      const {
        template_name,
        is_global,
        is_private,
        business_id,
        page_height,
        page_width,
        labels_in_row,
        labels_left_margin,
        lables_height,
        lables_width,
        serial_no,
        rect_top_margin,
        rect_left_margin,
        rect_width,
        rect_height,
        qr_size,
        qr_left_padding,
        qr_top_padding,
        serial_top_margin,
        font_size,
      } = body;
      const data = await db
        .promise()
        .query(
          'INSERT INTO qr_pdf_templates(template_name, is_global, is_private,  pdf_url, page_height, page_width, labels_in_row, labels_left_margin, lables_height, lables_width, use_rect, rect_top_margin, rect_left_margin, rect_width, rect_height, qr_size, qr_left_padding, qr_top_padding, serial_top_margin, font_size,serial_no) VALUES(?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)',
          [
            template_name,
            is_global,
            is_private,
            s3Url,
            page_height,
            page_width,
            labels_in_row,
            labels_left_margin,
            lables_height,
            lables_width,
            use_rect,
            rect_top_margin,
            rect_left_margin,
            rect_width,
            rect_height,
            qr_size,
            qr_left_padding,
            qr_top_padding,
            serial_top_margin,
            font_size,
            serial_no,
          ]
        );
      return data[0];

      // if (result2.length == 0) {
      //   return resolve();
      // throw new Error(err.message);
      //   return result2;
    } catch (err) {
      throw new Error(err.message);
    }
    // });
  };

  GetAllGlobalTemplatesData() {
    return new Promise((resolve, reject) => {
      db.query(
        'select *  from qr_pdf_templates where is_global=1 and is_deleted!=1',
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(result2);
          }
        }
      );
    });
  }

  EditPDFTemplateData = async (templateId, body, s3Url) => {
    try {
      let use_rect = 0;
      if (
        body.use_rect == 1 ||
        body.use_rect == true ||
        body.use_rect === 'true'
      ) {
        use_rect = 1;
      }
      const {
        template_name,
        is_global,
        is_private,
        business_id,
        page_height,
        page_width,
        labels_in_row,
        labels_left_margin,
        lables_height,
        lables_width,
        serial_no,
        rect_top_margin,
        rect_left_margin,
        rect_width,
        rect_height,
        qr_size,
        qr_left_padding,
        qr_top_padding,
        serial_top_margin,
        font_size,
      } = body;

      const data = await db
        .promise()
        .query(
          'UPDATE qr_pdf_templates SET template_name=?, is_global=?, is_private=?, pdf_url=?, page_height=?, page_width=?, labels_in_row=?, labels_left_margin=?, lables_height=?, lables_width=?, use_rect=?, rect_top_margin=?, rect_left_margin=?, rect_width=?, rect_height=?, qr_size=?, qr_left_padding=?, qr_top_padding=?, serial_top_margin=?, font_size=?, serial_no=? WHERE template_id=?',
          [
            template_name,
            is_global,
            is_private,
            s3Url,
            page_height,
            page_width,
            labels_in_row,
            labels_left_margin,
            lables_height,
            lables_width,
            use_rect,
            rect_top_margin,
            rect_left_margin,
            rect_width,
            rect_height,
            qr_size,
            qr_left_padding,
            qr_top_padding,
            serial_top_margin,
            font_size,
            serial_no,
            templateId, // Assuming templateId is the identifier for your record
          ]
        );

      return 'Template Updated';
    } catch (err) {
      throw new Error(err.message);
    }
  };

  DeleteTemplate(template_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'update qr_pdf_templates set is_deleted=1 where template_id=?',
        [template_id],
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            return resolve('Template deleted');
          }
        }
      );
    });
  }

  GetTemplateDataByID(template_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'select * from qr_pdf_templates where is_deleted!=1 and template_id=?',
        [template_id],
        (err, result2) => {
          if (err) {
            return reject(err);
          } else {
            if (result2.length == 0) {
              return reject('Invalid Template Id');
            }
            return resolve(result2[0]);
          }
        }
      );
    });
  }
}

module.exports = PDFTemplatesRepository;
