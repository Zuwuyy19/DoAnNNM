const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");

/**
 * Hàm sắp xếp các tham số theo bảng chữ cái (alphabetICAL sort)
 * Theo đúng chuẩn VNPay 2.1.0
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Hàm tạo URL thanh toán VNPay
 */
function createPaymentUrl(order, ipAddr) {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");

  let vnp_Params = {
    'vnp_Version': '2.1.0',
    'vnp_Command': 'pay',
    'vnp_TmnCode': tmnCode,
    'vnp_Locale': 'vn',
    'vnp_CurrCode': 'VND',
    'vnp_TxnRef': order.orderNumber,
    'vnp_OrderInfo': 'Thanh toan cho don hang ' + order.orderNumber,
    'vnp_OrderType': 'other',
    'vnp_Amount': Math.round(order.totalAmount * 100),
    'vnp_ReturnUrl': returnUrl,
    'vnp_IpAddr': ipAddr || '127.0.0.1',
    'vnp_CreateDate': createDate
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
}

/**
 * Hàm kiểm tra chữ ký phản hồi từ VNPay
 */
function verifyReturnUrl(vnp_Params) {
  const secretKey = process.env.VNP_HASH_SECRET;
  const secureHash = vnp_Params['vnp_SecureHash'];

  // Loại bỏ các tham số không dùng để tính hash
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sắp xếp lại tham số
  const sortedParams = sortObject(vnp_Params);
  
  // Tạo chuỗi signData
  const signData = qs.stringify(sortedParams, { encode: false });
  
  // Tính hash để đối soát
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  // Kiểm tra (Không phân biệt hoa thường chữ cái trong Hash)
  return secureHash && secureHash.toLowerCase() === signed.toLowerCase();
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
};
