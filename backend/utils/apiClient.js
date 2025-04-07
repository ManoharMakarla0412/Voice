const https = require("https");

const createAssistantAPI = (
  firstMessage,
  modelProvider,
  modelName,
  messages,
  knowledgeBaseUrl,
  endCallMessage,
  name,
  toolIds
) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      firstMessage: firstMessage || "",
      model: {
        provider: modelProvider || "openai",
        model: modelName || "gpt-3.5-turbo",
        messages: messages || [{ role: "user", content: "" }],
        toolIds: toolIds || ["e402a911-71a4-4879-90d6-92ec38b9d123"],
      },
      endCallMessage: endCallMessage || "",
      name: name || "bb",
    });

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
        try {
          const responseJson = JSON.parse(responseData);
          if (res.statusCode === 200) resolve(responseJson);
          else
            reject(
              new Error(`VAPI API error: ${res.statusCode} - ${responseData}`)
            );
        } catch (err) {
          reject(err);
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
          else
            reject(
              new Error(`VAPI API error: ${res.statusCode} - ${responseData}`)
            );
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
          else
            reject(
              new Error(`VAPI API error: ${res.statusCode} - ${responseData}`)
            );
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.end();
  });
};

module.exports = { createAssistantAPI, getAssistantFromVapi, getCallsFromVapi };
