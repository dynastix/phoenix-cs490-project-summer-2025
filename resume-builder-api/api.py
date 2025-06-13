

'''
RUN THESE COMMANDS
--------------------------------------------------
conda create -n myenv python=3.12
conda activate myenv

pip install numpy uvicorn fastapi spacy
python -m spacy download en_core_web_sm
--------------------------------------------------
python -m pip show fastapi spacy pydantic

uvicorn resume-builder-api.api:app --reload
    visit locahost-link/docs

--------------------------------------------------
IGNORE THIS
    uvicorn api.py:app --reload
    uvicorn ./resume-builder-api/api.py:app --reload
    cd  
    pip install numpy==1.26.4
    pip install spacy --force-reinstall --no-deps

    # pip install fastapi uvicorn spacy
    # python -m spacy download en_core_web_sm



# '''
# api.py
from fastapi import FastAPI
from pydantic import BaseModel
import spacy
from spacy.matcher import PhraseMatcher
import re


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load NLP model once on startup
nlp = spacy.load("en_core_web_sm")

# Skills list and matcher setup
skills_list = ["Python", "JavaScript", "React", "Node.js", "SQL", "Docker", "AWS"]
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(skill) for skill in skills_list]
matcher.add("SKILLS", patterns)

class ResumeText(BaseModel):
    text: str

@app.post("/parse")
async def parse_resume(data: ResumeText):
    doc = nlp(data.text)

    # Extract names
    names = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]

    # Emails and phones using regex
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    phone_pattern = r"\b(?:\+?(\d{1,3}))?[-.\s]?(\(?\d{3}\)?)[-.\s]?(\d{3})[-.\s]?(\d{4})\b"
    emails = re.findall(email_pattern, data.text)
    phones = ["".join(p) for p in re.findall(phone_pattern, data.text)]

    # Career objective extraction
    def extract_career_objective(text):
        pattern = r"(?i)(career objective|objective|goal|summary)(.*?)(?=\n\n|\r\n\r\n|$)"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(2).strip()
        return None
    career_objective = extract_career_objective(data.text)

    # Extract skills
    matches = matcher(doc)
    skills = list(set([doc[start:end].text for _, start, end in matches]))

    # Job history extractor
    def extract_job_history(text):
        job_section_pattern = r"(?i)(experience|work history)(.*?)(?=(education|skills|$))"
        match = re.search(job_section_pattern, text, re.DOTALL)
        if not match:
            return []
        job_section = match.group(2)
        jobs = re.split(r"\n\s*\n", job_section)
        job_entries = []
        for job in jobs:
            lines = job.strip().split("\n")
            if len(lines) < 2:
                continue
            title = lines[0].strip()
            company = lines[1].strip()
            doc_job = nlp(job)
            dates = [ent.text for ent in doc_job.ents if ent.label_ == "DATE"]
            description = "\n".join(lines[2:]).strip() if len(lines) > 2 else ""
            job_entries.append({
                "job_title": title,
                "company_name": company,
                "dates": dates,
                "description": description,
            })
        return job_entries
    job_history = extract_job_history(data.text)

    # Education extractor
    def extract_education(text):
        edu_section_pattern = r"(?i)(education)(.*?)(?=(experience|skills|$))"
        match = re.search(edu_section_pattern, text, re.DOTALL)
        if not match:
            return []
        edu_section = match.group(2)
        entries = re.split(r"\n\s*\n", edu_section)
        education_list = []
        for entry in entries:
            lines = entry.strip().split("\n")
            if len(lines) < 2:
                continue
            school = lines[0].strip()
            degree = lines[1].strip()
            doc_edu = nlp(entry)
            dates = [ent.text for ent in doc_edu.ents if ent.label_ == "DATE"]
            gpa_match = re.search(r"GPA[:\s]?(\d\.\d{1,2})", entry, re.I)
            gpa = gpa_match.group(1) if gpa_match else None
            education_list.append({
                "school_name": school,
                "degree": degree,
                "dates": dates,
                "gpa": gpa,
            })
        return education_list
    education = extract_education(data.text)

    return {
        "name": names[0] if names else None,
        "emails": emails,
        "phones": phones,
        "career_objective": career_objective,
        "skills": skills,
        "job_history": job_history,
        "education": education,
    }









# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware  # 👈 ADD THIS
# from pydantic import BaseModel
# import spacy
# from spacy.matcher import PhraseMatcher

# # 👇 SETUP FastAPI app
# app = FastAPI()

# # ✅ ADD THIS BEFORE YOUR ROUTES
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # or ["*"] for development
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # 👇 Everything else stays the same
# nlp = spacy.load("en_core_web_sm")
# skills_list = ["Python", "JavaScript", "React", "Node.js", "SQL", "Docker", "AWS"]
# matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
# patterns = [nlp.make_doc(skill) for skill in skills_list]
# matcher.add("SKILLS", patterns)

# class ResumeText(BaseModel):
#     text: str

# @app.post("/parse")
# async def parse_resume(data: ResumeText):
#     doc = nlp(data.text)
#     names = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
#     orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
#     dates = [ent.text for ent in doc.ents if ent.label_ == "DATE"]
#     matches = matcher(doc)
#     skills = list(set([doc[start:end].text for _, start, end in matches]))
#     return {
#         "name": names[0] if names else None,
#         "organizations": orgs,
#         "dates": dates,
#         "skills": skills,
#     }

# from fastapi import FastAPI, Request
# from pydantic import BaseModel
# import spacy
# from spacy.matcher import PhraseMatcher

# app = FastAPI()
# nlp = spacy.load("en_core_web_sm")

# skills_list = ["Python", "JavaScript", "React", "Node.js", "SQL", "Docker", "AWS"]
# matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
# patterns = [nlp.make_doc(skill) for skill in skills_list]
# matcher.add("SKILLS", patterns)

# class ResumeText(BaseModel):
#     text: str

# @app.post("/parse")
# async def parse_resume(data: ResumeText):
#     doc = nlp(data.text)
#     names = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
#     orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
#     dates = [ent.text for ent in doc.ents if ent.label_ == "DATE"]
#     matches = matcher(doc)
#     skills = list(set([doc[start:end].text for _, start, end in matches]))
#     return {
#         "name": names[0] if names else None,
#         "organizations": orgs,
#         "dates": dates,
#         "skills": skills,
#     }
