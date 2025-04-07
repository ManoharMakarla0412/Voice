const https = require("https");

const createAssistantAPI = (assistantData) => {
  return new Promise((resolve, reject) => {
    // Default assistant configuration with required fields
    const defaultData = {
      name: assistantData.name || "My Assistant",
      transcriber: {
        provider: "deepgram", // Default to a common provider
        language: "en",
      },
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "You are a helpful assistant." }],
      },
      voice: {
        provider: "deepgram",
        voiceId: "luna",
      },
      firstMessage: assistantData.firstMessage || "Hello! How can I assist you today?",
    };

    // Merge user-provided data with defaults
    const data = JSON.stringify({ ...defaultData, ...assistantData });

    const options = {
      hostname: "api.vapi.ai",
      path: "/assistant",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        console.log('VAPI Response Status:', res.statusCode);
        console.log('VAPI Response Data:', responseData);
        try {
          const responseJson = responseData ? JSON.parse(responseData) : null;
          if (res.statusCode === 201) {
            if (!responseJson || !responseJson.id) {
              reject(new Error("Assistant created but no ID returned"));
            } else {
              resolve(responseJson);
            }
          } else {
            reject(new Error(`VAPI API error: ${res.statusCode} - ${responseData}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse VAPI response: ${err.message} - ${responseData}`));
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.write(data);
    req.end();
  });
};
const getAssistantFromVapi = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vapi.ai",
      path: "/assistant",
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          const responseJson = JSON.parse(responseData);
          if (res.statusCode === 200) resolve(responseJson);
          else reject(new Error(`VAPI API error: ${res.statusCode} - ${responseData}`));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.end();
  });
};

const getCallsFromVapi = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vapi.ai",
      path: "/call",
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          const responseJson = JSON.parse(responseData);
          if (res.statusCode === 200) resolve(responseJson);
          else reject(new Error(`VAPI API error: ${res.statusCode} - ${responseData}`));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.end();
  });
};

const deleteAssistantAPI = (assistantId) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vapi.ai",
      path: `/assistant/${assistantId}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          const responseJson = JSON.parse(responseData);
          if (res.statusCode === 200) resolve(responseJson);
          else reject(new Error(`VAPI API error: ${res.statusCode} - ${responseData}`));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.end();
  });
};

const patchAssistantAPI = (assistantId, updateData) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(updateData);

    const options = {
      hostname: "api.vapi.ai",
      path: `/assistant/${assistantId}`,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        console.log('VAPI Patch Response Status:', res.statusCode);
        console.log('VAPI Patch Response Data:', responseData);
        try {
          const responseJson = responseData ? JSON.parse(responseData) : null;
          if (res.statusCode === 200) {
            if (!responseJson || !responseJson.id) {
              reject(new Error("Assistant updated but no ID returned"));
            } else {
              resolve(responseJson);
            }
          } else {
            reject(new Error(`VAPI API error: ${res.statusCode} - ${responseData}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse VAPI patch response: ${err.message} - ${responseData}`));
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.write(data);
    req.end();
  });
};

module.exports = { createAssistantAPI, getAssistantFromVapi, getCallsFromVapi, deleteAssistantAPI, patchAssistantAPI };