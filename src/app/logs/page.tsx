"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PaperPreview from "@/components/paper-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deletePaper } from "@/app/actions";
import { Calendar, FileText, ArrowRight, LibraryBig, Loader2, Trash2 } from "lucide-react";

export default function LogsPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const q = query(collection(db, "papers"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedPapers: any[] = [];
      snapshot.forEach(doc => {
        fetchedPapers.push({ ...doc.data(), id: doc.id });
      });
      setPapers(fetchedPapers);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent opening the paper preview
    if (!confirm("Are you sure you want to delete this paper? This action cannot be undone.")) return;
    
    setPapers(curr => curr.filter(p => p.id !== id));
    const res = await deletePaper(id);
    if (!res.success) {
      alert("Failed to delete paper: " + res.error);
      fetchPapers(); // re-fetch if failed
    }
  };

  if (selectedPaper) {
    return (
      <PaperPreview 
        questions={selectedPaper.questions} 
        onBack={() => setSelectedPaper(null)} 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-100 rounded-xl">
            <LibraryBig className="w-8 h-8 text-zinc-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Paper Archives</h1>
            <p className="text-zinc-500 text-lg mt-1">Review, print, or manage your previously generated papers.</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/"}
          className="mt-4 md:mt-0 shadow-sm"
        >
          Generator
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Fetching archives...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-300 rounded-2xl bg-zinc-50">
          <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Papers Found</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mb-6">
            You haven't generated any papers yet.
          </p>
          <Button 
            className="bg-black hover:bg-zinc-800 text-white"
            onClick={() => window.location.href = "/"}
          >
            Create your first paper
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div 
              key={paper.id} 
              className="group cursor-pointer bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all overflow-hidden flex flex-col"
              onClick={() => setSelectedPaper(paper)}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1 flex-1 pr-4">
                    {paper.title}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-1"
                    onClick={(e) => handleDelete(e, paper.id)}
                    title="Delete Paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                  <Calendar className="w-4 h-4" />
                  {new Date(paper.createdAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 font-medium">
                    {paper.examType}
                  </Badge>
                  {Array.from(new Set(paper.questions.map((q: any) => q.subject))).map((subj: any) => (
                    <Badge key={subj} variant="outline" className="text-zinc-600 border-zinc-200">
                      {subj}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">Total Questions</span>
                <span className="text-lg font-bold text-zinc-900">{paper.questions?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
