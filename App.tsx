import { ResearchData, ResearchLink } from "../types";

// Helper to construct smart search URLs
const generatePortals = (query: string, isMath: boolean = false): ResearchLink[] => {
  const links: ResearchLink[] = [
    {
      title: "Google Scholar",
      source: "Alphabet Inc.",
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      type: 'scholar',
      description: "Search for peer-reviewed citations, patents, and legal documents."
    }
  ];

  if (isMath) {
    links.push({
      title: "Wolfram Alpha",
      source: "Wolfram Research",
      url: `https://www.wolframalpha.com/input/?i=${encodeURIComponent(query)}`,
      type: 'code',
      description: "Computational knowledge engine for rigorous mathematical analysis and solution steps."
    });
  }

  links.push(
    {
      title: "arXiv.org",
      source: "Cornell University",
      url: `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`,
      type: 'database',
      description: "Access pre-prints in Physics, Mathematics, Computer Science, and Quantitative Biology."
    },
    {
      title: "ResearchGate",
      source: "ResearchGate",
      url: `https://www.researchgate.net/search?q=${encodeURIComponent(query)}`,
      type: 'database',
      description: "Connect with researchers and request full-text access to publications."
    }
  );

  if (!isMath) {
    links.push({
      title: "Connected Papers",
      source: "Visual Graph",
      url: `https://www.connectedpapers.com/search?q=${encodeURIComponent(query)}`,
      type: 'code',
      description: "Visualize the graph of influence and citations for this topic."
    });
  }

  return links;
};

// Heuristic to check if a query is likely mathematical
const isMathQuery = (query: string): boolean => {
  const mathPatterns = /[=<>^]|\b(sin|cos|tan|log|ln|sqrt|pi|theta|derivative|integral|plot|graph|function|equation|curve|circle|parabola|hyperbola|matrix|algebra|calculus)\b/i;
  // Exclude simple English sentences that might contain "plot" as a noun in a non-math context, though "plot" is usually safe.
  return mathPatterns.test(query);
};

// Clean up query for Desmos (remove "graph of", etc)
const sanitizeMathExpression = (query: string): string => {
  return query
    .replace(/\b(graph|plot|draw|sketch)\b/gi, '')
    .replace(/\b(of|for)\b/gi, '')
    .trim();
};

export const fetchResearchData = async (query: string): Promise<ResearchData> => {
  // Normalize query for basic display (capitalize first letter)
  const displayTopic = query.charAt(0).toUpperCase() + query.slice(1);
  const isMath = isMathQuery(query);
  const mathExpression = isMath ? sanitizeMathExpression(query) : undefined;

  try {
    // 1. Fetch from Wikipedia Public API
    // Use the summary endpoint. We assume the user is searching for a title.
    // Replace spaces with underscores for better compatibility with Wiki titles
    const wikiQuery = query.trim().replace(/ /g, '_');
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`);
    
    // --- FALLBACK LOGIC ---
    if (!response.ok) {
      if (response.status === 404) {
         // If exact concept not found, RETURN FALLBACK DATA instead of throwing error
         console.warn("Wiki concept not found, generating fallback portals.");
         
         return {
            topic: displayTopic,
            overview: isMath 
              ? "We identified this as a mathematical entity. While a direct encyclopedic entry was elusive, we have engaged the Graphing Engine and Computational Portals below."
              : "We couldn't locate a direct encyclopedia definition for this specific term. However, the Research Portals below have been configured to perform a deep web sweep for this topic.",
            wikipediaUrl: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`, // Link to Wiki Search
            wikipediaTitle: "Wikipedia Search",
            imageUrl: undefined, 
            portals: generatePortals(query, isMath),
            relatedTerms: [
                `${query} research`,
                `${query} application`,
                `Journal of ${query}`
            ],
            isMath,
            mathExpression
         };
      }
      // For other errors (500, network), we still throw
      throw new Error("Communication breakdown with Knowledge Node.");
    }

    const data = await response.json();

    // Handle Disambiguation pages (where one term means multiple things)
    if (data.type === 'disambiguation') {
       return {
            topic: data.title,
            overview: `${data.extract} We have provided broad research portals below to help you find the specific context you need.`,
            wikipediaUrl: data.content_urls.desktop.page,
            wikipediaTitle: data.title,
            imageUrl: data.thumbnail?.source,
            portals: generatePortals(data.title, isMath),
            relatedTerms: [
                `${data.title} definition`,
                `${data.title} context`,
                `${data.title} theory`
            ],
            isMath,
            mathExpression
       };
    }

    // 2. Synthesize Data (Success Case)
    const portals = generatePortals(data.title, isMath);
    
    const relatedTerms = [
      `${data.title} methodology`,
      `${data.title} history`,
      `${data.title} applications`,
      `${data.title} theorem`
    ];

    return {
      topic: data.title,
      overview: data.extract,
      wikipediaUrl: data.content_urls.desktop.page,
      wikipediaTitle: data.title,
      imageUrl: data.thumbnail?.source,
      portals: portals,
      relatedTerms: relatedTerms,
      isMath,
      mathExpression
    };

  } catch (error: any) {
    console.error("Research Engine Error:", error);
    throw error;
  }
};
