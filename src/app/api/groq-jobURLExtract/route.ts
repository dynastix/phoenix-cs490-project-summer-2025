// app/api/groq-jobURLExtract/route.ts
import { JSDOM } from "jsdom";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { jobUrl } = await req.json();

    if (!jobUrl) {
      return NextResponse.json({ message: "Job URL is required" }, { status: 400 });
    }

    console.log(" Fetching job URL:", jobUrl);
    const page = await fetch(jobUrl);
    const html = await page.text();


    if (html.includes("cloudflare") && html.includes("Enable JavaScript and cookies")) {
      return NextResponse.json({
        message: "This job site is protected by Cloudflare and cannot be parsed.",
      }, { status: 403 });
    }

    console.log(" Page fetched, parsing with JSDOM...");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    ["nav", "footer", "script", "style", "header", "form", "aside"].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => el.remove());
    });


    let rawText = "";
    const main = document.querySelector("main");
    if (main?.textContent?.trim()) {
      rawText = main.textContent.trim();
    } else {
      rawText = document.body.textContent?.trim() || "";
    }


    const cleanedText = rawText.replace(/\s+/g, " ").trim().slice(0, 5000);

const elements = Array.from(document.querySelectorAll("h1, h2, h3, strong, div, span, p"))
  .map((el) => el.textContent?.trim() || "")
  .filter((line) => line.length > 5 && line.length <= 150 && !line.startsWith("Skip to"));

// Now use these as our "lines"
const lines = elements.slice(0, 30); // Only first 30 items for performance

const jobTitle = lines.find(
  (line) =>
    line.length <= 80 &&
    /^[A-Z]/.test(line) &&
    !line.includes("Apply") &&
    !line.endsWith(".")
) || "Untitled Job";

const companyName = lines.find(
  (line, idx) =>
    idx > 0 &&
    line.length <= 80 &&
    !line.includes("Apply") &&
    !line.endsWith(".") &&
    !line.includes(jobTitle)
) || "Unknown Company";


    const jobDescription = cleanedText;

    const result = {
      jobTitle,
      companyName,
      jobDescription,
      timestamp: new Date().toISOString(),
    };

    console.log(" Extraction successful");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(" Extraction error:", error.message || error);
    return NextResponse.json({ message: "Failed to extract job data from URL" }, { status: 500 });
  }
}
