const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Voice API",
      version: "1.0.0",
      description: "API documentation for Voice application",
      contact: {
        name: "API Support",
        email: "support@voiceapp.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5004",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "User", description: "User operations" },
      { name: "Subscription", description: "Subscription management" },
      { name: "Plan", description: "Plan operations" },
      { name: "Appointment", description: "Appointment operations" },
      { name: "Assistant", description: "Assistant operations" },
      { name: "Call", description: "Call operations" },
      { name: "PhoneNumber", description: "Phone number operations" },
      { name: "Knowledgebase", description: "Knowledgebase operations" },
      { name: "PhonePe", description: "PhonePe payment operations" },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpecs };
