"use client";

import parse, { attributesToProps } from "html-react-parser";
import Latex from "react-latex-next";
import 'katex/dist/katex.min.css';

export function LatexText({ html, className = "" }: { html: string, className?: string }) {
  if (!html) return <span className={className}></span>;
  
  // Replace $$...$$ with \(...\) for react-latex-next which uses KaTeX under the hood.
  // It handles both \( and \[ standard latex delimiters.
  const processedHtml = html.replace(/\$\$([\s\S]*?)\$\$/g, '\\($1\\)');
  
  const parsed = parse(processedHtml, {
    replace: (domNode: any) => {
      if (domNode.type === 'text') {
        if (domNode.data.includes('\\(') || domNode.data.includes('$') || domNode.data.includes('\\[')) {
          return <Latex>{domNode.data}</Latex>;
        }
      }
      if (domNode.name === 'img') {
        const props = attributesToProps(domNode.attribs);
        return <img {...props} className="max-w-[80%] h-auto inline-block my-4 rounded border border-zinc-200" alt="question-image" />;
      }
    }
  });

  return <div className={`prose prose-zinc max-w-none ${className}`}>{parsed}</div>;
}
