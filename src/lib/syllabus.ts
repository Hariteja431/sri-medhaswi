// Keywords to categorize chapters into Class 11 and Class 12

export const class11Keywords = [
  // Physics 11
  "unit", "dimension", "measurement", "kinematics", "motion in a straight line", "motion in a plane", 
  "laws of motion", "work, energy and power", "work energy power", "system of particles", "rotational motion", 
  "gravitation", "mechanical properties", "solids", "fluids", "thermal properties", "thermodynamics", 
  "kinetic theory", "oscillations", "waves",
  // Chemistry 11
  "some basic concepts", "structure of atom", "classification of elements", "periodicity", 
  "chemical bonding", "molecular structure", "states of matter", "thermodynamics", "equilibrium", 
  "redox reactions", "hydrogen", "s-block", "s block", "p-block (13", "p-block elements (group 13", 
  "organic chemistry - some basic principles", "basic principles of organic", "hydrocarbons", "environmental chemistry",
  // Math 11
  "sets", "relations", "functions", "trigonometric functions", "principle of mathematical induction", 
  "complex numbers", "quadratic equations", "linear inequalities", "permutations", "combinations", 
  "binomial theorem", "sequence", "series", "straight lines", "conic sections", "introduction to three dimensional", 
  "limits", "derivatives", "mathematical reasoning", "statistics", "probability"
];

export const class12Keywords = [
  // Physics 12
  "electric charges", "fields", "electrostatic potential", "capacitance", "current electricity", 
  "moving charges", "magnetism", "magnetism and matter", "electromagnetic induction", "alternating current", 
  "electromagnetic waves", "ray optics", "optical instruments", "wave optics", "dual nature", 
  "atoms", "nuclei", "semiconductor electronics", "communication systems",
  // Chemistry 12
  "solid state", "solutions", "electrochemistry", "chemical kinetics", "surface chemistry", 
  "general principles", "isolation of elements", "p-block elements (group 15", "p-block (15", 
  "d and f block", "d- and f-", "coordination compounds", "haloalkanes", "haloarenes", 
  "alcohols", "phenols", "ethers", "aldehydes", "ketones", "carboxylic acids", 
  "amines", "organic compounds containing nitrogen", "biomolecules", "polymers", "chemistry in everyday life",
  // Math 12
  "relations and functions", "inverse trigonometric functions", "matrices", "determinants", 
  "continuity", "differentiability", "applications of derivatives", "integrals", 
  "applications of the integrals", "applications of integrals", "differential equations", "vector algebra", 
  "three dimensional geometry", "linear programming", "probability"
];

/**
 * Returns the class year (11 or 12) for a given chapter string, or "Unknown" if it can't be confidently matched.
 * We prioritize checking keywords in lowercase.
 */
export function getChapterClassYear(chapterName: string): "Class 11" | "Class 12" | "Unknown" {
  const lowerName = chapterName.toLowerCase();

  // Certain Math keywords overlap (e.g. "Probability", "Relations and Functions").
  // If the string exactly matches standard overlapping terms, we might have ambiguity.
  // We'll rely on the strongest keyword match.
  
  // Specific exclusions or strong matches can be added here
  if (lowerName === "probability" || lowerName === "relations and functions") {
    // These appear in both. Usually basic probability is 11, advanced is 12.
    // For safety, we can just say Class 12, or return Unknown. Let's return Class 12 for these heavy ones.
    return "Class 12";
  }
  if (lowerName.includes("inverse trigonometric")) return "Class 12";
  if (lowerName === "trigonometric functions") return "Class 11";

  for (const keyword of class12Keywords) {
    if (lowerName.includes(keyword)) return "Class 12";
  }

  for (const keyword of class11Keywords) {
    if (lowerName.includes(keyword)) return "Class 11";
  }

  return "Unknown";
}
