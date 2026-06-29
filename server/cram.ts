import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily initialize the Google GenAI client to prevent startup failures if key is not set.
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export async function generateCramMaterial(topic: string, simplified: boolean = false) {
  const client = getGeminiClient();
  
  const promptStyle = simplified 
    ? "Return explanations in EXTREMELY simplified, intuitive, and easy-to-understand language. Use friendly real-world analogies, break down complex concepts into everyday terms, and avoid dense academic/technical jargon unless explained immediately with an easy example (Explain Like I'm 5 style)."
    : "Return explanations in rigorous, high-yield, professional, and clear technical terms designed for exam excellence.";

  // Use gemini-3.5-flash for efficient structured text tasks
  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `You are an expert tutor creating an extensive last-minute exam/interview preparation set for the topic: "${topic}". 
Generate a comprehensive, deep guide containing:
- Exactly 20 detailed summary bullet points.
- Exactly 5 to 8 essential formulas, equations, mathematical expressions, or core code syntaxes.
- Exactly 5 to 8 clever mnemonics, memory tricks, analogies, or acronyms for memorization.
- Exactly 5 common mistakes, pitfalls, traps, or conceptual misunderstandings.
- Exactly 5 highly probable exam questions (with short, helpful answers).
- Exactly 10 interactive recall flashcards.
- Exactly 15 diagnostic multiple-choice quiz questions.
- Exactly 6 handpicked video recommendations (2 for Beginner, 2 for Intermediate, and 2 for Advanced) with optimized YouTube search queries to prevent link hallucination.
Style requirement: ${promptStyle}`,
    config: {
      systemInstruction: `You are a master tutor who specializes in rapid learning and extreme conceptual clarity. For the given topic, compile high-yield summaries, critical term/formula flashcards, and a diagnostic 15-question multiple choice mock quiz. Ensure your explanations are elegant, direct, and free from fluff. ${simplified ? "CRITICAL: Write in very easy language, like talking to a beginner, with clear everyday analogies." : ""} Always output valid JSON strictly conforming to the responseSchema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 20 highly actionable, punchy, bulleted summary points for cramming. Use bold markdown formatting on key terms inside the strings."
          },
          formulas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 to 8 essential formulas, math equations, or core code patterns. Format clearly."
          },
          mnemonics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 to 8 clever mnemonics, acronyms, or silly memory tricks to remember this topic easily."
          },
          commonMistakes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 common mistakes or tricky traps students fall into during exams on this topic."
          },
          expectedQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 expected exam questions on this topic, each followed by a brief high-yield answer."
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING, description: "The term, formula, concept name, or process." },
                definition: { type: Type.STRING, description: "The clear explanation, formula expansion, or mnemonic. Keep it concise." }
              },
              required: ["term", "definition"]
            },
            description: "A list of exactly 10 interactive cards."
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "A high-quality Multiple Choice Question testing understanding of the topic." },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 options."
                },
                correctAnswer: { type: Type.STRING, description: "The EXACT text of the correct option from the options array." }
              },
              required: ["question", "options", "correctAnswer"]
            },
            description: "Exactly 15 diagnostic quiz questions."
          },
          videoResources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Catchy educational video topic title or question, e.g. 'Understanding [Topic] in 10 Minutes' or '[Topic] visual guide'." },
                level: { type: Type.STRING, description: "Difficulty level of the video. Must be exactly 'Beginner', 'Intermediate', or 'Advanced'." },
                searchQuery: { type: Type.STRING, description: "A highly precise search query that the student can use on YouTube to find this exact concept." },
                channelRecommendation: { type: Type.STRING, description: "A high-quality YouTube channel name known for this topic, e.g. '3Blue1Brown', 'CrashCourse', 'freeCodeCamp', etc." },
                whyWatch: { type: Type.STRING, description: "1-2 sentences explaining why this video is matches their level and should be watched." },
                duration: { type: Type.STRING, description: "Suggested watch duration, e.g., '10 mins' or '15 mins'." },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of key concepts covered in the video."
                },
                prerequisites: { type: Type.STRING, description: "What the user should know before watching, or 'None'." },
                expectedLearningOutcome: { type: Type.STRING, description: "Estimated learning outcome after watching." }
              },
              required: ["title", "level", "searchQuery", "channelRecommendation", "whyWatch", "duration", "keyConcepts", "prerequisites"]
            },
            description: "Exactly 6 recommended high-yield YouTube search topics/channel suggestions (2 for Beginner, 2 for Intermediate, and 2 for Advanced) tailored to this subject."
          }
        },
        required: ["summary", "formulas", "mnemonics", "commonMistakes", "expectedQuestions", "flashcards", "quiz", "videoResources"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response received from Gemini.");
  }

  try {
    const stripped = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const jsonStart = stripped.indexOf("{");
    const jsonEnd = stripped.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return JSON.parse(stripped);
    }
    const cleanJson = stripped.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse JSON response from Gemini:", text, err);
    throw new Error("Gemini returned invalid JSON structure. Please retry.");
  }
}

export async function parseSyllabusOrNotes(sourceText: string, simplified: boolean = false) {
  const client = getGeminiClient();
  
  const promptStyle = simplified 
    ? "Return explanations in EXTREMELY simplified, intuitive, and easy-to-understand language. Use friendly real-world analogies."
    : "Return explanations in rigorous, high-yield, professional, and clear technical terms designed for exam excellence.";

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `You are an expert tutor analyzing a student's custom lecture notes, syllabus, or text passage. Extract the key concepts and compile a comprehensive last-minute exam survival kit based ONLY on this material.
Input text from user to parse:
"""
${sourceText}
"""

Generate a detailed guide containing:
- Exactly 20 detailed summary bullet points based on the text.
- Exactly 5 to 8 essential formulas, equations, math relations, or core code syntaxes found or inferred.
- Exactly 5 to 8 clever mnemonics, acronyms, or silly memory tricks for these concepts.
- Exactly 5 common mistakes, pitfalls, or tricky bugs associated with these concepts.
- Exactly 5 expected exam questions based on this text (with brief high-yield answers).
- Exactly 10 interactive recall flashcards.
- Exactly 15 diagnostic multiple-choice quiz questions.
- Exactly 6 handpicked video recommendations (2 for Beginner, 2 for Intermediate, and 2 for Advanced) with optimized YouTube search queries based on the syllabus.
Style requirement: ${promptStyle}`,
    config: {
      systemInstruction: `You are a master academic parser and tutor. From the provided text notes or syllabus, extract high-yield details and structure them into valid JSON strictly conforming to the responseSchema. If certain fields like formulas are not present in the input text, infer the relevant ones or create highly practical code syntax/logical equivalents. Always output valid JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 20 highly actionable, punchy, bulleted summary points for cramming. Use bold markdown formatting on key terms."
          },
          formulas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 to 8 essential formulas, math equations, or core code patterns. Format clearly."
          },
          mnemonics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 to 8 clever mnemonics, acronyms, or silly memory tricks to remember this material easily."
          },
          commonMistakes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 common mistakes or tricky traps students fall into during exams on this material."
          },
          expectedQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 expected exam questions based on this material, each followed by a brief high-yield answer."
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING, description: "The term, formula, concept name, or process." },
                definition: { type: Type.STRING, description: "The clear explanation or mnemonic." }
              },
              required: ["term", "definition"]
            },
            description: "A list of exactly 10 interactive cards."
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "A high-quality Multiple Choice Question testing understanding of the provided notes." },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 options."
                },
                correctAnswer: { type: Type.STRING, description: "The EXACT text of the correct option from the options array." }
              },
              required: ["question", "options", "correctAnswer"]
            },
            description: "Exactly 15 diagnostic quiz questions."
          },
          videoResources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Video topic title." },
                level: { type: Type.STRING, description: "Difficulty level of the video. Must be exactly 'Beginner', 'Intermediate', or 'Advanced'." },
                searchQuery: { type: Type.STRING, description: "A highly precise search query that the student can use on YouTube to find this exact concept." },
                channelRecommendation: { type: Type.STRING, description: "A high-quality YouTube channel name known for this topic, e.g. '3Blue1Brown', 'CrashCourse', 'freeCodeCamp', etc." },
                whyWatch: { type: Type.STRING, description: "1-2 sentences explaining why this video matches their level and should be watched." },
                duration: { type: Type.STRING, description: "Suggested watch duration, e.g., '10 mins' or '15 mins'." },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of key concepts covered in the video."
                },
                prerequisites: { type: Type.STRING, description: "What the user should know before watching, or 'None'." },
                expectedLearningOutcome: { type: Type.STRING, description: "Estimated learning outcome after watching." }
              },
              required: ["title", "level", "searchQuery", "channelRecommendation", "whyWatch", "duration", "keyConcepts", "prerequisites"]
            },
            description: "Exactly 6 recommended high-yield YouTube search topics (2 for Beginner, 2 for Intermediate, and 2 for Advanced) based on the notes."
          }
        },
        required: ["summary", "formulas", "mnemonics", "commonMistakes", "expectedQuestions", "flashcards", "quiz", "videoResources"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response received from Gemini.");
  }

  try {
    const stripped = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const jsonStart = stripped.indexOf("{");
    const jsonEnd = stripped.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return JSON.parse(stripped);
    }
    const cleanJson = stripped.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse JSON response from Gemini:", text, err);
    throw new Error("Gemini returned invalid JSON structure. Please retry.");
  }
}

