"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import Latex from "react-latex-next";
import 'katex/dist/katex.min.css';
import { ImagePlus, Zap } from "lucide-react";

// Extensive library of JEE Symbols (Math, Physics, Chemistry)
const SYMBOLS = [
  // --- GREEK LETTERS ---
  { label: "Alpha", display: "α", val: "α" },
  { label: "Beta", display: "β", val: "β" },
  { label: "Gamma", display: "γ", val: "γ" },
  { label: "Delta", display: "δ", val: "δ" },
  { label: "Epsilon", display: "ε", val: "ε" },
  { label: "Zeta", display: "ζ", val: "ζ" },
  { label: "Eta", display: "η", val: "η" },
  { label: "Theta", display: "θ", val: "θ" },
  { label: "Iota", display: "ι", val: "ι" },
  { label: "Kappa", display: "κ", val: "κ" },
  { label: "Lambda", display: "λ", val: "λ" },
  { label: "Mu", display: "μ", val: "μ" },
  { label: "Nu", display: "ν", val: "ν" },
  { label: "Xi", display: "ξ", val: "ξ" },
  { label: "Omicron", display: "ο", val: "ο" },
  { label: "Pi", display: "π", val: "π" },
  { label: "Rho", display: "ρ", val: "ρ" },
  { label: "Sigma", display: "σ", val: "σ" },
  { label: "Tau", display: "τ", val: "τ" },
  { label: "Upsilon", display: "υ", val: "υ" },
  { label: "Phi", display: "φ", val: "φ" },
  { label: "Chi", display: "χ", val: "χ" },
  { label: "Psi", display: "ψ", val: "ψ" },
  { label: "Omega", display: "ω", val: "ω" },
  { label: "Gamma (Upper)", display: "Γ", val: "Γ" },
  { label: "Delta (Upper)", display: "Δ", val: "Δ" },
  { label: "Theta (Upper)", display: "Θ", val: "Θ" },
  { label: "Lambda (Upper)", display: "Λ", val: "Λ" },
  { label: "Xi (Upper)", display: "Ξ", val: "Ξ" },
  { label: "Pi (Upper)", display: "Π", val: "Π" },
  { label: "Sigma (Upper)", display: "Σ", val: "Σ" },
  { label: "Phi (Upper)", display: "Φ", val: "Φ" },
  { label: "Psi (Upper)", display: "Ψ", val: "Ψ" },
  { label: "Omega (Upper)", display: "Ω", val: "Ω" },

  // --- CALCULUS & DERIVATIVES ---
  { label: "1st Derivative", display: "dy/dx", val: "\\frac{dy}{dx}" },
  { label: "2nd Derivative", display: "d²y/dx²", val: "\\frac{d^2y}{dx^2}" },
  { label: "3rd Derivative", display: "d³y/dx³", val: "\\frac{d^3y}{dx^3}" },
  { label: "4th Derivative", display: "d⁴y/dx⁴", val: "\\frac{d^4y}{dx^4}" },
  { label: "nth Derivative", display: "dⁿy/dxⁿ", val: "\\frac{d^ny}{dx^n}" },
  { label: "Partial Deriv", display: "∂f/∂x", val: "\\frac{\\partial f}{\\partial x}" },
  { label: "2nd Partial", display: "∂²f/∂x²", val: "\\frac{\\partial^2 f}{\\partial x^2}" },
  { label: "Mixed Partial", display: "∂²f/∂x∂y", val: "\\frac{\\partial^2 f}{\\partial x \\partial y}" },
  { label: "Integral", display: "∫", val: "\\int" },
  { label: "Definite Integral", display: "∫a→b", val: "\\int_{a}^{b}" },
  { label: "Double Integral", display: "∬", val: "\\iint" },
  { label: "Surface Integral", display: "∬_S", val: "\\iint_{S}" },
  { label: "Triple Integral", display: "∭", val: "\\iiint" },
  { label: "Volume Integral", display: "∭_V", val: "\\iiint_{V}" },
  { label: "Closed Integral", display: "∮", val: "\\oint" },
  { label: "Limit", display: "lim", val: "\\lim_{x \\to a}" },
  { label: "Limit to Infinity", display: "lim∞", val: "\\lim_{x \\to \\infty}" },
  { label: "Infinity", display: "∞", val: "\\infty" },
  { label: "Nabla/Gradient", display: "∇", val: "\\nabla" },
  { label: "Laplacian", display: "∇²", val: "\\nabla^2" },
  { label: "Summation (Limits)", display: "∑", val: "\\sum_{i=1}^{n}" },
  { label: "Product (Limits)", display: "∏", val: "\\prod_{i=1}^{n}" },

  // --- ALGEBRA & TRIGONOMETRY ---
  { label: "Fraction", display: "a/b", val: "\\frac{a}{b}" },
  { label: "Square Root", display: "√", val: "\\sqrt{x}" },
  { label: "Cube Root", display: "∛", val: "\\sqrt[3]{x}" },
  { label: "Nth Root", display: "∛", val: "\\sqrt[n]{x}" },
  { label: "Power (Square)", display: "x²", val: "x^2" },
  { label: "Power (Cube)", display: "x³", val: "x^3" },
  { label: "Power (Nth)", display: "xⁿ", val: "x^{n}" },
  { label: "Subscript", display: "xₙ", val: "x_{n}" },
  { label: "Logarithm Base", display: "log", val: "\\log_{10}(x)" },
  { label: "Natural Log", display: "ln", val: "\\ln(x)" },
  { label: "Exponential", display: "eˣ", val: "e^{x}" },
  { label: "Absolute Value", display: "|x|", val: "|x|" },
  { label: "Degree", display: "°", val: "^\\circ" },
  { label: "Angle", display: "∠", val: "\\angle" },
  { label: "Perpendicular", display: "⊥", val: "\\perp" },
  { label: "Parallel", display: "∥", val: "\\parallel" },
  { label: "Triangle", display: "△", val: "\\triangle" },
  { label: "Proportional", display: "∝", val: "\\propto" },
  { label: "Factorial", display: "n!", val: "n!" },
  { label: "Permutation (nPr)", display: "nPr", val: "{}^{n}P_{r}" },
  { label: "Combination (nCr)", display: "nCr", val: "{}^{n}C_{r}" },

  // --- MATRICES & VECTORS ---
  { label: "Vector Arrow", display: "v⃗", val: "\\vec{v}" },
  { label: "Unit Vector i", display: "î", val: "\\hat{i}" },
  { label: "Unit Vector j", display: "ĵ", val: "\\hat{j}" },
  { label: "Unit Vector k", display: "k̂", val: "\\hat{k}" },
  { label: "Unit Vector n", display: "n̂", val: "\\hat{n}" },
  { label: "Dot Product", display: "⋅", val: "\\cdot" },
  { label: "Cross Product", display: "×", val: "\\times" },
  { label: "Magnitude", display: "|v|", val: "|\\vec{v}|" },
  { label: "Box Product", display: "[abc]", val: "[\\vec{a}\\ \\vec{b}\\ \\vec{c}]" },
  { label: "Row Vector", display: "[1x3]", val: "\\begin{pmatrix} x & y & z \\end{pmatrix}" },
  { label: "Col Vector", display: "[3x1]", val: "\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}" },
  { label: "Matrix (2x2)", display: "[2x2]", val: "\\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}" },
  { label: "Matrix (3x3)", display: "[3x3]", val: "\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}" },
  { label: "Matrix (4x4)", display: "[4x4]", val: "\\begin{pmatrix} a_{11} & a_{12} & a_{13} & a_{14} \\\\ a_{21} & a_{22} & a_{23} & a_{24} \\\\ a_{31} & a_{32} & a_{33} & a_{34} \\\\ a_{41} & a_{42} & a_{43} & a_{44} \\end{pmatrix}" },
  { label: "Det (2x2)", display: "|2x2|", val: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}" },
  { label: "Det (3x3)", display: "|3x3|", val: "\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}" },
  { label: "Identity Matrix", display: "I", val: "\\mathbf{I}" },
  { label: "Transpose", display: "Aᵀ", val: "A^T" },
  { label: "Inverse Matrix", display: "A⁻¹", val: "A^{-1}" },

  // --- SETS, LOGIC & COMPLEX NUMBERS ---
  { label: "Element of", display: "∈", val: "\\in" },
  { label: "Not Element", display: "∉", val: "\\notin" },
  { label: "Subset", display: "⊂", val: "\\subset" },
  { label: "Subset/Eq", display: "⊆", val: "\\subseteq" },
  { label: "Union", display: "∪", val: "\\cup" },
  { label: "Intersection", display: "∩", val: "\\cap" },
  { label: "Empty Set", display: "∅", val: "\\emptyset" },
  { label: "Therefore", display: "∴", val: "\\therefore" },
  { label: "Because", display: "∵", val: "\\because" },
  { label: "Implies", display: "⇒", val: "\\implies" },
  { label: "If and only if", display: "⇔", val: "\\iff" },
  { label: "For all", display: "∀", val: "\\forall" },
  { label: "Exists", display: "∃", val: "\\exists" },
  { label: "Real Numbers", display: "ℝ", val: "\\mathbb{R}" },
  { label: "Complex Numbers", display: "ℂ", val: "\\mathbb{C}" },
  { label: "Integers", display: "ℤ", val: "\\mathbb{Z}" },
  { label: "Natural Numbers", display: "ℕ", val: "\\mathbb{N}" },
  { label: "Rational Numbers", display: "ℚ", val: "\\mathbb{Q}" },
  { label: "Complex Conjugate", display: "z̅", val: "\\bar{z}" },
  { label: "Argument", display: "arg(z)", val: "\\arg(z)" },
  { label: "Real Part", display: "Re(z)", val: "\\text{Re}(z)" },
  { label: "Imag Part", display: "Im(z)", val: "\\text{Im}(z)" },

  // --- CHEMISTRY REACTIONS ---
  { label: "Reaction Arrow", display: "→", val: "\\rightarrow" },
  { label: "Equilibrium", display: "⇌", val: "\\rightleftharpoons" },
  { label: "Reaction (Top)", display: "→(Mol)", val: "\\xrightarrow{\\text{Top Text}}" },
  { label: "Reaction (Top & Bottom)", display: "→(T/B)", val: "\\xrightarrow[\\text{Bottom Text}]{\\text{Top Text}}" },
  { label: "Equilibrium (Top)", display: "⇌(Mol)", val: "\\xrightleftharpoons{\\text{Top Text}}" },
  { label: "Equilibrium (Top & Bottom)", display: "⇌(T/B)", val: "\\xrightleftharpoons[\\text{Bottom Text}]{\\text{Top Text}}" },
  { label: "Reaction (Heat)", display: "→(Δ)", val: "\\xrightarrow{\\Delta}" },
  { label: "Gas Release", display: "↑", val: "\\uparrow" },
  { label: "Precipitate", display: "↓", val: "\\downarrow" },
  { label: "Standard State", display: "⦵", val: "^\\ominus" },
  { label: "Enthalpy Change", display: "ΔH°", val: "\\Delta H^\\circ" },
  { label: "Gibbs Energy", display: "ΔG°", val: "\\Delta G^\\circ" },
  { label: "Entropy Change", display: "ΔS°", val: "\\Delta S^\\circ" },
  { label: "Cell Potential", display: "E°cell", val: "E^\\circ_{\\text{cell}}" },
  { label: "Equilibrium Const", display: "K_c", val: "K_c" },
  { label: "Concentration", display: "[A]", val: "[A]" },
  { label: "Isotope/Nuclide", display: "¹⁴C₆", val: "{}^{A}_{Z}\\text{X}" },

  // --- PHYSICS EQUATIONS & CONSTANTS ---
  { label: "Planks Const (Reduced)", display: "ħ", val: "\\hbar" },
  { label: "Angstrom", display: "Å", val: "\\text{\\AA}" },
  { label: "Permittivity", display: "ε₀", val: "\\varepsilon_0" },
  { label: "Permeability", display: "μ₀", val: "\\mu_0" },
  { label: "Coulomb Constant", display: "1/4πε₀", val: "\\frac{1}{4\\pi\\varepsilon_0}" },
  { label: "Speed of Light", display: "c", val: "c" },
  { label: "Electron Mass", display: "m_e", val: "m_e" },
  { label: "Proton Mass", display: "m_p", val: "m_p" },
  { label: "Ohm", display: "Ω", val: "\\Omega" },
  { label: "Electron Volt", display: "eV", val: "\\text{ eV}" },
  { label: "Work Function", display: "Φ", val: "\\Phi" },
  { label: "Half-Life", display: "t₁/₂", val: "t_{1/2}" },
  { label: "Center of Mass", display: "X_cm", val: "X_{\\text{cm}}" },
  { label: "Moment of Inertia", display: "I", val: "I" },
  { label: "Angular Momentum", display: "L", val: "L" },
  { label: "Torque", display: "τ", val: "\\tau" }
];

