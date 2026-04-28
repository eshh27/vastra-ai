require("dotenv").config();

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    const flashModels = data.models.filter(m => m.name.includes("flash"));
    console.log(JSON.stringify(flashModels, null, 2));
  } catch (e) {
    console.error(e);
  }
}
listModels();
