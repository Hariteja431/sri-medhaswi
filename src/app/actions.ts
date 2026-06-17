"use server";

import { collection, getDocs, query, where, limit, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getChapters(subjects: string[]) {
  try {
    if (subjects.length === 0) return [];
    
    // Fetch all chapters (client SDK is used on server side)
    const chaptersRef = collection(db, "chapters");
    const snapshot = await getDocs(chaptersRef);
    
    const chapters: Array<{id: string, subject: string, chapter_name: string, question_count: number}> = [];
    
    const lowerSubjects = subjects.map(s => s.toLowerCase());
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subject && lowerSubjects.includes(data.subject.toLowerCase())) {
        chapters.push({
          id: data.id,
          subject: data.subject,
          chapter_name: data.chapter_name,
          question_count: data.question_count
        });
      }
    });
    
    // Sort by name
    return chapters.sort((a, b) => a.chapter_name.localeCompare(b.chapter_name));
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
}

export async function generatePaper(config: {
  examType: string;
  subjects: string[];
  chapters: string[];
  difficulty: string[];
  subjectCounts: Record<string, number>;
}) {
  try {
    const lowerSubjects = config.subjects.map(s => s.toLowerCase());
    const lowerDifficulty = config.difficulty.map(d => d.toLowerCase());
    const lowerExam = config.examType.toLowerCase().replace(" ", "-");
    
    // In Firestore, "in" queries support max 10 elements. If we have >10 chapters, we need to fetch multiple times or filter in memory.
    // For simplicity, if no chapters selected, we query all. If selected, we fetch based on subjects and filter in memory.
    const questions: any[] = [];
    
    // Querying with exam type matches first
    const questionsRef = collection(db, "questions");
    let q = query(questionsRef, where("exam_type", "==", lowerExam), limit(5000));
    
    const snapshot = await getDocs(q);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Apply filters
      const matchSubject = lowerSubjects.length === 0 || (data.subject && lowerSubjects.includes(data.subject.toLowerCase()));
      const matchChapter = config.chapters.length === 0 || config.chapters.includes(data.chapter);
      const matchDifficulty = lowerDifficulty.length === 0 || (data.difficulty && lowerDifficulty.includes(data.difficulty.toLowerCase()));
      
      if (matchSubject && matchChapter && matchDifficulty) {
        questions.push(data);
      }
    });
    
    // Group questions by subject
    const questionsBySubject: Record<string, any[]> = {};
    config.subjects.forEach(s => {
      questionsBySubject[s.toLowerCase()] = [];
    });
    
    questions.forEach(q => {
      const s = q.subject?.toLowerCase();
      if (s && questionsBySubject[s]) {
        questionsBySubject[s].push(q);
      }
    });

    const selected: any[] = [];
    const available: any[] = [];

    // For each subject, shuffle and select the requested count
    for (const subject of config.subjects) {
      const sLower = subject.toLowerCase();
      const count = config.subjectCounts[subject] || 0;
      
      const subjQuestions = questionsBySubject[sLower] || [];
      const shuffled = subjQuestions.sort(() => 0.5 - Math.random());
      
      selected.push(...shuffled.slice(0, count));
      available.push(...shuffled.slice(count));
    }
    
    return { success: true, data: { selected, available } };
  } catch (error: any) {
    console.error("Error generating paper:", error);
    return { success: false, error: error.message };
  }
}

export async function savePaper(paper: {
  id?: string;
  title: string;
  examType: string;
  questions: any[];
  createdAt: number;
}) {
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    // Generate a random ID if not provided
    const paperId = paper.id || Math.random().toString(36).substring(2, 15);
    const paperRef = doc(collection(db, "papers"), paperId);
    
    const paperData = {
      ...paper,
      id: paperId,
      // store only IDs to save space, or full objects. We'll store full objects for snapshot.
      // Firebase has a 1MB limit per document. 90 questions is small enough, but let's just save it.
    };
    
    await setDoc(paperRef, paperData);
    return { success: true, id: paperId };
  } catch (error: any) {
    console.error("Error saving paper:", error);
    return { success: false, error: error.message };
  }
}

export async function getExplanations(questionIds: string[]) {
  try {
    if (questionIds.length === 0) return { success: true, data: {} };
    
    // In Firestore, "in" query limits to 10. We have up to 90.
    // Fetch multiple batches.
    const { documentId } = await import("firebase/firestore");
    const explanationsMap: Record<string, any> = {};
    
    const chunks = [];
    for (let i = 0; i < questionIds.length; i += 10) {
      chunks.push(questionIds.slice(i, i + 10));
    }
    
    for (const chunk of chunks) {
      const q = query(collection(db, "explanations"), where("question_id", "in", chunk));
      const snap = await getDocs(q);
      snap.forEach(doc => {
        const data = doc.data();
        explanationsMap[data.question_id] = data;
      });
    }
    
    return { success: true, data: explanationsMap };
  } catch (error: any) {
    console.error("Error fetching explanations:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePaper(id: string) {
  try {
    await deleteDoc(doc(db, "papers", id));
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting paper:", error);
    return { success: false, error: error.message };
  }
}
