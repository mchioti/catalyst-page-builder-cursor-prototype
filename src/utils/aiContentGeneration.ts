import { createDebugLogger } from './logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// AI Content Generation Functions
export function generateAIContent(prompt: string): any[] {
  // Parse the prompt to extract key information
  const lowerPrompt = prompt.toLowerCase()
  
  // Default values
  let articleCount = 3
  let subject = 'computer science'
  let titleLength = 'normal'
  let authorCount = 1
  let authorProgression = 'fixed' // 'fixed', 'progressive', 'variable'
  
  // Parse article count
  const countMatch = prompt.match(/(\d+)\s*(articles?|papers?|publications?)/i)
  if (countMatch) {
    articleCount = parseInt(countMatch[1])
    articleCount = Math.min(Math.max(articleCount, 1), 50) // Cap between 1-50
  } else if (prompt.match(/generate\s+(an?\s+)?article/i)) {
    // Handle "generate an article" or "generate a article" 
    articleCount = 1
  }
  
  // Parse subject/topic
  const subjectMatches = [
    /on\s+([^,\n]+?)(?:\s+with|\s+that|\s*$)/i,
    /about\s+([^,\n]+?)(?:\s+with|\s+that|\s*$)/i,
    /regarding\s+([^,\n]+?)(?:\s+with|\s+that|\s*$)/i
  ]
  
  for (const regex of subjectMatches) {
    const match = prompt.match(regex)
    if (match && match[1].trim()) {
      subject = match[1].trim()
      break
    }
  }
  
  // Parse title length
  if (lowerPrompt.includes('variable length') || lowerPrompt.includes('varying length') || lowerPrompt.includes('different length')) {
    titleLength = 'variable'
  } else if (lowerPrompt.includes('short title') || lowerPrompt.includes('brief title')) {
    titleLength = 'short'
  } else if (lowerPrompt.includes('very long title') || lowerPrompt.includes('long title') || lowerPrompt.includes('detailed title')) {
    titleLength = 'long'
  }
  
  // Parse author count and progression
  const authorMatches = [
    /written by (\d+)(?:\s*,?\s*(\d+))?(?:\s+up to\s+(\d+))?\s*authors?/i,
    /by (\d+)(?:\s*,?\s*(\d+))?(?:\s+up to\s+(\d+))?\s*authors?/i,
    /with (\d+)\s+authors?/i,  // "with 30 authors"
    /and (\d+)\s+authors?/i,   // "and 30 authors" 
    /(\d+)\s+authors?/i        // "30 authors" (simple pattern)
  ]
  
  for (const regex of authorMatches) {
    const match = prompt.match(regex)
    if (match) {
      const num1 = parseInt(match[1])
      const num2 = match[2] ? parseInt(match[2]) : null
      const num3 = match[3] ? parseInt(match[3]) : null
      
      if (num3) {
        // Pattern like "1, 2 up to 6 authors" - progressive
        authorProgression = 'progressive'
        authorCount = num3
      } else if (num2) {
        // Pattern like "1, 2 authors" - variable between num1 and num2
        authorProgression = 'variable'
        authorCount = Math.max(num1, num2)
      } else {
        // Single number
        authorCount = num1
        authorProgression = 'fixed'
      }
      break
    }
  }
  
  // Debug logging to help with AI parsing issues
  debugLog('log', '🤖 AI Parsing Results:', {
    prompt,
    articleCount,
    subject,
    titleLength,
    authorCount,
    authorProgression
  })
  
  // Generate articles
  const articles = []
  const journals = [
    'Nature',
    'Science', 
    'Cell',
    'The Lancet',
    'New England Journal of Medicine',
    'Proceedings of the National Academy of Sciences',
    'Nature Communications',
    'Scientific Reports',
    'PLOS ONE',
    'Journal of the American Chemical Society'
  ]
  
  const authors = [
    { givenName: 'Sarah', familyName: 'Johnson' },
    { givenName: 'Michael', familyName: 'Chen' },
    { givenName: 'Elena', familyName: 'Rodriguez' },
    { givenName: 'David', familyName: 'Kim' },
    { givenName: 'Maria', familyName: 'Santos' },
    { givenName: 'James', familyName: 'Wilson' },
    { givenName: 'Anna', familyName: 'Kowalski' },
    { givenName: 'Ahmed', familyName: 'Hassan' },
    { givenName: 'Lisa', familyName: 'Thompson' },
    { givenName: 'Carlos', familyName: 'Martinez' },
    { givenName: 'Yuki', familyName: 'Tanaka' },
    { givenName: 'Samuel', familyName: 'Greengard' },
    { givenName: 'Priya', familyName: 'Sharma' },
    { givenName: 'Robert', familyName: 'Anderson' },
    { givenName: 'Sophie', familyName: 'Dubois' },
    { givenName: 'Marco', familyName: 'Rossi' },
    { givenName: 'Ingrid', familyName: 'Hansen' },
    { givenName: 'Raj', familyName: 'Patel' },
    { givenName: 'Emma', familyName: 'Clarke' },
    { givenName: 'Diego', familyName: 'Silva' },
    { givenName: 'Olga', familyName: 'Ivanova' },
    { givenName: 'Thomas', familyName: 'Mueller' },
    { givenName: 'Fatima', familyName: 'Al-Rashid' },
    { givenName: 'Jack', familyName: 'Williams' },
    { givenName: 'Nadia', familyName: 'Khoury' },
    { givenName: 'Felix', familyName: 'Schmidt' },
    { givenName: 'Aisha', familyName: 'Okoye' },
    { givenName: 'Benjamin', familyName: 'Davis' },
    { givenName: 'Mei', familyName: 'Zhang' },
    { givenName: 'Antonio', familyName: 'García' },
    { givenName: 'Leila', familyName: 'Moradi' },
    { givenName: 'Henrik', familyName: 'Larsson' },
    { givenName: 'Zara', familyName: 'Khan' },
    { givenName: 'Pierre', familyName: 'Martin' },
    { givenName: 'Kenji', familyName: 'Yamamoto' },
    { givenName: 'Isabella', familyName: 'Ferrari' },
    { givenName: 'Alexei', familyName: 'Petrov' },
    { givenName: 'Amara', familyName: 'Ndiaye' },
    { givenName: 'Lars', familyName: 'Andersen' },
    { givenName: 'Camila', familyName: 'Vargas' }
  ]

  for (let i = 0; i < articleCount; i++) {
    // Determine number of authors based on progression type
    let numAuthors: number
    if (authorProgression === 'progressive') {
      // Progressive: 1, 2, 3, ... up to authorCount, then repeat
      numAuthors = (i % authorCount) + 1
    } else if (authorProgression === 'variable') {
      // Variable: random between 1 and authorCount
      numAuthors = Math.floor(Math.random() * authorCount) + 1
    } else {
      // Fixed: always the same number
      numAuthors = authorCount
    }
    
    // Select random authors
    const shuffled = [...authors].sort(() => 0.5 - Math.random())
    const selectedAuthors = shuffled.slice(0, numAuthors).map(author => ({
      "@type": "Person",
      "name": `${author.givenName} ${author.familyName}`,
      "givenName": author.givenName,
      "familyName": author.familyName
    }))
    
    // Generate title based on length preference
    const baseTitles = {
      short: [
        `${subject} Methods`,
        `${subject} Analysis`, 
        `${subject} Study`,
        `${subject} Review`,
        `${subject} Applications`
      ],
      normal: [
        `Advanced ${subject} Techniques for Modern Research`,
        `Investigating ${subject}: A Comprehensive Analysis`, 
        `Novel Approaches to ${subject} Problems`,
        `Understanding ${subject} Through Data Analysis`,
        `The Future of ${subject}: Emerging Trends`
      ],
      long: [
        `A Comprehensive Investigation into Advanced ${subject} Methodologies and Their Applications in Contemporary Research Environments`,
        `Exploring the Fundamental Principles and Practical Applications of ${subject} in Modern Scientific Research and Development`,
        `Systematic Analysis and Evaluation of ${subject} Approaches: Implications for Future Research and Technological Innovation`,
        `Understanding the Complex Relationships Between ${subject} Theory and Practice: A Multi-Disciplinary Approach to Contemporary Challenges`,
        `Innovative Methodologies and Emerging Technologies in ${subject}: A Critical Review of Current Literature and Future Directions`
      ]
    }
    
    let titleOptions: string[]
    if (titleLength === 'variable') {
      // Mix of different lengths
      const allTitles = [...baseTitles.short, ...baseTitles.normal, ...baseTitles.long]
      titleOptions = allTitles
    } else {
      titleOptions = baseTitles[titleLength as keyof typeof baseTitles] || baseTitles.normal
    }
    
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)]
    
    // Generate other content
    const keywords = ['research', 'analysis', 'methodology', 'experimental', 'theoretical']
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    const abstracts = [
      `This study presents a comprehensive analysis of ${subject.toLowerCase()} using advanced methodologies. Our findings demonstrate significant improvements in understanding and practical applications.`,
      `We investigate the fundamental principles underlying ${subject.toLowerCase()} through systematic experimental analysis. The results provide new insights into this important research area.`,
      `This research explores innovative approaches to ${subject.toLowerCase()} problems using cutting-edge techniques. Our methodology shows promising results for future applications.`,
      `A detailed examination of ${subject.toLowerCase()} reveals important patterns and relationships. This work contributes to the growing body of knowledge in this field.`,
      `Through rigorous analysis and experimentation, we present new findings related to ${subject.toLowerCase()}. These results have significant implications for future research directions.`
    ]
    
    const abstract = abstracts[Math.floor(Math.random() * abstracts.length)]
    
    // Generate DOI
    const doi = `10.1038/${Math.random().toString(36).substr(2, 9)}`
    
    // Random publish date within last 2 years
    const publishDate = new Date()
    publishDate.setDate(publishDate.getDate() - Math.floor(Math.random() * 730))

    const journal = journals[Math.floor(Math.random() * journals.length)]
    
    // Random access status (70% open access)
    const isOpenAccess = Math.random() > 0.3
    
    // Random thumbnails from picsum with unique seed - different sizes for different positions
    const thumbnailSeed = Math.floor(Math.random() * 1000000)
    // Portrait thumbnail (for left/right positions)
    const thumbnailUrl = `https://picsum.photos/160/200?random=${thumbnailSeed}`
    // Wide/banner thumbnail (for top/bottom/underlay positions)
    const thumbnailUrlWide = `https://picsum.photos/880/200?random=${thumbnailSeed}`
    
    const article = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "DOI",
        "value": doi
      },
      "headline": title,
      "name": title,
      "abstract": abstract,
      "description": abstract,
      "author": selectedAuthors,
      "datePublished": publishDate.toISOString().split('T')[0],
      "isAccessibleForFree": isOpenAccess,
      "image": thumbnailUrl,
      "thumbnailUrl": thumbnailUrl,
      "thumbnailUrlWide": thumbnailUrlWide,
    "isPartOf": {
      "@type": "PublicationIssue",
        "name": journal,
        "volumeNumber": String(Math.floor(Math.random() * 50) + 1),
        "issueNumber": String(Math.floor(Math.random() * 12) + 1),
        "isPartOf": {
          "@type": "Periodical",
          "name": journal,
          "issn": `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`
        }
      },
      "pageStart": String(Math.floor(Math.random() * 500) + 1),
      "pageEnd": String(Math.floor(Math.random() * 500) + 1 + Math.floor(Math.random() * 20) + 5),
      "keywords": [
        subject.toLowerCase(),
        randomKeyword,
        `${randomKeyword} methods`,
        'research',
        'experimental'
      ],
      "about": [
        {
          "@type": "DefinedTerm",
          "name": subject,
          "inDefinedTermSet": "Research Areas"
        }
      ]
    }
    
    articles.push(article)
  }
  
  return articles
}

