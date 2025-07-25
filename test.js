const axios = require('axios');

/**
 * Automatically applies grammar corrections based on LanguageTool suggestions.
 * @param {string} text - The input text to correct.
 * @returns {string} - The corrected version of the input text.
 */
async function autoCorrectGrammar(text) {
  try {
    const response = await axios.post('https://api.languagetool.org/v2/check', null, {
      params: {
        text,
        language: 'en-US'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    let correctedText = text;
    const matches = response.data.matches;

    // Sort by offset descending to avoid replacing earlier matches that shift text positions
    matches.sort((a, b) => b.offset - a.offset);

    for (const match of matches) {
      if (match.replacements && match.replacements.length > 0) {
        const replacement = match.replacements[0].value;

        // Replace the incorrect part using the offset and length
        correctedText = 
          correctedText.slice(0, match.offset) +
          replacement +
          correctedText.slice(match.offset + match.length);
      }
    }

    return correctedText;

  } catch (error) {
    console.error("Grammar check failed:", error.message);
    return text; // fallback to original text if error
  }
}

// Example usage
(async () => {
  const badParagraph = "7. Above all, keep in mind that the best accessory is confidence.  Own your fashion choices with pride and confidence, just like African superstars do.  What really creates a fashion statement is when you feel comfortable about what you're wearing, and it shows.";
  const corrected = await autoCorrectGrammar(badParagraph);
  console.log("Original: ", badParagraph);
  console.log("Corrected:", corrected);
})();
