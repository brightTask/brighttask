const express = require('express');
const multer = require('multer');
const fs = require('fs');
const PDFMake = require('pdfmake');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('testing'));

// Set up font definitions
const fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts/Roboto-MediumItalic.ttf')
  }
};

const printer = new PDFMake(fonts);

// Route: Home Form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route: Handle Form Submission
app.post('/generate-cv', upload.single('jobAdvert'), (req, res) => {
  const {
    fullName, email, phone, summary,
    education, experience, skills
  } = req.body;

  const jobAdvertText = req.file
    ? fs.readFileSync(req.file.path, 'utf-8') || 'N/A'
    : req.body.jobAdvertText || 'N/A';

  // Define pdfMake document structure
  const docDefinition = {
    content: [
      { text: fullName, style: 'header' },
      { text: `${email} | ${phone}`, style: 'subheader' },
      { text: 'Professional Summary', style: 'section' },
      summary,
      { text: 'Education', style: 'section' },
      education,
      { text: 'Experience', style: 'section' },
      experience,
      { text: 'Skills', style: 'section' },
      skills,
      { text: 'Job Advert Summary (Uploaded/Typed)', style: 'section' },
      jobAdvertText
    ],
    styles: {
      header: { fontSize: 22, bold: true, margin: [0, 0, 0, 8] },
      subheader: { fontSize: 12, margin: [0, 0, 0, 12] },
      section: { fontSize: 16, bold: true, margin: [0, 10, 0, 6] }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=cv.pdf');
  pdfDoc.pipe(res);
  pdfDoc.end();

  if (req.file) fs.unlinkSync(req.file.path); // clean up
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