export function generateAISingleContent(prompt: string): any {
  // For single publications, generate one item and return it
  const articles = generateAIContent(prompt)
  return articles[0] || null
}

/**
 * Generate journal metadata (Periodical schema.org object)
 * Used for publication-details widgets that show journal information
 */
export function generateJournalMetadata(prompt: string): any {
  // Parse prompt to extract journal name if present
  const lowerPrompt = prompt.toLowerCase()
  let journalName = 'Sample Journal'
  
  // Try to extract journal name from prompt
  const nameMatch = prompt.match(/journal[:\s]+([^,\n]+)/i)
  if (nameMatch && nameMatch[1]) {
    journalName = nameMatch[1].trim()
  }
  
  // Generate journal metadata in schema.org format
  return {
    "@context": "https://schema.org",
    "@type": "Periodical",
    "name": journalName,
    "description": `A leading academic journal publishing cutting-edge research in ${lowerPrompt.includes('science') ? 'science' : lowerPrompt.includes('engineering') ? 'engineering' : 'various fields'}.`,
    "issn": `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    "publisher": {
      "@type": "Organization",
      "name": "Academic Press"
    },
    "datePublished": new Date().toISOString().split('T')[0],
    "numberOfIssues": Math.floor(Math.random() * 200) + 50,
    "about": [
      {
        "@type": "DefinedTerm",
        "name": "Academic Research",
        "inDefinedTermSet": "Research Areas"
      }
    ]
  }
}
