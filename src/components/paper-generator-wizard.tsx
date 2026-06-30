"use client";

import { useState, useEffect } from "react";
import { getChapters, generatePaper, savePaper } from "@/app/actions";
import { getChapterClassYear } from "@/lib/syllabus";
import PaperPreview from "./paper-preview";
import { LatexText } from "./latex-text";
import { CustomQuestionModal, CustomQuestionData } from "./custom-question-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, ArrowRight, Settings2, CheckCircle2 } from "lucide-react";

type Subject = "Physics" | "Chemistry" | "Mathematics";
type Difficulty = "Easy" | "Medium" | "Hard";

export default function PaperGeneratorWizard() {
  const [examType, setExamType] = useState("JEE Main");
  const [subjects, setSubjects] = useState<Subject[]>(["Physics", "Chemistry", "Mathematics"]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<{id: string, subject: string, chapter_name: string}[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty[]>(["Medium"]);
  
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({
    Physics: 25,
    Chemistry: 25,
    Mathematics: 25
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [draftPaper, setDraftPaper] = useState<{ selected: any[], available: any[] } | null>(null);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>("All");

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customExplanations, setCustomExplanations] = useState<Record<string, string>>({});

  const toggleSubject = (subject: Subject) => {
    setSubjects((prev) => {
      const isSelected = prev.includes(subject);
      const newSubjects = isSelected ? prev.filter((s) => s !== subject) : [...prev, subject];
      if (!isSelected && !subjectCounts[subject]) {
        setSubjectCounts(curr => ({ ...curr, [subject]: 25 }));
      }
      return newSubjects;
    });
  };

  useEffect(() => {
    setLoadingChapters(true);
    getChapters(subjects).then((data) => {
      setAvailableChapters(data);
      setLoadingChapters(false);
    });
  }, [subjects]);

  const toggleChapter = (chapterName: string) => {
    setChapters((prev) =>
      prev.includes(chapterName) ? prev.filter((c) => c !== chapterName) : [...prev, chapterName]
    );
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setDifficulty((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const handleGenerate = async () => {
    if (subjects.length === 0) return alert("Please select at least one subject.");
    if (difficulty.length === 0) return alert("Please select at least one difficulty level.");
    
    setIsGenerating(true);
    const result = await generatePaper({
      examType,
      subjects,
      chapters,
      difficulty,
      subjectCounts
    });
    
    if (result.success && result.data) {
      setDraftPaper(result.data);
    } else {
      alert("Failed to generate paper.");
    }
    setIsGenerating(false);
  };

  const selectYearChapters = (year: "Class 11" | "Class 12" | "Clear") => {
    if (year === "Clear") {
      setChapters([]);
      return;
    }
    const newChapters = new Set(chapters);
    availableChapters.forEach(chap => {
      if (getChapterClassYear(chap.chapter_name) === year) {
        newChapters.add(chap.chapter_name);
      }
    });
    setChapters(Array.from(newChapters));
  };

  if (generatedPaper) {
    return (
      <PaperPreview 
        questions={generatedPaper} 
        onBack={() => setGeneratedPaper(null)} 
      />
    );
  }

  if (draftPaper) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 lg:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Review Draft</h1>
            <p className="text-zinc-500 mt-1">Review the selected questions, swap them if needed, and finalize your paper.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setDraftPaper(null)}>
              Back to Config
            </Button>
            <Button 
              variant="outline"
              className="border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 shadow-sm"
              onClick={() => setIsCustomModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Question
            </Button>
            <Button 
              className="bg-black text-white hover:bg-zinc-800"
              onClick={async () => {
                const { savePaper, saveCustomQuestionsToBank } = await import("@/app/actions");
                
                // Extract custom questions
                const customQs = draftPaper.selected.filter(q => q.is_custom);
                if (customQs.length > 0) {
                  // Save them to global bank
                  await saveCustomQuestionsToBank(customQs, customExplanations);
                }

                const res = await savePaper({
                  title: `JEE Standard Test - ${new Date().toLocaleDateString()}`,
                  examType,
                  questions: draftPaper.selected,
                  createdAt: Date.now()
                });
                if(res.success) {
                  setGeneratedPaper(draftPaper.selected);
                } else {
                  alert("Failed to save paper: " + res.error);
                }
              }}
            >
              Finalize Paper <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <CustomQuestionModal 
          isOpen={isCustomModalOpen} 
          onClose={() => setIsCustomModalOpen(false)}
          availableChapters={availableChapters}
          onSave={(q, exp) => {
            setDraftPaper(prev => prev ? {
              ...prev,
              selected: [...prev.selected, q]
            } : null);
            if (exp) {
              setCustomExplanations(prev => ({ ...prev, [q.id]: exp }));
            }
          }}
        />

        <Tabs defaultValue="selected" className="w-full relative flex-col">
          <div className="sticky top-24 z-20 flex flex-col items-end gap-3 mb-6 w-full pointer-events-none">
            <TabsList className="shadow-lg border border-zinc-200 bg-white/90 backdrop-blur-sm pointer-events-auto">
              <TabsTrigger value="selected" className="data-[state=active]:bg-zinc-100">Selected Questions ({draftPaper.selected.length})</TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-zinc-100">Available Pool ({draftPaper.available.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap justify-end gap-2 pointer-events-auto bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-zinc-200 shadow-sm">
               {['All', 'Physics', 'Chemistry', 'Mathematics'].map(subj => (
                 <button 
                   key={subj} 
                   onClick={() => setSubjectFilter(subj)}
                   className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${subjectFilter === subj ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                 >
                   {subj}
                 </button>
               ))}
            </div>
          </div>
          
          <TabsContent value="selected" className="space-y-8 mt-0 w-full">
            {draftPaper.selected.length === 0 && <p className="text-zinc-500">No questions selected.</p>}
            {Object.entries(
              draftPaper.selected
                .filter(q => subjectFilter === 'All' || (q.subject && q.subject.toLowerCase() === subjectFilter.toLowerCase()))
                .reduce((acc, q) => {
                  const s = q.subject || 'Other';
                  if (!acc[s]) acc[s] = [];
                  acc[s].push(q);
                  return acc;
                }, {} as Record<string, any[]>)
            ).sort(([a], [b]) => a.localeCompare(b)).map(([subject, qList]) => {
              const questions = qList as any[];
              return (
              <div key={`selected-${subject}`} className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-800 mb-4 pb-2 border-b border-zinc-200 capitalize">{subject} ({questions.length})</h3>
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id + '-selected-' + idx} className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-6 shadow-sm">
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 font-medium hover:bg-zinc-100">{q.subject}</Badge>
                          <Badge variant="outline" className="border-zinc-200 text-zinc-600">{q.difficulty}</Badge>
                        </div>
                        <LatexText html={q.question_text} className="text-sm text-zinc-800 leading-relaxed font-serif" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm"
                        onClick={() => {
                          setDraftPaper({
                            selected: draftPaper.selected.filter(x => x.id !== q.id),
                            available: [q, ...draftPaper.available]
                          })
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )})}
          </TabsContent>

          <TabsContent value="available" className="space-y-8 mt-0 w-full">
            {draftPaper.available.length === 0 && <p className="text-zinc-500">No available questions to swap.</p>}
            {Object.entries(
              draftPaper.available
                .filter(q => subjectFilter === 'All' || (q.subject && q.subject.toLowerCase() === subjectFilter.toLowerCase()))
                .reduce((acc, q) => {
                  const s = q.subject || 'Other';
                  if (!acc[s]) acc[s] = [];
                  acc[s].push(q);
                  return acc;
                }, {} as Record<string, any[]>)
            ).sort(([a], [b]) => a.localeCompare(b)).map(([subject, qList]) => {
              const questions = qList as any[];
              return (
              <div key={`available-${subject}`} className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-800 mb-4 pb-2 border-b border-zinc-200 capitalize">{subject} ({questions.length})</h3>
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id + '-avail-' + idx} className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-6 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 font-medium hover:bg-zinc-100">{q.subject}</Badge>
                          <Badge variant="outline" className="border-zinc-200 text-zinc-600">{q.difficulty}</Badge>
                        </div>
                        <LatexText html={q.question_text} className="text-sm text-zinc-800 leading-relaxed font-serif" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="shrink-0 text-zinc-900 border-zinc-300 hover:bg-zinc-100 shadow-sm"
                        onClick={() => {
                          setDraftPaper({
                            selected: [...draftPaper.selected, q],
                            available: draftPaper.available.filter(x => x.id !== q.id)
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )})}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:p-8 pt-6">
      <div className="mb-8 pb-6 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">Create New Paper</h1>
          <p className="text-zinc-500 text-base sm:text-lg">Configure your test parameters and hit generate.</p>
        </div>
        <Settings2 className="text-zinc-300 w-10 h-10 sm:w-12 sm:h-12 hidden sm:block" />
      </div>

      <div className="space-y-12">
        {/* Section 1: Core Configuration */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            1. Syllabus Configuration
          </h2>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm space-y-8">
            <div>
              <Label className="text-sm font-medium text-zinc-700 mb-3 block">Subjects</Label>
              <div className="flex flex-wrap gap-3">
                {(["Physics", "Chemistry", "Mathematics"] as Subject[]).map((subject) => {
                  const isSelected = subjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        isSelected 
                          ? "bg-zinc-900 text-white border-zinc-900" 
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 mb-3 block">Question Count per Subject</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <div key={subject} className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-500">{subject}</span>
                    <input 
                      type="number" 
                      min={1} 
                      max={90}
                      value={subjectCounts[subject] || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSubjectCounts(prev => ({
                          ...prev,
                          [subject]: isNaN(val) ? 0 : val
                        }));
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        const finalVal = isNaN(val) || val < 1 ? 25 : Math.min(val, 90);
                        setSubjectCounts(prev => ({ ...prev, [subject]: finalVal }));
                      }}
                      className="h-10 px-3 bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <Label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <span>Specific Chapters (Optional)</span>
                  {loadingChapters && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => selectYearChapters("Class 11")}>Select 1st Year (Class 11)</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => selectYearChapters("Class 12")}>Select 2nd Year (Class 12)</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => selectYearChapters("Clear")}>Clear</Button>
                </div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 sm:p-4 max-h-[300px] overflow-y-auto">
                {availableChapters.length === 0 && !loadingChapters ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No chapters found. All questions will be included.</p>
                ) : (
                  <div className="space-y-6">
                    {subjects.map(subject => {
                      const subjChapters = availableChapters.filter(c => c.subject.toLowerCase() === subject.toLowerCase());
                      if (subjChapters.length === 0) return null;
                      return (
                        <div key={subject}>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">{subject}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {subjChapters.map(chap => {
                              const isChecked = chapters.includes(chap.chapter_name);
                              return (
                                <div key={chap.id} className="flex items-start gap-3 p-2 rounded hover:bg-zinc-100 transition-colors">
                                  <Checkbox 
                                    id={chap.id}
                                    checked={isChecked}
                                    onCheckedChange={() => toggleChapter(chap.chapter_name)}
                                    className="mt-0.5 border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
                                  />
                                  <Label htmlFor={chap.id} className="text-sm text-zinc-700 font-normal leading-snug cursor-pointer flex-1">
                                    {chap.chapter_name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Difficulty */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            2. Difficulty Profile
          </h2>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <div className="flex flex-wrap gap-3">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((diff) => {
                const isSelected = difficulty.includes(diff);
                return (
                  <button
                    key={diff}
                    onClick={() => toggleDifficulty(diff)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      isSelected 
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" 
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {diff}
                    {isSelected && <CheckCircle2 className="w-4 h-4 inline-block ml-2 opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">
            Total Questions: <span className="font-bold text-zinc-900">{subjects.reduce((sum, subj) => sum + (subjectCounts[subj] || 0), 0)}</span>
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white shadow-md font-medium px-8"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Compiling Engine...</>
            ) : (
              <>Generate Paper <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
