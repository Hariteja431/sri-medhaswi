"use client";

import { useState, useEffect } from "react";
import parse, { attributesToProps } from "html-react-parser";
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";
import { Button } from "./ui/button";
import { getExplanations } from "@/app/actions";
import { Printer, ArrowLeft, Lightbulb, ChevronDown, Download } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: { identifier: string; content: string }[];
  correct_options: string[];
  subject: string;
  chapter: string;
  difficulty: string;
}

export default function PaperPreview({ questions, onBack }: { questions: Question[], onBack?: () => void }) {
  const [explanations, setExplanations] = useState<Record<string, any>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  
  // Modes for printing
  const [printAnswersMode, setPrintAnswersMode] = useState(false);
  const [printKeyOnlyMode, setPrintKeyOnlyMode] = useState(false);

  useEffect(() => {
    if (questions.length === 0) return;
    const ids = questions.map(q => q.id);
    getExplanations(ids).then(res => {
      if (res.success && res.data) {
        setExplanations(res.data);
      }
    });
  }, [questions]);

  const handlePrintQuestions = () => {
    setPrintAnswersMode(false);
    setPrintKeyOnlyMode(false);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintAnswers = () => {
    setPrintAnswersMode(true);
    setPrintKeyOnlyMode(false);
    const allVisible = questions.reduce((acc, q) => ({ ...acc, [q.id]: true }), {});
    setShowKey(allVisible);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintKeyOnly = () => {
    setPrintAnswersMode(true);
    setPrintKeyOnlyMode(true);
    const allVisible = questions.reduce((acc, q) => ({ ...acc, [q.id]: true }), {});
    setShowKey(allVisible);
    setTimeout(() => window.print(), 100);
  };

  const subjects = Array.from(new Set(questions.map(q => q.subject || "General")));
  const groupedQuestions = subjects.map(subject => ({
    subject,
    questions: questions.filter(q => (q.subject || "General") === subject)
  }));
  
  const parseHtmlAndMath = (html: string) => {
    if (!html) return "";
    const processedHtml = html.replace(/\$\$([\s\S]*?)\$\$/g, '\\($1\\)');
    return parse(processedHtml, {
      replace: (domNode: any) => {
        if (domNode.type === 'text') {
          if (domNode.data.includes('\\(') || domNode.data.includes('$')) {
            return <Latex>{domNode.data}</Latex>;
          }
        }
        if (domNode.name === 'img') {
          const props = attributesToProps(domNode.attribs);
          return <img {...props} className="max-w-[80%] h-auto inline-block my-4 rounded border border-zinc-200" alt="question-image" />;
        }
      }
    });
  };

  let globalQuestionIndex = 1;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-8 bg-white min-h-screen">
      {/* Header - Hidden in Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-zinc-200 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            Generated Paper
          </h1>
          <p className="text-zinc-500 font-medium text-lg">
            {questions.length} questions • {subjects.length} subjects
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4 md:mt-0 w-full md:w-auto">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="text-zinc-600 flex-1 sm:flex-none">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handlePrintQuestions} className="border-zinc-300 flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Questions
          </Button>
          <Button variant="outline" onClick={handlePrintKeyOnly} className="border-zinc-300 flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Key Only
          </Button>
          <Button className="bg-black hover:bg-zinc-800 text-white flex-1 sm:flex-none" onClick={handlePrintAnswers}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Full Solutions
          </Button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 text-center border-b border-black pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-widest">JEE Practice Examination</h1>
        {printAnswersMode && <h2 className="text-lg font-semibold mt-2">Answer Key & Explanations</h2>}
        <p className="text-sm mt-2">Total Questions: {questions.length}</p>
      </div>

      <div className="space-y-12">
        {groupedQuestions.map((group) => (
          <div key={group.subject} className="space-y-8">
            <div className="border-b-2 border-zinc-800 pb-2 mb-6 print:border-black">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-zinc-900 print:text-black">
                {group.subject}
              </h2>
            </div>
            
            {group.questions.map((q) => {
              const idx = globalQuestionIndex++;
              const isShowingKey = showKey[q.id];
              const explanation = explanations[q.id];

              return (
                <div key={q.id + '-' + idx} className="pb-8 border-b border-zinc-100 last:border-0 print:border-b print:border-zinc-300 print:pb-4 print:mb-4">
                  <div className="flex gap-4">
                    <div className="font-bold text-lg text-zinc-900 print:text-black print:text-base min-w-[2.5rem]">
                      Q.{idx}
                    </div>
                    <div className="flex-1">
                      <div className="prose prose-zinc max-w-none text-zinc-900 text-lg leading-relaxed mb-6 print:text-black print:text-base print:mb-3">
                        {parseHtmlAndMath(q.question_text)}
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-4 print:gap-y-2 print:mb-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-start gap-3 print:text-black break-inside-avoid">
                              <span className="font-bold text-zinc-500 mt-0.5 print:text-black print:text-sm">
                                ({opt.identifier})
                              </span>
                              <div className="flex-1 text-zinc-800 text-lg print:text-black print:text-base">
                                {parseHtmlAndMath(opt.content)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explanation Section */}
                      <div className="mt-4 pt-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowKey(prev => ({...prev, [q.id]: !prev[q.id]}))}
                          className={`print:hidden -ml-3 text-zinc-500 hover:text-zinc-900 ${isShowingKey ? "bg-zinc-100 text-zinc-900" : ""}`}
                        >
                          {isShowingKey ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2 -rotate-90" />}
                          {isShowingKey ? "Hide Answer" : "Show Answer"}
                        </Button>

                        {(isShowingKey || printAnswersMode) && (
                          <div className={`mt-4 p-5 rounded-lg bg-zinc-50 border border-zinc-200 print:block print:bg-transparent print:border-zinc-400 print:p-4 ${!printAnswersMode && !isShowingKey ? 'hidden' : ''}`}>
                            <div className="mb-4">
                              <span className="font-bold text-zinc-900 print:text-black">Correct Option: </span>
                              <span className="font-bold text-lg">{q.correct_options?.join(", ") || "N/A"}</span>
                            </div>
                            
                            {!printKeyOnlyMode && (
                              explanation ? (
                                <div>
                                  <span className="font-semibold text-zinc-700 block mb-2 print:text-black">Explanation:</span>
                                  <div className="prose prose-zinc max-w-none text-zinc-700 text-base print:text-black">
                                    {parseHtmlAndMath(explanation.explanation_text)}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-zinc-500 italic print:text-black">No explanation available.</p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
