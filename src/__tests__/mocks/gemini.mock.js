// mock gemini ai
const mockGeminiResponse = {
  text: "Here's a recipe for you!",
  functionCalls: [],
  candidates: [
    {
      content: {
        parts: [{ text: "Here's a recipe for you!" }],
      },
    },
  ],
};

const mockGeminiClient = {
  models: {
    generateContent: jest.fn(() => Promise.resolve(mockGeminiResponse)),
  },
};

const GoogleGenAI = jest.fn(() => mockGeminiClient);

module.exports = {
  GoogleGenAI,
  mockGeminiClient,
  mockGeminiResponse,
};