export async function generateMoreMaterial(topic: string, type: "summary" | "flashcards" | "quiz", simplified: boolean = false) {
  const client = getGeminiClient();
  const promptStyle = simplified 
    ? "Return explanations in EXTREMELY simplified, intuitive, and easy-to-understand language. Use friendly real-world analogies."
    : "Return explanations in rigorous, high-yield, professional, and clear technical terms.";

  let schemaProps: any = {};
  let systemText = "";
  let userText = "";

  if (type === "summary") {
    schemaProps = {
      moreItems: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 10 additional unique, high-yield summary points."
      }
    };
    systemText = "You are a master tutor who provides additional supplementary cheat-sheet summary points. Do not repeat basic points.";
    userText = `Generate exactly 10 additional unique summary bullet points for "${topic}". ${promptStyle}`;
  } else if (type === "flashcards") {
    schemaProps = {
      moreItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING }
          },
          required: ["term", "definition"]
        },
        description: "Exactly 5 additional flashcards."
      }
    };
    systemText = "You are a master tutor who provides additional supplementary active-recall flashcards.";
    userText = `Generate exactly 5 additional flashcards for "${topic}". ${promptStyle}`;
  } else {
    schemaProps = {
      moreItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        },
        description: "Exactly 5 additional diagnostic quiz questions."
      }
    };
    systemText = "You are a master tutor who provides additional diagnostic quiz questions.";
    userText = `Generate exactly 5 additional multiple choice quiz questions for "${topic}". ${promptStyle}`;
  }

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: userText,
    config: {
      systemInstruction: systemText,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: schemaProps,
        required: ["moreItems"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response received from Gemini.");

  try {
    const stripped = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const jsonStart = stripped.indexOf("{");
    const jsonEnd = stripped.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return JSON.parse(stripped);
    }
    const cleanJson = stripped.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(cleanJson).moreItems;
  } catch (err) {
    console.error("Failed to parse JSON response for more material from Gemini:", text, err);
    throw new Error("Gemini returned invalid structure for requested supplementary material.");
  }
}

