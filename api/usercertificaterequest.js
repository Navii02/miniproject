const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const certificateRequest = require('../models/usercertificate');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'certificate/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + Date.now() + ext;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

app.get('/certificateRequests', async (req, res) => {
  try {
    const requests = await certificateRequest.find();
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch certificate requests.' });
  }
});

app.post('/certificateRequests', async (req, res) => {
  try {
    const certificate = new certificateRequest(req.body);
    await certificate.save();

    res.json({ message: 'Certificate request sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send certificate request.' });
  }
});

app.post('/sendFile/:requestId', upload.single('file'), async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const certificate = await certificateRequest.findById(requestId);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate request not found' });
    }

    const uploadedFile = req.file;
    const fileExtension = path.extname(uploadedFile.originalname);
    const newFileName = `certificate-${requestId}${fileExtension}`;
    const newFilePath = path.join('certificate/', newFileName);

    fs.renameSync(uploadedFile.path, newFilePath);

    certificate.fileUrl = newFilePath;
    await certificate.save();

    res.status(200).json({ message: 'Certificate sent to student!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send certificate' });
  }
});

app.get('/getFile', async (req, res) => {
  try {
    const certificate = await certificateRequest.findOne();
    res.json({ certificate });
   

    if (!certificate) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = path.join(__dirname, '..', certificate.fileUrl);
    res.status(200).download(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch file' });
  }
});

module.exports = app;

