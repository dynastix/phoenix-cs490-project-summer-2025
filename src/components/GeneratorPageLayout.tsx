import { useState } from "react";

import Reorder from "./Reorder";
import ReorderEducation from "./ReorderEducation";
import ReorderWorkExperience from "@/components/ReorderWorkExperience";
import FetchAndDisplayKey from "./FetchAndDisplayKey";
import SummaryDisplay from "@/components/SummaryDisplay";
import SummaryEditor from "@/components/SummaryEditor";


import CareerBooster from "@/components/CareerBooster";


import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

// import JobDescriptionsList from "@/components/JobDescriptionsList";
// import JobDescriptionUpload from "@/components/JobDescriptionUpload";

import GenerateCard from "@/components/GenerateCard";

// import { useRef } from "react";
import JobDescUploadAndListPrev from "@/components/JobDescUploadAndListPrev";

import JobApplicationList from "./job-history/JobApplicationList";


import ResumeTemplateManager from "./template/ResumeTemplateManager";


import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';


import { useEffect } from 'react';

import ResumePDFGenerator from "./template/ResumePDFGenerator";




export default function GeneratorPageLayout() {

  const [activeTab, setActiveTab] = useState("generate");



 const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);




  const tabLabels: { [key: string]: string } = {

    generate: "Generate",
    jobs: "Job Descriptions",
    jobHistory: "Job Application History",
    template: "Template and Style Selection",
    download: "Resume Formatting & Download",
    advice: "Career Booster",


  };


  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="w-full max-w mx-auto px-1">
      {/* Tab Navigation */}
      <div className="relative z-10 flex space-x-4 bg-[#1B1917] rounded-t-xl px-1 pt-4 -mb-px">
        {Object.keys(tabLabels).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium transition-all duration-200 rounded-t-md ${activeTab === tab
                ? "bg-[#2A2A2E] text-[#F09E38]"
                : "text-gray-400 hover:text-gray-200"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>


      {/* Tab Panel Container */}
      <div className="relative min-h-[300px] bg-[#2A2A2E] rounded-b-xl p-2 transition-all duration-300">


        {activeTab === "jobs" && (
          <div className="animate-fade-in space-y-6 max-w-4xl mx-auto mt-2">

            {/*------- Job Description Components: ----------*/}
            <JobDescUploadAndListPrev />


          </div>
        )}

        {activeTab === "generate" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">

            < GenerateCard />

          </div>
        )}


        {activeTab === "jobHistory" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">

 
            {/* Add the job application history component here: */}

            <JobApplicationList />



          </div>
        )}

        {/* --------------------------------------------------------------------------- */}

        {activeTab === "template" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">


            {/* Add the component for the templating and styling here: */}

           {/* <ResumeTemplateManager user={user} /> */}
            <ResumePDFGenerator />

          </div>
        )}



        {activeTab === "download" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">


            {/* Add the component for the format and download UI here: */}


          </div>
        )}


        {/* --------------------------------------------------------------------------- */}

        {activeTab === "advice" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">


            {/* Component for the AI Advice UI*/}
            <CareerBooster />


          </div>
        )}

      </div>
    </div>
  );
}
