const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const constant = require('../config/constant');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
//const {
//  IMG_LOCATION,
//  AWS_IMG_BUCKET,
//} = require('../config/env_config');
const IMG_LOCATION = 'local';
const AWS_IMG_BUCKET = 'dummy-bucket';
const AWS_REGION_NAME = 'us-east-1';
const AWS_IMG_CLOUDFRONT = 'dummy-cloudfront.com';

const s3 = new S3Client({
  region: AWS_REGION_NAME,
});

const fileNameGenerator = (originalFileName) => {
  const randomString = crypto.randomBytes(10).toString('hex');
  return randomString + Date.now() + path.extname(originalFileName);
};

const writeFileLocal = (destinationDir, fileName, contents) => {
  const imagePath = destinationDir + fileName;
  try {
    // Creates directory  /public/images, regardless of whether `/public` and /public/images exist.
    fs.mkdirSync(destinationDir, { recursive: true });
  } catch (err) {
    throw err;
  }
  fs.writeFile(imagePath, contents, (err) => {
    if (err) throw err;
  });
};

exports.getImageUrlForModel = (filename, prefix) => {
  return AWS_IMG_CLOUDFRONT + (IMG_LOCATION == 'S3' ? prefix : '') + filename;
};

exports.deleteImageHelper = async (file) => {
  try {
    if (IMG_LOCATION == 'local') {
      return fs.unlinkSync(file.path);
    } else if (IMG_LOCATION == 'S3') {
      const fileNameToRemove = file.key;
      const param = {
        Bucket: AWS_IMG_BUCKET,
        Key: fileNameToRemove,
      };
      const command = new DeleteObjectCommand(param);
      return await s3.send(command);
    }
  } catch (err) {
    throw err;
  }
};

exports.imageUpload = async (file, prefix) => {
  try {
    let result = {};
    if (IMG_LOCATION == 'local') {
      const fileName = fileNameGenerator(file.originalname);
      const imagePath = './public/images/' + fileName;
      const destinationDir = './public/images/';
      writeFileLocal(destinationDir, fileName, file.buffer);
      result.filename = fileName;
      result.path = imagePath;
      return result;
    } else if (IMG_LOCATION == 'S3') {
      const fileName = fileNameGenerator(file.originalname);
      const imgKey = prefix + fileName;
      const uploadParam = {
        Bucket: AWS_IMG_BUCKET,
        Key: imgKey,
        Body: file.buffer,
      };
      await s3.send(new PutObjectCommand(uploadParam));
      result.filename = fileName;
      result.key = imgKey;
      return result;
    }
  } catch (err) {
    throw err;
  }
};

const deleteSupplierImageLocal = (file) => {
  try {
    const filepath = [];
    for (const key in file) {
      filepath.push(file[key].path);
    }
    return filepath.forEach((path) => fs.unlinkSync(path));
  } catch (err) {
    throw err;
  }
};

const deleteSupplierImageS3 = async (file) => {
  try {
    const fileNameToRemove = [];
    for (const idx in file) {
      fileNameToRemove.push({ key: file[idx].key });
    }
    const param = {
      Bucket: AWS_IMG_BUCKET,
      Delete: {
        Objects: fileNameToRemove,
      },
    };
    const command = new DeleteObjectsCommand(param);
    return await s3.send(command);
  } catch (err) {
    throw err;
  }
};

exports.deleteSupplierImage = (file) => {
  if (IMG_LOCATION == 'local') {
    if (file.old_supplier_img) {
      file.old_supplier_img = { path: './public/images/' + file.old_supplier_img };
    }
    deleteSupplierImageLocal(file);
  } else if (IMG_LOCATION == 'S3') {
    if (file.old_supplier_img) {
      file.old_supplier_img = { key: constant.PREFIX.IMG_SUPPLIER + file.old_supplier_img };
    }
    deleteSupplierImageS3(file);
  }
};