export interface CustomQuestionData {
  id: string;
  question_text: string;
  options: { identifier: string; content: string }[];
  correct_options: string[];
  subject: string;
  chapter: string;
  difficulty: string;
  is_custom: boolean;
}

export function CustomQuestionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  availableChapters 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (q: CustomQuestionData, exp: string) => void;
  availableChapters: {chapter_name: string, subject: string}[];
}) {
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([{id: 'A', text: ''}, {id: 'B', text: ''}, {id: 'C', text: ''}, {id: 'D', text: ''}]);
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");
  
  const [activeInput, setActiveInput] = useState<{type: 'q' | 'o' | 'e', index?: number}>({type: 'q'});
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    if (availableChapters.length > 0) {
      const filtered = availableChapters.filter(c => c.subject.toLowerCase() === subject.toLowerCase());
      if (filtered.length > 0) {
        if (!chapter || !filtered.find(c => c.chapter_name === chapter)) {
          setChapter(filtered[0].chapter_name);
        }
      }
    }
  }, [subject, availableChapters, chapter]);

  const insertSymbol = (sym: string) => {
    let currentVal = "";
    let ref = null;
    let setter = null;

    if (activeInput.type === 'q') {
      currentVal = questionText;
      ref = inputRefs.current['q'];
      setter = setQuestionText;
    } else if (activeInput.type === 'e') {
      currentVal = explanation;
      ref = inputRefs.current['e'];
      setter = setExplanation;
    } else if (activeInput.type === 'o' && activeInput.index !== undefined) {
      currentVal = options[activeInput.index].text;
      ref = inputRefs.current[`o${activeInput.index}`];
      setter = (val: string) => {
        const newOpts = [...options];
        newOpts[activeInput.index!].text = val;
        setOptions(newOpts);
      };
    }

    if (ref && setter) {
      const start = ref.selectionStart;
      const end = ref.selectionEnd;
      
      const textBefore = currentVal.substring(0, start);
      let finalSym = sym;
      
      // If the symbol is a LaTeX command, automatically wrap it in \( \) so it renders instantly,
      // UNLESS the user is already inside a math block ($$ or \().
      if (sym.includes('\\') || sym.includes('_') || sym.includes('^')) {
        const numDoubleDollars = (textBefore.match(/\$\$/g) || []).length;
        const isInsideDoubleDollar = numDoubleDollars % 2 === 1;
        
        const numOpenParen = (textBefore.match(/\\\(/g) || []).length;
        const numCloseParen = (textBefore.match(/\\\)/g) || []).length;
        const isInsideParen = numOpenParen > numCloseParen;

        if (!isInsideDoubleDollar && !isInsideParen) {
          finalSym = `\\(${sym}\\)`;
        }
      }

      const newVal = currentVal.substring(0, start) + finalSym + currentVal.substring(end);
      setter(newVal);
      
      // If we inserted a placeholder like "a" or "b" or "Molecule Name", we can highlight it for easy typing,
      // but a simple focus at the end of insertion is safer and foolproof.
      setTimeout(() => {
        ref.focus();
        ref.setSelectionRange(start + finalSym.length, start + finalSym.length);
      }, 10);
    }
  };

  const createUploadHandler = (targetType: 'q' | 'e') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        if (width > 800) {
          height = Math.round((height * 800) / width);
          width = 800;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL("image/jpeg", 0.6);
        const imgTag = `<br/><img src="${base64}" alt="uploaded-image" style="max-width: 100%; height: auto; margin-top: 10px; border-radius: 4px; border: 1px solid #e4e4e7;" /><br/>`;
        
        if (targetType === 'q') setQuestionText(prev => prev + imgTag);
        else if (targetType === 'e') setExplanation(prev => prev + imgTag);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const handleSave = () => {
    if (!questionText.trim()) return alert("Question text is required");
    if (correctOptions.length === 0) return alert("Select at least one correct option");
    if (options.some(o => !o.text.trim())) return alert("All options must be filled");
    if (!chapter) return alert("Please select a chapter");

    const newQuestion: CustomQuestionData = {
      id: "custom_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      question_text: questionText,
      options: options.map(o => ({ identifier: o.id, content: o.text })),
      correct_options: correctOptions,
      subject,
      chapter,
      difficulty,
      is_custom: true
    };
    
    onSave(newQuestion, explanation);
    
    setQuestionText("");
    setOptions([{id: 'A', text: ''}, {id: 'B', text: ''}, {id: 'C', text: ''}, {id: 'D', text: ''}]);
    setCorrectOptions([]);
    setExplanation("");
    onClose();
  };

  const renderLatex = (text: string) => {
    if (!text) return "";
    const processed = text.replace(/\$\$([\s\S]*?)\$\$/g, '\\($1\\)');
    return <Latex>{processed}</Latex>;
  };

  const subjectChapters = availableChapters.filter(c => c.subject.toLowerCase() === subject.toLowerCase());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto sm:max-w-5xl w-full p-6 bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Custom Question</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
            <Label className="mb-1 block text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject</Label>
            <select className="w-full bg-transparent outline-none font-medium text-sm" value={subject} onChange={e => setSubject(e.target.value)}>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Mathematics</option>
            </select>
          </div>
          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
            <Label className="mb-1 block text-xs font-bold text-zinc-500 uppercase tracking-wider">Chapter</Label>
            <select className="w-full bg-transparent outline-none font-medium text-sm" value={chapter} onChange={e => setChapter(e.target.value)}>
              {subjectChapters.map(c => <option key={c.chapter_name} value={c.chapter_name}>{c.chapter_name}</option>)}
              {subjectChapters.length === 0 && <option value="General">General</option>}
            </select>
          </div>
          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
            <Label className="mb-1 block text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</Label>
            <select className="w-full bg-transparent outline-none font-medium text-sm" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-zinc-200 p-2 rounded-xl flex flex-wrap gap-1.5 items-center mb-4 shadow-sm max-h-[160px] overflow-y-auto">
          <span className="text-xs font-bold uppercase text-zinc-400 mx-2 flex items-center sticky left-0"><Zap className="w-3 h-3 mr-1"/> Insert Symbol</span>
          {SYMBOLS.map(sym => (
            <Button key={sym.label} variant="ghost" size="sm" className="h-8 min-w-[2.5rem] text-sm px-2 font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-100" onClick={() => insertSymbol(sym.val)} title={sym.label}>
              {sym.display}
            </Button>
          ))}
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <div className="flex justify-between items-end mb-2">
                <Label className="block text-sm font-semibold text-zinc-800">Question Text <span className="text-zinc-500 font-normal">(Use $$ for math)</span></Label>
                <div>
                  <Label htmlFor="image-upload-q" className="cursor-pointer inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 shadow-sm px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors">
                    <ImagePlus className="w-4 h-4 mr-2"/>
                    Insert Image (Optional)
                  </Label>
                  <input id="image-upload-q" type="file" accept="image/*" className="hidden" onChange={createUploadHandler('q')} />
                </div>
              </div>
              <textarea 
                ref={el => { inputRefs.current['q'] = el; }}
                className="w-full h-32 border border-zinc-300 rounded-md p-3 focus:ring-2 focus:ring-black outline-none font-mono text-sm leading-relaxed"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                onFocus={() => setActiveInput({type: 'q'})}
                placeholder="E.g. What is the value of $$\sum x$$?"
              />
            </div>
            <div className="flex flex-col">
               <Label className="mb-2 block text-sm font-semibold text-zinc-500 uppercase tracking-wider">Live Preview</Label>
              <div className="flex-1 bg-white p-4 border border-zinc-200 rounded-md overflow-y-auto min-h-[8rem] prose prose-sm max-w-none shadow-inner">
                {renderLatex(questionText) || <span className="text-zinc-400 italic">Preview will appear here...</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-zinc-50 p-6 rounded-xl border border-zinc-200">
            <Label className="block text-base font-bold text-zinc-900 mb-2">Options (Check the correct answers) <span className="text-zinc-500 font-normal text-sm ml-2">(Use $$ for math)</span></Label>
            {options.map((opt, idx) => (
              <div key={opt.id} className="flex gap-4 items-start bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                <div className="pt-2 flex flex-col items-center">
                  <span className="font-bold text-zinc-500 mb-2">{opt.id}</span>
                  <Checkbox 
                    checked={correctOptions.includes(opt.id)} 
                    onCheckedChange={(checked) => {
                      if (checked) setCorrectOptions(prev => [...prev, opt.id]);
                      else setCorrectOptions(prev => prev.filter(id => id !== opt.id));
                    }}
                    className="w-5 h-5 border-2 border-zinc-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea 
                    ref={el => { inputRefs.current[`o${idx}`] = el; }}
                    className="w-full h-20 border border-zinc-300 rounded-md p-2.5 text-sm font-mono focus:ring-2 focus:ring-black outline-none"
                    value={opt.text}
                    onChange={e => {
                      const newOpts = [...options];
                      newOpts[idx].text = e.target.value;
                      setOptions(newOpts);
                    }}
                    onFocus={() => setActiveInput({type: 'o', index: idx})}
                    placeholder={`Option ${opt.id} text...`}
                  />
                  <div className="border border-zinc-200 bg-zinc-50 rounded-md p-3 overflow-y-auto h-20 prose prose-sm shadow-inner">
                    {renderLatex(opt.text)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-zinc-200">
            <div className="flex flex-col">
              <div className="flex justify-between items-end mb-2">
                <Label className="block text-sm font-semibold text-zinc-800">Explanation</Label>
                <div>
                  <Label htmlFor="image-upload-e" className="cursor-pointer inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 shadow-sm px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors">
                    <ImagePlus className="w-4 h-4 mr-2"/>
                    Insert Image (Optional)
                  </Label>
                  <input id="image-upload-e" type="file" accept="image/*" className="hidden" onChange={createUploadHandler('e')} />
                </div>
              </div>
              <textarea 
                ref={el => { inputRefs.current['e'] = el; }}
                className="w-full h-32 border border-zinc-300 rounded-md p-3 focus:ring-2 focus:ring-black outline-none font-mono text-sm leading-relaxed"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                onFocus={() => setActiveInput({type: 'e'})}
                placeholder="Explain the solution..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2 block text-sm font-semibold text-zinc-500 uppercase tracking-wider">Live Preview</Label>
              <div className="flex-1 bg-white p-4 border border-zinc-200 rounded-md overflow-y-auto min-h-[8rem] prose prose-sm max-w-none shadow-inner">
                {renderLatex(explanation) || <span className="text-zinc-400 italic">Preview will appear here...</span>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 border-t border-zinc-200 pt-6">
          <Button variant="outline" className="border-zinc-300" onClick={onClose}>Cancel</Button>
          <Button className="bg-black text-white hover:bg-zinc-800 shadow-md" onClick={handleSave}>Add Question to Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
