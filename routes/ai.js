const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Utility: count words
const wordCount = (text) => (text || '').split(/\s+/).filter(Boolean).length;

// Utility: expand short paragraph
async function expandSection(title, paragraph) {
  const expansionPrompt = `Expand this blog section titled "${title}" to be at least 300 words that sounds human, is informative and helpful, and passes AdSense quality. Maintain quality, relevance, and tone(casual but professional tone.).\n\nOriginal paragraph:\n${paragraph}`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: expansionPrompt }],
  });
  return completion.choices[0].message.content.trim();
}

// GET form page
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Article Generator</title>
      <style>
        body { font-family: Arial; margin: 40px; background: #f7f7f7; }
        form { background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #ccc; }
        button { background: #00bfa6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h2 style="text-align:center;">Generate Article with AI</h2>
      <form method="POST" action="/ai">
        <label>Title</label>
        <input type="text" name="title" placeholder="e.g. 7 Timeless Fashion Tips..." required />
        <label>Hint (optional)</label>
        <textarea name="hint" placeholder="e.g. Make it fashion-focused, copyright free..."></textarea>
        <button type="submit">Generate</button>
      </form>
    </body>
    </html>
  `);
});

// POST generate
router.post('/', async (req, res) => {
  const { title, hint } = req.body;

  const mainPrompt = `
Write a detailed blog article in JSON format about ${title} that sounds human, includes real-life examples, is informative and helpful, and passes AdSense quality. Use a casual but professional tone.
${hint || ""}

Return your response strictly in JSON with this structure:

{
  "title": string,
  "excerpt": string,
  "hashtags": string[],
  "sections": [
    {
      "title": string,
      "subtitle": string (optional),
      "paragraph": string (optional),
      "list": string[] (optional),
      "quote": {
        "quote": string,
        "attribution": string
      } (optional),
      "table": {
        "headers": string[],
        "rows": string[][]
      } (optional),
      "image": {
        "url": "image-placeholder.jpg",
        "caption": string
      } (optional),
      "embed": {
        "html": string,
        "caption": string
      } (optional),
      "slide": {
        "images": [{ "url": "image-placeholder.jpg", "caption": string }]
      } (optional),
      "video": {
        "url": "video-placeholder.mp4",
        "caption": string
      } (optional)
    }
  ]
}

Each section's paragraph should be at least 300 words. Return only the JSON.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: mainPrompt }],
    });

    const json = JSON.parse(completion.choices[0].message.content);

    // Expand any short sections
    // for (const section of json.sections) {
    //   if (section.paragraph && wordCount(section.paragraph) < 300) {
    //     section.paragraph = await expandSection(section.title, section.paragraph);
    //   }
    // }

    // Build HTML
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${json.title}</title>
      <style>
        body { font-family: Arial; padding: 40px; background: #fff; line-height: 1.6; }
        h1 { color: #00bfa6; }
        h2 { color: #1f2937; }
        blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em; color: #555; font-style: italic; }
        img { max-width: 100%; height: auto; border-radius: 6px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        .hashtags { margin-top: 20px; font-style: italic; color: #888; }
        button { margin-left: 5px; }
      </style>
    </head>
    <body>
      <h1>${json.title}</h1>
      <p><em>${json.excerpt}</em></p>
      <div class="hashtags">Tags: ${json.hashtags.join(', ')}</div>
    `;

    json.sections.forEach((section, sectionIndex) => {
      const sid = `section-${sectionIndex}`;

      html += `
        <button onclick="makeEditable('${sid}-title', 'input')">✎</button>
        <button onclick="makeStatic('${sid}-title')">✔</button>
        <h2 id="${sid}-title">${section.title}
      </h2> `;

      if (section.subtitle) {
        html += ` 
          <button onclick="makeEditable('${sid}-subtitle', 'input')">✎</button>
          <button onclick="makeStatic('${sid}-subtitle')">✔</button>
        <h4 id="${sid}-subtitle">${section.subtitle}</h4>`;
      }

      if (section.paragraph) {
        html += `
          <button onclick="makeEditable('${sid}-paragraph', 'textarea')">✎</button>
          <button onclick="paraphraseContent('${sid}-paragraph')">🧠</button>
          <button onclick="makeStatic('${sid}-paragraph')">✔</button>
          <p id="${sid}-paragraph">${section.paragraph}
        </p>`;
      }

      if (section.list) {
        html += `<ul id="${sid}-list">${section.list.map((item, i) => `
            <button onclick="makeEditable('${sid}-list-${i}', 'input')">✎</button>
            <button onclick="paraphraseContent('${sid}-list-${i}')">🧠</button>
            <button onclick="makeStatic('${sid}-list-${i}')">✔</button>
          <li id="${sid}-list-${i}">${item}
          </li>`).join('')}
        </ul>`;
      }

      if (section.quote) {
        html += `
          <button onclick="makeEditable('${sid}-quote', 'textarea')">✎</button>
          <button onclick="makeStatic('${sid}-quote')">✔</button><blockquote id="${sid}-quote">
          ${section.quote.quote} — <strong>${section.quote.attribution}</strong>
        </blockquote>`;
      }

      if (section.table) {
        html += `<table><thead><tr>${section.table.headers.map((h, i) => 
          `
            <button onclick="makeEditable('${sid}-th-${i}', 'input')">✎</button>
            <button onclick="makeStatic('${sid}-th-${i}')">✔</button>
            <th id="${sid}-th-${i}">${h}
          </th>`).join('')}</tr></thead><tbody>`;

        html += section.table.rows.map((row, rIndex) => 
          `<tr>${row.map((cell, cIndex) =>
            `
              <button onclick="makeEditable('${sid}-td-${rIndex}-${cIndex}', 'input')">✎</button>
              <button onclick="makeStatic('${sid}-td-${rIndex}-${cIndex}')">✔</button>
              <td id="${sid}-td-${rIndex}-${cIndex}">${cell}
            </td>`).join('')}</tr>`).join('');

        html += `</tbody></table>`;
      }

      if (section.image) {
        html += `<figure>
          <img src="${section.image.url}" alt="">
            <button onclick="makeEditable('${sid}-image-caption', 'input')">✎</button>
            <button onclick="makeStatic('${sid}-image-caption')">✔</button>
          <figcaption id="${sid}-image-caption">${section.image.caption}
          </figcaption>
        </figure>`;
      }

      if (section.video) {
        html += `<video controls src="${section.video.url}" style="width:100%"></video>
          <button onclick="makeEditable('${sid}-video-caption', 'input')">✎</button>
          <button onclick="makeStatic('${sid}-video-caption')">✔</button>
        <p id="${sid}-video-caption"><em>${section.video.caption}</em>
        </p>`;
      }
    });

    html += `
    <script>
    function makeEditable(id, type = 'input') {
      const el = document.getElementById(id);
      if (!el) return;

      const content = el.innerText.trim();
      const input = type === 'textarea'
        ? \`<textarea id="\${id}-edit" style="width:100%;height:100px;">\${content}</textarea>\`
        : \`<input id="\${id}-edit" type="text" style="width:100%;" value="\${content}" />\`;

      el.innerHTML = input;
    }

    function makeStatic(id) {
      const editEl = document.getElementById(id + '-edit');
      if (!editEl) return;

      const newVal = editEl.value || editEl.innerText;
      document.getElementById(id).innerHTML = newVal;
    }

    async function paraphraseContent(id) {
      const el = document.getElementById(id);
      const content = el?.innerText || '';
      if (!content) return alert('No content found to paraphrase.');

      try {
        const res = await fetch('/ai/paraphrase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });

        const data = await res.json();
        if (data.success) {
          el.innerHTML = data.revised;
        } else {
          alert('Failed to paraphrase.');
        }
      } catch (err) {
        console.error(err);
        alert('Error occurred while paraphrasing.');
      }
    }
    </script>
    </body></html>`;

    res.send(html);

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send("❌ Failed to generate or expand article.");
  }
});

// Utility: Paraphrase content
async function paraphraseContent(content) {
  const prompt = `Paraphrase the following content to make it clearer, more human, and helpful, keeping the same meaning.\n\n${content}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0].message.content.trim();
}
// POST to paraphrase updated section content
router.post('/paraphrase', async (req, res) => {
  try {
    const { content } = req.body;
    const revised = await paraphraseContent(content);
    res.json({ success: true, revised });
  } catch (error) {
    console.error('Paraphrasing error:', error.message);
    res.status(500).json({ success: false, message: 'Paraphrasing failed' });
  }
});


module.exports = router;

