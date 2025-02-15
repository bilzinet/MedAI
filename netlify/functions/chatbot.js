const fetch = require('node-fetch');

const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
const headers = { 
  "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
  "Content-Type": "application/json"
};

async function query(message) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ inputs: message })
  });
  const result = await response.json();
  return result;
}

exports.handler = async (event, context) => {
  try {
    const { message } = JSON.parse(event.body);

    // Call the Hugging Face API with the user's message
    const hfResponse = await query(message);

    // Process the response.
    // The DialoGPT model returns an array of objects with generated text.
    let aiResponse = "Sorry, I didn't understand that.";
    if (Array.isArray(hfResponse) && hfResponse.length > 0) {
      aiResponse = hfResponse[0].generated_text || aiResponse;
    } else if (hfResponse.generated_text) {
      aiResponse = hfResponse.generated_text;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ aiResponse })
    };
  } catch (error) {
    console.error("Error in chatbot function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
