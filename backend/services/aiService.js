const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cleanJsonResponse = (text) => {
  const cleanedText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedText);
};

// PRE-VISIT AI SUMMARY
const generatePreVisitAI = async (symptoms) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
Analyse these patient symptoms and return ONLY valid JSON.

Required JSON format:

{
  "urgencyLevel": "Low | Medium | High",
  "chiefComplaint": "short summary",
  "suggestedQuestions": [
    "question 1",
    "question 2",
    "question 3"
  ]
}

Rules:
- Do not diagnose a disease.
- Do not prescribe medication.
- Urgency must only be Low, Medium, or High.
- Keep the chief complaint concise.
- Return exactly three suggested questions for the doctor.
- Return only JSON without markdown.

Symptoms:
${symptoms}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return cleanJsonResponse(text);
  } catch (error) {
    console.error("Pre-visit AI error:", error.message);
    throw error;
  }
};

// POST-VISIT AI SUMMARY
const generatePostVisitAI = async (notes, prescription = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prescriptionText = prescription.length
      ? prescription
          .map(
            (item) =>
              `${item.medicineName} | Dosage: ${item.dosage} | Frequency: ${item.frequency} | Duration: ${item.duration}`
          )
          .join("\n")
      : "No prescription provided";

    const prompt = `
Convert these clinical notes into a patient-friendly summary.

Return ONLY valid JSON in this format:

{
  "summary": "patient-friendly summary",
  "medicationSchedule": [
    "medicine schedule 1",
    "medicine schedule 2"
  ],
  "followUpSteps": [
    "step 1",
    "step 2"
  ]
}

Rules:
- Use simple patient-friendly language.
- Do not add medical facts not present in the notes.
- Medication schedule must only be based on the prescription provided.
- Keep the summary concise.
- Return only JSON without markdown.

Clinical Notes:
${notes}

Prescription:
${prescriptionText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return cleanJsonResponse(text);
  } catch (error) {
    console.error("Post-visit AI error:", error.message);
    throw error;
  }
};

module.exports = {
  generatePreVisitAI,
  generatePostVisitAI
};