export async function generateVideoInteractive(
  topic: string,
  videoTitle: string,
  searchQuery: string,
  type: "notes" | "flashcards" | "quiz" | "coding"
) {
  const client = getGeminiClient();
  let schemaProps: any = {};
  let systemText = "";
  let userText = "";

  if (type === "notes") {
    schemaProps = {
      notes: {
        type: Type.STRING,
        description: "Comprehensive study notes in clean markdown format. Include an overview, bullet points, code examples if applicable, and key takeaways. Keep it highly engaging and clear."
      }
    };
    systemText = "You are a world-class academic tutor who summarizes learning topics into beautifully formatted, high-yield markdown study sheets.";
    userText = `Create detailed, comprehensive study notes for the sub-topic "${videoTitle}" (part of a course on "${topic}"). The notes should expand deeply on this topic and include clean structural formatting, clear subheaders, and a summary.`;
  } else if (type === "flashcards") {
    schemaProps = {
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING, description: "The keyword, term, or question." },
            definition: { type: Type.STRING, description: "The core concept or high-yield explanation." }
          },
          required: ["term", "definition"]
        },
        description: "Exactly 5 high-yield flashcards."
      }
    };
    systemText = "You are a master of active recall. Design highly effective flashcards to test a student's retention of key technical definitions and concepts.";
    userText = `Generate exactly 5 specialized, challenging flashcards to master the topic "${videoTitle}" (associated with "${topic}").`;
  } else if (type === "quiz") {
    schemaProps = {
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "A high-quality Multiple Choice Question testing deep conceptual understanding." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly 4 options." },
            correctAnswer: { type: Type.STRING, description: "The EXACT correct option text from the options array." }
          },
          required: ["question", "options", "correctAnswer"]
        },
        description: "Exactly 3 distinct, challenging MCQ questions."
      }
    };
    systemText = "You are an elite exam compiler. Design precise, high-yield mock test questions with clear distractors and one unambiguous correct option.";
    userText = `Generate exactly 3 high-quality, challenging multiple-choice questions testing the concepts in "${videoTitle}" (part of "${topic}").`;
  } else {
    schemaProps = {
      codingProblems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the challenge or practice task." },
            description: { type: Type.STRING, description: "A highly descriptive problem statement, setup, or scenario." },
            hint: { type: Type.STRING, description: "A subtle, high-yield hint to guide the student towards solving it." }
          },
          required: ["title", "description", "hint"]
        },
        description: "Exactly 3 distinct practice challenges or coding exercises."
      }
    };
    systemText = "You are an elite software engineering mentor and competitive programmer. Formulate challenging, clear, practical coding exercises or conceptual problem-solving scenarios.";
    userText = `Generate exactly 3 custom practice exercises or coding scenarios designed to solidify practical execution of the topic "${videoTitle}" (as part of "${topic}").`;
  }

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: userText,
    config: {
      systemInstruction: systemText,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: schemaProps,
        required: [type === "notes" ? "notes" : type === "flashcards" ? "flashcards" : type === "quiz" ? "quiz" : "codingProblems"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response received from Gemini.");

  try {
    const stripped = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const jsonStart = stripped.indexOf("{");
    const jsonEnd = stripped.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return JSON.parse(stripped);
    }
    const cleanJson = stripped.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse JSON response for video interactive:", text, err);
    throw new Error("Gemini returned invalid structure for requested interactive resources.");
  }
}

export async function generateChatResponse(message: string, history: Array<{ role: "user" | "model"; text: string }>, context: string) {
  const client = getGeminiClient();

  const formattedHistory = history.map(item => ({
    role: item.role === "user" ? "user" : "model",
    parts: [{ text: item.text }]
  }));

  const systemInstruction = `You are "Crammy", an elite, high-yield exam-prep AI tutor. 
The student is currently cramming and studying the following topic or syllabus:
---
${context}
---
Answer their questions and doubts with extreme clarity, precision, and friendly study motivation. 
Keep your answers highly concise, punchy, and direct because they are cramming last-minute for an exam. 
Use markdown highlights (e.g. bold terms) to make the text scannable. Try to explain complex things using clear analogies if they seem confused.`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction,
    }
  });

  return response.text || "I am here to help you study! Could you repeat that?";
}
