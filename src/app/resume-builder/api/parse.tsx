import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;

  // Mock AI parsing logic
  const structured = {
    name: "Jane Doe",
    contact: "jane@example.com",
    objectives: "To leverage my skills in full-stack development...",
    skills: ["React", "Node.js", "Firebase", "TypeScript"],
    jobHistory: [
      { title: "Frontend Dev", company: "TechCorp", dates: "2020–2023" }
    ],
    education: [
      { degree: "B.Sc. Computer Science", school: "XYZ University", year: 2019 }
    ]
  };

  res.status(200).json(structured);
}
