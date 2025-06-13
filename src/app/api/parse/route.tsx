// /src/app/api/parse/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const response = await fetch("http://localhost:8000/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}


// // app/api/parse/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { OpenAI } from "openai";

// const useMock = process.env.USE_MOCK_AI === "true";

// const mockProfile = {
//   name: "Mock Jane Doe",
//   contact: "mock@example.com",
//   objectives: "To test without billing OpenAI...",
//   skills: ["Testing", "Debugging", "Mocking"],
//   jobHistory: [{ title: "QA Tester", company: "FakeCorp", dates: "2020–2023" }],
//   education: [{ degree: "B.Sc.", school: "Mock University", year: 2020 }]
// };

// export async function POST(req: NextRequest) {
//   const { text } = await req.json();

//   if (useMock) {
//     return NextResponse.json(mockProfile);
//   }

//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });

//   const systemPrompt = `
// You are an assistant that extracts structured resume data from user input.
// Return a JSON object with the following fields:
// - name
// - contact
// - objectives
// - skills (array of strings)
// - jobHistory (array of { title, company, dates })
// - education (array of { degree, school, year })
// `;

//   const completion = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       { role: "system", content: systemPrompt },
//       { role: "user", content: text },
//     ],
//     temperature: 0.3,
//   });

//   const content = completion.choices[0].message.content;

//   try {
//     const json = JSON.parse(content!);
//     return NextResponse.json(json);
//   } catch (err) {
//     return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
//   }
// }


// --------------------- GRAVEYARD 
// app/api/parse/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { OpenAI } from "openai";

// const useMock = process.env.USE_MOCK_AI === "true";

// const mockProfile = {
//   name: "Mock Jane Doe",
//   contact: "mock@example.com",
//   objectives: "To test without billing OpenAI...",
//   skills: ["Testing", "Debugging", "Mocking"],
//   jobHistory: [{ title: "QA Tester", company: "FakeCorp", dates: "2020–2023" }],
//   education: [{ degree: "B.Sc.", school: "Mock University", year: 2020 }]
// };

// export async function POST(req: NextRequest) {
//   const { text } = await req.json();

//   if (useMock) {
//     return NextResponse.json(mockProfile);
//   }

//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });

//   const systemPrompt = `
// You are an assistant that extracts structured resume data from user input.
// Return a JSON object with the following fields:
// - name
// - contact
// - objectives
// - skills (array of strings)
// - jobHistory (array of { title, company, dates })
// - education (array of { degree, school, year })
// `;

//   const completion = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       { role: "system", content: systemPrompt },
//       { role: "user", content: text },
//     ],
//     temperature: 0.3,
//   });

//   const content = completion.choices[0].message.content;

//   try {
//     const json = JSON.parse(content!);
//     return NextResponse.json(json);
//   } catch (err) {
//     return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
//   }
// }


// import { NextResponse } from "next/server";
// import { OpenAI } from "openai";

// export async function POST(req: Request) {
//   try {
//     const { text } = await req.json();

//     if (!text) {
//       return NextResponse.json({ error: "No text provided" }, { status: 400 });
//     }

//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });

//     const systemPrompt = `
// You are an assistant that extracts structured resume data from user input.
// Return a JSON object with keys: name, contact, objectives, skills (array), jobHistory (array of {title, company, dates}), education (array of {degree, school, year}).
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: text },
//       ],
//       temperature: 0.3,
//     });

//     const content = completion.choices[0].message.content;

//     if (!content) {
//       return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
//     }

//     // parse JSON safely
//     let parsed;
//     try {
//       parsed = JSON.parse(content);
//     } catch (e) {
//       // maybe the AI returned text instead of strict JSON
//       return NextResponse.json({ error: "Invalid JSON from AI", raw: content }, { status: 500 });
//     }

//     return NextResponse.json(parsed);
//   } catch (error) {
//     console.error("API parse error:", error);
//     return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
//   }
// }
