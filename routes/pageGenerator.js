const express = require('express');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config(); // Load API key from .env

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Use .env variable
});

// Prompts for generating each page
const prompts = {
  home: `Generate a complete HTML, CSS, and JavaScript file using Bootstrap 5 for a homepage. Use professional, mobile-first, clean responsive design principles. Ensure the output is more than 700 lines of high-quality, modular, readable, and semantically structured code.

Use the following color theme variables:
:root {
  --primary: #00bfa6;
  --secondary: #1f2937;
}

### NAVIGATION ###
At the top of the page, include a fully responsive Bootstrap 5 navigation bar that contains brand/logo on the left and the following links on the right:
- Home (link to home.html)
- About (link to about.html)
- Services (link to services.html)
- Contact (link to contact.html)

Ensure that the navbar collapses correctly into a hamburger menu on small screens.

### HEADER SECTION ###
Include a full-width hero section with a background color using --primary. Add a title, a subtitle, and a call-to-action button that scrolls down to the categories section.

### CATEGORIES & SERVICES LISTING ###
Fetch data asynchronously from endpoint '/api/categories'. The expected response structure is:

{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Category 1",
      "description": "Some category description",
      "order": 1,
      "services": [
        {
          "id": 10,
          "name": "Service Name",
          "description": "Service description here",
          "price": 50,
          "priceUnit": "USD",
          "order": 1,
          "available": true,
          "icon": "🎬"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
Use Bootstrap 5 card components to display each category inside a grid with flex-wrap-auto() layout. Each category should include its name, description, and a nested list of its services.

Under each category, list its services using smaller cards or list items styled professionally with Bootstrap. Each service should display:

icon (as text), 

name,

description (brief),

price + priceUnit,

availability badge (green if true, red if false),

a button or link to /generate/service?id={service.id} when clicked.

AUTO LOAD MORE
When the user scrolls to the bottom of the page or reaches the end of currently displayed categories, fetch the next page using the pagination data, and append it to the existing list. Implement smooth scroll loading and show a spinner/loader during fetch.

Ensure proper error handling if fetch fails. Use fetch API only. Do not use jQuery.

FOOTER
Add a professional footer with company info, links to pages, social media icons (use Bootstrap icons), and copyright.

ADDITIONAL REQUIREMENTS
Use modular sections and semantic HTML5 structure.

Avoid unnecessary inline styles.

Add hover effects, transitions, and proper spacing using Bootstrap utilities.

Make sure the page is fully responsive on all screen sizes.

Use Bootstrap 5 only (no jQuery, no external CSS frameworks).

Include minimal and clean custom CSS inside a <style> tag.

Include all JavaScript needed in a <script> tag at the bottom.

Do not return any explanation or comments. Only return the full complete code.`,

  service: `Generate a full HTML, CSS, and JS (bootstrap 5) code for a service page. Use a clean, mobile-first responsive design. Display flex-wrap-auto() a list of items fetched from endpoint /api/service/:id ({
    "service": {
      "id",
      "name",
      "description",
      "price",
      "priceUnit",
      "requirements": ["", ""],
      "available": boolean,
      "icon",
      "category": {
        "id",
        "name"
      },
      "serviceProviders": [{
        "id",
        "bio",
        "isVerified",
        "portfolioUrl",
        "location",
        "rating": 4.8,
        "createdAt",
        "HustlerService": {
          "service_score",
          "available",
          "requirements": {
            "tools": ["absum", "eius", "texo"],
            "materials": ["creo", "volup"]
          }
        },
        "user": {
          "id",
          "username",
          "profile_pic"
        }
      }]
    }
  }). Include navigation bar linking to "about.html", "services.html", and "contact.html". Do not explain anything. Only return the full code.`,

  about: `Generate a full HTML, CSS, and JS (bootstrap 5) code for an about page. Fetch team info from endpoint /auth/team. Include navigation to "home.html", "services.html", and "contact.html". Do not return explanations, only code.`,

  services: `Generate a full HTML, CSS, and JS (bootstrap 5) code for a services page. Get service data from /api/services({
    "services": [{
        "id",
        "name",
        "description",
        "price",
        "priceUnit",
        "order",
        "available": boolean,
        "icon"
    }],
    "pagination": {
      "page",
      "limit",
      "totalPages"
    }
  }). Enable loadMore when end page is reached, clicked service should pass id to service.html?id=id. Include navigation links to "home.html", "about.html", "contact.html". No explanation. Only code.`,

  contact: `Generate a contact page in HTML, CSS, and JS (bootstrap 5). Submit form data to /apicontact.html via POST. Show a success message. Include navigation to all other pages. No explanation.`
};

// Output directory
const outputDir = path.join(__dirname, '..', 'testing');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Core OpenAI chat function
async function sendMessage(prompt) {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI error:', error.message || error);
    throw error;
  }
}

// Function to generate and save HTML file
async function generatePage(pageName, prompt) {
  try {
    const html = await sendMessage(prompt);
    const filePath = path.join(outputDir, `${pageName}.html`);
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✅ ${pageName}.html generated`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to generate ${pageName}: ${err.message}`);
    return false;
  }
}

// Route to generate all pages
router.get('/all', async (req, res) => {
  for (const [pageName, prompt] of Object.entries(prompts)) {
    await generatePage(pageName, prompt);
  }
  res.send('✅ All pages have been generated.');
});

// Route to generate a single page
router.get('/:page', async (req, res) => {
  const page = req.params.page;
  const prompt = prompts[page];

  if (!prompt) {
    return res.status(400).send('❌ Unknown page name.');
  }

  const success = await generatePage(page, prompt);
  const filePath = path.join(outputDir, `${page}.html`);

  if (success && fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(500).send(`❌ Failed to generate or locate ${page}.html`);
  }
});

module.exports = router;