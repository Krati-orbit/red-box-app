const fetch = require('node-fetch');

const GEMINI_API_KEY = "AIzaSyDvaEuejFBFvCVQUZagDjFsuHq4ZJSUV_4_c";

async function testKey() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
                })
            }
        );

        const data = await response.json();
        if (response.ok) {
            console.log("SUCCESS: API key is working.");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("ERROR: API key failed.");
            console.log("Status:", response.status);
            console.log("Message:", data.error?.message || "Unknown error");
        }
    } catch (err) {
        console.log("CRITICAL ERROR:", err.message);
    }
}

testKey();
