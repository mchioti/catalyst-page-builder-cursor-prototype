// Real citation data from elibrary exports
// Source: /Documents/Cursor-PB/input/publication-samples/

export type CitationDomain = 'ai-software' | 'chemistry'

export interface Citation {
  doi: string
  domain: CitationDomain
  title: string
  authors: string[]
  year: number
  publicationType: 'article' | 'inproceedings' | 'proceedings' | 'inbook' | 'book'
  journal?: string
  booktitle?: string
  publisher?: string
  abstract?: string
  keywords?: string[]
  volume?: string
  issue?: string
  pages?: string
  url?: string
}

// AI/Software Engineering citations (from software+prototype+with+cursor+AI.bib)
const aiSoftwareCitations: Citation[] = [
  {
    doi: '10.1145/3715003',
    domain: 'ai-software',
    title: 'The Future of AI-Driven Software Engineering',
    authors: ['Valerio Terragni', 'Annie Vella', 'Partha Roop', 'Kelly Blincoe'],
    year: 2025,
    publicationType: 'article',
    journal: 'ACM Trans. Softw. Eng. Methodol.',
    volume: '34',
    issue: '5',
    abstract: 'A paradigm shift is underway in Software Engineering, with AI systems such as LLMs playing an increasingly important role in boosting software development productivity. This trend is anticipated to persist. In the next years, we expect a growing symbiotic partnership between human software developers and AI. The Software Engineering research community cannot afford to overlook this trend; we must address the key research challenges posed by the integration of AI into the software development process. In this article, we present our vision of the future of software development in an AI-driven world and explore the key challenges that our research community should address to realize this vision.',
    keywords: ['Software Engineering', 'Artificial Intelligence', 'Machine Learning', 'Large Language Models', 'APIs', 'Libraries', 'Software Testing', 'Requirements Engineering'],
    url: 'https://doi.org/10.1145/3715003'
  },
  {
    doi: '10.1145/3654777.3676384',
    domain: 'ai-software',
    title: 'SonoHaptics: An Audio-Haptic Cursor for Gaze-Based Object Selection in XR',
    authors: ['Hyunsung Cho', 'Naveen Sendhilnathan', 'Michael Nebeling', 'Tianyi Wang', 'Purnima Padmanabhan', 'Jonathan Browder', 'David Lindlbauer', 'Tanya R. Jonker', 'Kashyap Todi'],
    year: 2024,
    publicationType: 'inproceedings',
    booktitle: 'Proceedings of the 37th Annual ACM Symposium on User Interface Software and Technology',
    abstract: 'We introduce SonoHaptics, an audio-haptic cursor for gaze-based 3D object selection. SonoHaptics addresses challenges around providing accurate visual feedback during gaze-based selection in Extended Reality (XR), e. g., lack of world-locked displays in no- or limited-display smart glasses and visual inconsistencies. To enable users to distinguish objects without visual feedback, SonoHaptics employs the concept of cross-modal correspondence in human perception to map visual features of objects (color, size, position, material) to audio-haptic properties (pitch, amplitude, direction, timbre). We contribute data-driven models for determining cross-modal mappings of visual features to audio and haptic features, and a computational approach to automatically generate audio-haptic feedback for objects in the user\'s environment. SonoHaptics provides global feedback that is unique to each object in the scene, and local feedback to amplify differences between nearby objects. Our comparative evaluation shows that SonoHaptics enables accurate object identification and selection in a cluttered scene without visual feedback.',
    keywords: ['Computational Interaction', 'Extended Reality', 'Gaze-based Selection', 'Haptics', 'Multimodal Feedback', 'Sonification'],
    url: 'https://doi.org/10.1145/3654777.3676384'
  },
  {
    doi: '10.1145/3713043.3727051',
    domain: 'ai-software',
    title: 'Scratch Copilot: Supporting Youth Creative Coding with AI',
    authors: ['Stefania Druga', 'Amy J Ko'],
    year: 2025,
    publicationType: 'inbook',
    booktitle: 'Proceedings of the 24th Interaction Design and Children',
    pages: '140–153',
    abstract: 'Creative coding platforms like Scratch have democratized programming for children, yet translating imaginative ideas into functional code remains a significant hurdle for many young learners. While AI copilots assist adult programmers, few tools target children in block-based environments. Building on prior research, we present Cognimates Scratch Copilot: an AI-powered assistant integrated into a Scratch-like environment, providing real-time support for ideation, code generation, debugging, and asset creation. This paper details the system architecture and findings from an exploratory qualitative evaluation with 18 international children (ages 7–12). Our analysis reveals how the AI Copilot supported key creative coding processes, particularly aiding ideation and debugging. Crucially, it also highlights how children actively negotiated the use of AI, demonstrating strong agency by adapting or rejecting suggestions to maintain creative control. Interactions surfaced design tensions between providing helpful scaffolding and fostering independent problem-solving, as well as learning opportunities arising from navigating AI limitations and errors. Findings indicate Cognimates Scratch Copilot\'s potential to enhance creative self-efficacy and engagement. Based on these insights, we propose initial design guidelines for AI coding assistants that prioritize youth agency and critical interaction alongside supportive scaffolding.',
    url: 'https://doi.org/10.1145/3713043.3727051'
  },
  {
    doi: '10.1145/3744335.3758482',
    domain: 'ai-software',
    title: 'Vibe Coding in Practice: Building a Driving Simulator Without Expert Programming Skills',
    authors: ['Margarida Fortes-Ferreira', 'Md Shadab Alam', 'Pavlo Bazilinskyy'],
    year: 2025,
    publicationType: 'inproceedings',
    booktitle: 'Adjunct Proceedings of the 17th International Conference on Automotive User Interfaces and Interactive Vehicular Applications',
    pages: '60–66',
    abstract: 'The emergence of large language models has introduced new opportunities in software development, particularly through a revolutionary paradigm known as vibe coding or "coding by vibes", in which developers express their software ideas in natural language and where the LLM generates the code. This paper investigates the potential of vibe coding to support novice programmers. The first author, without coding experience, attempted to create a 3D driving simulator using the Cursor platform and Three.js. The iterative prompting process improved the simulation\'s functionality and visual quality. The results indicated that LLM can reduce barriers to creative development and expand access to computational tools. However, challenges remain: prompts often required refinements, output code can be logically flawed, and debugging demanded a foundational understanding of programming concepts. These findings highlight that while vibe coding increases accessibility, it does not completely eliminate the need for technical reasoning and understanding prompt engineering.',
    keywords: ['Vibe Coding', 'Large Language Models (LLMs)', 'Driving Simulator', 'Prompts'],
    url: 'https://doi.org/10.1145/3744335.3758482'
  },
  {
    doi: '10.1109/ICSE55347.2025.00182',
    domain: 'ai-software',
    title: 'MARQ: Engineering Mission-Critical AI-Based Software with Automated Result Quality Adaptation',
    authors: ['Uwe Gropengießer', 'Elias Dietz', 'Florian Brandherm', 'Achref Doula', 'Osama Abboud', 'Xun Xiao', 'Max Mühlhäuser'],
    year: 2025,
    publicationType: 'inproceedings',
    booktitle: 'Proceedings of the IEEE/ACM 47th International Conference on Software Engineering',
    pages: '1934–1946',
    abstract: 'AI-based mission-critical software exposes a blessing and a curse: its inherent statistical nature allows for flexibility in result quality, yet the mission-critical importance demands adherence to stringent constraints such as execution deadlines. This creates a space for trade-offs between the Quality of Result (QoR)—a metric that quantifies the quality of a computational outcome—and other application attributes like execution time and energy, particularly in real-time scenarios. Fluctuating resource constraints, such as data transfer to a remote server over unstable network connections, are prevalent in mobile and edge computing environments—encompassing use cases like Vehicle-to-Everything, drone swarms, or social-VR scenarios. We introduce a novel approach that enables software engineers to easily specify alternative AI service chains—sequences of AI services encapsulated in microservices aiming to achieve a predefined goal—with varying QoR and resource requirements. Our methodology facilitates dynamic optimization at runtime, which is automatically driven by the MARQ framework. Our evaluations show that MARQ can be used effectively for the dynamic selection of AI service chains in real-time while maintaining the required application constraints of mission-critical AI software. Notably, our approach achieves a 100× acceleration in service chain selection and an average 10% improvement in QoR compared to existing methods.',
    keywords: ['mission-critical AI', 'quality of result', 'edge computing', 'approximate computing', 'software engineering'],
    url: 'https://doi.org/10.1109/ICSE55347.2025.00182'
  },
  {
    doi: '10.1145/3651990',
    domain: 'ai-software',
    title: '"It would work for me too": How Online Communities Shape Software Developers\' Trust in AI-Powered Code Generation Tools',
    authors: ['Ruijia Cheng', 'Ruotong Wang', 'Thomas Zimmermann', 'Denae Ford'],
    year: 2024,
    publicationType: 'article',
    journal: 'ACM Trans. Interact. Intell. Syst.',
    volume: '14',
    issue: '2',
    abstract: 'While revolutionary AI-powered code generation tools have been rising rapidly, we know little about how and how to help software developers form appropriate trust in those AI tools. Through a two-phase formative study, we investigate how online communities shape developers\' trust in AI tools and how we can leverage community features to facilitate appropriate user trust. Through interviewing 17 developers, we find that developers collectively make sense of AI tools using the experiences shared by community members and leverage community signals to evaluate AI suggestions. We then surface design opportunities and conduct 11 design probe sessions to explore the design space of using community features to support user trust in AI code generation systems. We synthesize our findings and extend an existing model of user trust in AI technologies with sociotechnical factors. We map out the design considerations for integrating user community into the AI code generation experience.',
    keywords: ['Online communities', 'software engineering', 'Human-AI interaction', 'generative AI', 'trust'],
    url: 'https://doi.org/10.1145/3651990'
  },
  {
    doi: '10.1145/3746059.3747778',
    domain: 'ai-software',
    title: 'Semantic Commit: Helping Users Update Intent Specifications for AI Memory at Scale',
    authors: ['Priyan Vaithilingam', 'Munyeong Kim', 'Frida-Cecilia Acosta-Parenteau', 'Daniel Lee', 'Amine Mhedhbi', 'Elena L. Glassman', 'Ian Arawjo'],
    year: 2025,
    publicationType: 'inproceedings',
    booktitle: 'Proceedings of the 38th Annual ACM Symposium on User Interface Software and Technology',
    abstract: 'As AI agents increasingly rely on memory systems to align with user intent, updating these memories presents challenges of semantic conflict and ambiguity. Inspired by impact analysis in software engineering, we introduce SemanticCommit, a mixed-initiative interface to help users integrate new intent into intent specifications—natural language documents like AI memory lists, Cursor Rules, and game design documents—while maintaining consistency. SemanticCommit detects potential semantic conflicts using a knowledge graph-based retrieval-augmented generation pipeline, and assists users in resolving them with LLM support. Through a within-subjects study with 12 participants comparing SemanticCommit to a chat-with-document baseline (OpenAI Canvas), we find differences in workflow: half of our participants adopted a workflow of impact analysis when using SemanticCommit, where they would first flag conflicts without AI revisions then resolve conflicts locally, despite having access to a global revision feature. Additionally, users felt SemanticCommit offered a greater sense of control without increasing workload. Our findings indicate that AI agent interfaces should help users validate AI retrieval independently from generation, suggesting that the benefits from improved control can offset the costs of manual review. Our work speaks to the need for AI system designers to think about updating memory as a process that involves human feedback and decision-making.',
    keywords: ['memory management', 'AI agents', 'large language models', 'impact analysis', 'human-AI grounding', 'intent specification'],
    url: 'https://doi.org/10.1145/3746059.3747778'
  },
  {
    doi: '10.1145/3759425.3763392',
    domain: 'ai-software',
    title: 'The Modular Imperative: Rethinking LLMs for Maintainable Software',
    authors: ['Anastasiya Kravchuk-Kirilyuk', 'Fernanda Graciolli', 'Nada Amin'],
    year: 2025,
    publicationType: 'inproceedings',
    booktitle: 'Proceedings of the 1st ACM SIGPLAN International Workshop on Language Models and Programming Languages',
    pages: '106–111',
    abstract: 'Large language models (LLMs) are becoming increasingly integrated into software development, with a majority of developers now adopting AI tools for code generation. Although the current models can often produce syntactically and functionally correct code, they often generate unnecessarily complex solutions, and struggle with large, evolving code bases that have rich internal structure. Most evaluations of LLM-generated code to date have focused primarily on test-based accuracy, unfairly overlooking other essential aspects of software quality. In this paper, we emphasize the importance of modularity — the practice of structuring code into well-defined, reusable components — as a critical lens for improving the maintainability of AI-generated code. We argue that modularity should be a foundational principle in LLM-assisted code generation, empowering models to produce more maintainable, production-ready software.',
    keywords: ['LLM', 'maintainability', 'modularity', 'software'],
    url: 'https://doi.org/10.1145/3759425.3763392'
  },
  {
    doi: '10.1007/978-3-032-04207-1_19',
    domain: 'ai-software',
    title: 'Towards AI-Driven Organizations',
    authors: ['Jan Bosch', 'Helena Holmström Olsson'],
    year: 2025,
    publicationType: 'inproceedings',
    booktitle: 'Software Engineering and Advanced Applications: 51st Euromicro Conference, SEAA 2025, Salerno, Italy, September 10–12, 2025, Proceedings, Part III',
    pages: '280–295',
    abstract: 'There are few technologies, if any, that have the potential to change the software-intensive industry to the extent that artificial intelligence (AI) is currently doing. Across industries, companies are adopting these technologies to improve productivity, to increase efficiency and to automate tasks. In products, AI is used for optimization and mass-customization. However, there are few examples of companies that use AI to reinvent and fundamentally change their existing practices. In this paper, we present results from an expert interview study in which we explore how AI is affecting the ways in which companies operate and what steps companies evolve through when advancing their use of AI in their development processes, in their products and in their business processes. The contribution of the paper is two-fold. First, we present the interview results that reflect the adoption and use of AI technologies. As part of our interviews, we also identify a set of key challenges that companies experience. Second, we present an inductively derived three-pronged maturity model that describes how companies transition from traditional towards AI-driven organizations.',
    keywords: ['Software-intensive systems companies', 'AI-driven development process', 'AI-driven products', 'AI-driven organizations'],
    url: 'https://doi.org/10.1007/978-3-032-04207-1_19'
  },
  {
    doi: '10.1145/3765754',
    domain: 'ai-software',
    title: 'TestLoop: A Process Model Describing Human-in-the-Loop Software Test Suite Generation',
    authors: ['Matthew C. Davis', 'Sangheon Choi', 'Amy Wei', 'Sam Estep', 'Brad A. Myers', 'Joshua Sunshine'],
    year: 2025,
    publicationType: 'article',
    journal: 'ACM Trans. Softw. Eng. Methodol.',
    abstract: 'There is substantial diversity among testing tools used by software engineers. For example, fuzzers may target crashes and security vulnerabilities while Test sUite Generators (TUGs) may create high-coverage test suites. In the research community, test generation tools are primarily evaluated using metrics like bugs identified or code coverage. However, achieving good values for these metrics does not necessarily imply that these tools help software engineers efficiently develop effective test suites. To understand the test suite generation process, we performed a secondary analysis of recordings from a previously-published user study in which 28 professional software engineers used two tools to generate test suites for three programs with each tool. From these 168 recordings, we extracted a process model of test suite generation called TestLoop that builds upon prior work and systematizes a user\'s test suite generation process for a single function into 7 steps. We then used TestLoop\'s steps to describe 8 prior and 10 new recordings of users generating test suites using the Jest, Hypothesis, and NaNofuzz test generation tools. Our results showed that TestLoop can be used to help answer previously hard-to-answer questions about how users interact with test suite generation tools and to identify ways that tools might be improved.',
    url: 'https://doi.org/10.1145/3765754'
  },
  {
    doi: '10.1007/s10270-025-01274-5',
    domain: 'ai-software',
    title: 'The technological landscape of collaborative model-driven software engineering',
    authors: ['Abhishek Choudhury', 'Ivano Malavolta', 'Federico Ciccozzi', 'Kousar Aslam', 'Patricia Lago'],
    year: 2025,
    publicationType: 'article',
    journal: 'Softw. Syst. Model.',
    volume: '24',
    issue: '5',
    pages: '1595–1619',
    abstract: 'Collaborative technologies are continuously evolving to address existing problems and introduce innovative features for enhancing collaboration in the landscape of model-driven software engineering (MDSE). Different collaborative MDSE technologies (CMTs) provide different solutions to facilitate collaboration, making it hard for practitioners to choose the technology that best suits their needs. This study aims to investigate the landscape of CMTs and to provide a list of recommended technologies tailored to specific use case scenarios in the context of MDSE. We compiled a comprehensive list of CMTs using a systematic search complemented with snowballing, investigating both academic and grey literature. The technologies were selected through a set of inclusion and exclusion criteria and eventually analyzed through an in-depth analysis focusing on model management, collaboration, and communication. The findings of our study reveal that the current landscape of CMTs is characterized by a relatively narrow range of capabilities offered by different technologies. Consequently, practitioners often have to become proficient in combining several different technologies in order to meet their needs. While various CMTs offer distinct collaboration approaches, the current landscape could be richer in terms of capabilities. Our research provides a comprehensive description of recommended CMTs, enabling practitioners to make informed decisions and improve collaboration in their MDSE processes.',
    keywords: ['Collaborative modeling', 'Model-driven software engineering', 'Collaborative modeling technologies'],
    url: 'https://doi.org/10.1007/s10270-025-01274-5'
  },
  {
    doi: '10.1016/j.ipm.2024.103877',
    domain: 'ai-software',
    title: 'Prototype-oriented hypergraph representation learning for anomaly detection in tabular data',
    authors: ['Shu Li', 'Yi Lu', 'Shicheng Jiu', 'Haoxiang Huang', 'Guangqi Yang', 'Jiong Yu'],
    year: 2025,
    publicationType: 'article',
    journal: 'Inf. Process. Manage.',
    volume: '62',
    issue: '1',
    keywords: ['Tabular data', 'Anomaly detection', 'Noisy data', 'Hypergraph neural networks', 'Prototype'],
    url: 'https://doi.org/10.1016/j.ipm.2024.103877'
  },
  {
    doi: '10.1517/3517428.3544819',
    domain: 'ai-software',
    title: 'LaMPost: Design and Evaluation of an AI-assisted Email Writing Prototype for Adults with Dyslexia',
    authors: ['Steven M. Goodman', 'Erin Buehler', 'Patrick Clary', 'Andy Coenen', 'Aaron Donsbach', 'Tiffanie N. Horne', 'Michal Lahav', 'Robert MacDonald', 'Rain Breaw Michaels', 'Ajit Narayanan', 'Mahima Pushkarna', 'Joel Riley', 'Alex Santana', 'Lei Shi', 'Rachel Sweeney', 'Phil Weaver', 'Ann Yuan', 'Meredith Ringel Morris'],
    year: 2022,
    publicationType: 'inproceedings',
    booktitle: 'Proceedings of the 24th International ACM SIGACCESS Conference on Computers and Accessibility',
    abstract: 'Prior work has explored the writing challenges experienced by people with dyslexia, and the potential for new spelling, grammar, and word retrieval technologies to address these challenges. However, the capabilities for natural language generation demonstrated by the latest class of large language models (LLMs) highlight an opportunity to explore new forms of human-AI writing support tools. In this paper, we introduce LaMPost, a prototype email-writing interface that explores the potential for LLMs to power writing support tools that address the varied needs of people with dyslexia. LaMPost draws from our understanding of these needs and introduces novel AI-powered features for email-writing, including: outlining main ideas, generating a subject line, suggesting changes, rewriting a selection. We evaluated LaMPost with 19 adults with dyslexia, identifying many promising routes for further exploration (including the popularity of the "rewrite" and "subject line" features), but also finding that the current generation of LLMs may not surpass the accuracy and quality thresholds required to meet the needs of writers with dyslexia. Surprisingly, we found that participants\' awareness of the AI had no effect on their perception of the system, nor on their feelings of autonomy, expression, and self-efficacy when writing emails. Our findings yield further insight into the benefits and drawbacks of using LLMs as writing support for adults with dyslexia and provide a foundation to build upon in future research.',
    keywords: ['dyslexia', 'large language models', 'writing'],
    url: 'https://doi.org/10.1145/3517428.3544819'
  },
  {
    doi: '10.1016/j.aei.2024.102880',
    domain: 'ai-software',
    title: 'Research on click enhancement strategy of hand-eye dual-channel human-computer interaction system: Trade-off between sensing area and area cursor',
    authors: ['Ya-Feng Niu', 'Rui Chen', 'Yi-Yan Wang', 'Xue-Ying Yao', 'Yun Feng'],
    year: 2024,
    publicationType: 'article',
    journal: 'Adv. Eng. Inform.',
    volume: '62',
    keywords: ['Eye control', 'Click enhancement', 'Midas touch', 'Sensing area', 'Area cursor'],
    url: 'https://doi.org/10.1016/j.aei.2024.102880'
  }
]

// Chemistry citations (from organic+chemistry+calcium+oxygen+models.txt)
const chemistryCitations: Citation[] = [
  {
    doi: '10.1002/zaac.200800386',
    domain: 'chemistry',
    title: 'Recent Developments in the Organic Chemistry of Calcium – An Element with Unlimited Possibilities in Organometallic Chemistry?',
    authors: ['Matthias Westerhausen'],
    year: 2009,
    publicationType: 'article',
    journal: 'Zeitschrift für anorganische und allgemeine Chemie',
    volume: '635',
    issue: '1',
    pages: '13-32',
    abstract: 'The organocalcium chemistry developed vastly during the last decade. The preparation of the organocalcium compounds via direct synthesis (insertion of Ca into a C-X bond of phenyl halides, Grignard reaction) affords skilful procedures due to the inertia of the calcium metal and the extreme reactivity of the organocalcium derivatives. Further suitable preparative methods include metathesis reactions of CaX2 with KR or LiR, metallation reactions of H-acidic substrates, metal-halogen exchange reactions, and transmetallation of heavy main group atoms in their compounds with calcium metal. Possibilities to stabilize organocalcium compounds include steric shielding by bulky ligands at the periphery and electronic reduction of the nucleophilicity of the calcium-bound carbanions. Selected applications in catalysis such as hydrophosphination are also mentioned. Very recent developments and challenges in the preparation of alkaline earth metal(I) compounds are presented as well. Concepts to overcome the rather large atomization energies of the metals are discussed.',
    keywords: ['Calcium', 'Alkylcalcium Compounds', 'Arylcalcium Compounds', 'Inverse Sandwich', 'Catalysis', 'Heavy Grignard Reagents'],
    url: 'https://doi.org/10.1002/zaac.200800386'
  },
  {
    doi: '10.1002/ejoc.202200968',
    domain: 'chemistry',
    title: 'Colloidosomes as a Protocell Model: Engineering Life-Like Behaviour through Organic Chemistry',
    authors: ['Jun Hyeong Park', 'Agostino Galanti', 'India Ayling', 'Sebastien Rochat', 'Mark S. Workentin', 'Pierangelo Gobbo'],
    year: 2022,
    publicationType: 'article',
    journal: 'European Journal of Organic Chemistry',
    volume: '2022',
    issue: '43',
    abstract: 'The bottom-up synthesis of self-assembled micro-compartmentalised systems that mimic basic characteristics of living cells is rapidly evolving. These types of systems are termed "protocells" and can be chemically programmed to grow and divide, to send and receive chemical signals, to transcript and translate chemical information, to adhere to surfaces or to other protocells, and to perform rudimental enzyme-mediated metabolic processes. An emerging protocell model that is attracting great attention is the colloidosome. Colloidosomes are microcapsules with a chemically crosslinked, semipermeable membrane composed of amphiphilic nanoparticles. Colloidosomes display important advantages over other protocell models (e.g., vesicles and coacervate micro-droplets) due to their physical-chemical properties that can be easily tuned through the careful engineering of their synthetic building blocks. In this review, we deliver an overview of the different types of colloidosomes that have been developed thus far and discuss how organic chemistry contributes to the design and bottom-up synthesis of novel types of colloidosomes endowed with advanced chemically programmed bio-inspired functions.',
    keywords: ['Colloidosomes', 'Life-like systems', 'Protocells', 'Surface chemistry', 'Synthetic biology'],
    url: 'https://doi.org/10.1002/ejoc.202200968'
  },
  {
    doi: '10.1002/cssc.201802412',
    domain: 'chemistry',
    title: 'Calcium-Based Sustainable Chemical Technologies for Total Carbon Recycling',
    authors: ['Konstantin S. Rodygin', 'Yulia A. Vikenteva', 'Valentine P. Ananikov'],
    year: 2019,
    publicationType: 'article',
    journal: 'ChemSusChem',
    volume: '12',
    issue: '8',
    pages: '1483-1516',
    abstract: 'Calcium carbide, a stable solid compound composed of two atoms of carbon and one of calcium, has proven its effectiveness in chemical synthesis, due to the safety and convenience of handling the C≡C acetylenic units. The areas of CaC2 application are very diverse, and the development of calcium-mediated approaches resolves several important challenges. This Review aims to discuss the laboratory chemistry of calcium carbide, and to go beyond its frontiers to organic synthesis, life sciences, materials and construction, carbon dioxide capturing, alloy manufacturing, and agriculture. The recyclability of calcium carbide and the availability of large-scale industrial production facilities, as well as the future possibility of fossil-resource-independent manufacturing, position this compound as a key chemical platform for sustainable development. Easy regeneration and reuse of the carbide highlight calcium-based sustainable chemical technologies as promising instruments for total carbon recycling.',
    keywords: ['calcium', 'carbon', 'green chemistry', 'heterogeneous catalysis', 'sustainable chemistry'],
    url: 'https://doi.org/10.1002/cssc.201802412'
  },
  {
    doi: '10.1002/ajoc.202500141',
    domain: 'chemistry',
    title: 'Calcium-Catalyzed Multicomponent Reactions in Organic Synthesis',
    authors: ['Abhishek Pareek', 'Ravikrishna Dada', 'Srinivasarao Yaragorla'],
    year: 2025,
    publicationType: 'article',
    journal: 'Asian Journal of Organic Chemistry',
    volume: '14',
    issue: '6',
    abstract: 'Calcium catalysis has garnered significant attention from synthetic organic chemists as a sustainable alternative to Lewis acidic transition metals, rare-earth metals, and strong Brønsted acids. This alkaline earth metal, abundant in nature, environmentally benign, moisture-tolerant, biodegradable, and low in toxicity, offers distinct advantages. Calcium catalysts exhibit exceptional proficiency in activating diverse functional groups, particularly π-activated species such as ketones, alcohols, enamines, aldehydes, alkenes, alkynes, and allenes, thereby enabling nucleophilic additions and tandem chemical transformations. These characteristics resonate with the core tenets of green chemistry, enhancing atom and step economy while minimizing waste generation. This review presents a thorough and in-depth analysis of calcium-catalyzed multi-component reactions (MCRs), underscoring their transformative role in advancing sustainable organic synthesis. Furthermore, it explores the untapped potential of calcium catalysis in broadening the horizons of MCRs, and fostering innovative and eco-friendly methodologies for applications in pharmaceuticals and materials science. Key challenges and future prospects within this evolving domain are also critically examined.',
    keywords: ['Acyclic and cyclic compounds', 'Alkaline earth metal', 'Asymmetric catalysis', 'Biodegradable catalysts', 'Calcium catalysis', 'Green chemistry', 'Multicomponent reactions (MCRs)', 'Organic synthesis', 'Sustainable catalysis'],
    url: 'https://doi.org/10.1002/ajoc.202500141'
  },
  {
    doi: '10.1002/chem.202300030',
    domain: 'chemistry',
    title: 'Organoselenium Compounds: Chemistry and Applications in Organic Synthesis',
    authors: ['Juan M. Sonego', 'Sheila I. de Diego', 'Sergio H. Szajnman', 'Carola Gallo-Rodriguez', 'Juan B. Rodriguez'],
    year: 2023,
    publicationType: 'article',
    journal: 'Chemistry – A European Journal',
    volume: '29',
    issue: '52',
    abstract: 'Selenium, originally described as a toxin, turns out to be a crucial trace element for life that appears as selenocysteine and its dimer, selenocystine. From the point of view of drug developments, selenium-containing drugs are isosteres of sulfur and oxygen with the advantage that the presence of the selenium atom confers antioxidant properties and high lipophilicity, which would increase cell membrane permeation leading to better oral bioavailability. In this article, we have focused on the relevant features of the selenium atom, above all, the corresponding synthetic approaches to access a variety of organoselenium molecules along with the proposed reaction mechanisms. The preparation and biological properties of selenosugars, including selenoglycosides, selenonucleosides, selenopeptides, and other selenium-containing compounds will be treated. We have attempted to condense the most important aspects and interesting examples of the chemistry of selenium into a single article.',
    keywords: ['medicinal chemistry', 'organic syntheses', 'organoselenium compounds', 'selenium'],
    url: 'https://doi.org/10.1002/chem.202300030'
  },
  {
    doi: '10.1002/asia.201501323',
    domain: 'chemistry',
    title: 'Calcium Carbide: A Unique Reagent for Organic Synthesis and Nanotechnology',
    authors: ['Konstantin S. Rodygin', 'Georg Werner', 'Fedor A. Kucherov', 'Valentine P. Ananikov'],
    year: 2016,
    publicationType: 'article',
    journal: 'Chemistry – An Asian Journal',
    volume: '11',
    issue: '7',
    pages: '965-976',
    abstract: 'Acetylene, HC≡CH, is one of the primary building blocks in synthetic organic and industrial chemistry. Several highly valuable processes have been developed based on this simplest alkyne and the development of acetylene chemistry has had a paramount impact on chemical science over the last few decades. However, in spite of numerous useful possible reactions, the application of gaseous acetylene in everyday research practice is rather limited. Moreover, the practical implementation of high-pressure acetylene chemistry can be very challenging, owing to the risk of explosion and the requirement for complex equipment; special safety precautions need to be taken to store and handle acetylene under high pressure, which limit its routine use in a standard laboratory setup. Amazingly, recent studies have revealed that calcium carbide, CaC2, can be used as an easy-to-handle and efficient source of acetylene for in situ chemical transformations. Thus, calcium carbide is a stable and inexpensive acetylene precursor that is available on the ton scale and it can be handled with standard laboratory equipment. The application of calcium carbide in organic synthesis will bring a new dimension to the powerful acetylene chemistry.',
    keywords: ['acetylene', 'calcium carbide', 'industrial chemistry', 'nanotechnology', 'synthetic methods'],
    url: 'https://doi.org/10.1002/asia.201501323'
  },
  {
    doi: '10.1002/anie.201002451',
    domain: 'chemistry',
    title: 'Surface Chemistry of Metal–Organic Frameworks at the Liquid–Solid Interface',
    authors: ['Denise Zacher', 'Rochus Schmid', 'Christof Wöll', 'Roland A. Fischer'],
    year: 2011,
    publicationType: 'article',
    journal: 'Angewandte Chemie International Edition',
    volume: '50',
    issue: '1',
    pages: '176-199',
    abstract: 'Metal-organic frameworks (MOFs) are a fascinating class of novel inorganic-organic hybrid materials. They are essentially based on classic coordination chemistry and hold much promise for unique applications ranging from gas storage and separation to chemical sensing, catalysis, and drug release. The evolution of the full innovative potential of MOFs, in particular for nanotechnology and device integration, however requires a fundamental understanding of the formation process of MOFs. Also necessary is the ability to control the growth of thin MOF films and the positioning of size- and shape-selected crystals as well as MOF heterostructures on a given surface in a well-defined and oriented fashion. MOFs are solid-state materials typically formed by solvothermal reactions and their crystallization from the liquid phase involves the surface chemistry of their building blocks. This Review brings together various key aspects of the surface chemistry of MOFs.',
    keywords: ['coordination modulation', 'heterostructures', 'layer-by-layer growth', 'metal-organic framework', 'surface chemistry'],
    url: 'https://doi.org/10.1002/anie.201002451'
  },
  {
    doi: '10.1002/ejoc.202101492',
    domain: 'chemistry',
    title: 'Origins of Organic Chemistry and Organic Synthesis',
    authors: ['Curt Wentrup'],
    year: 2022,
    publicationType: 'article',
    journal: 'European Journal of Organic Chemistry',
    volume: '2022',
    issue: '25',
    abstract: 'The words organic and synthesis originate with Aristotle (meaning "instrumental" and "put together", respectively) but had different meanings over time. The iatrochemists prepared numerous pharmaceutical remedies in the 1600s but had no concept of organic chemistry. Buffon, Bergman and Gren defined organic bodies as living things in the 1700s, but discrete organic compounds remained unknown. In the late 1700s and early 1800s, organic natural products were isolated by Scheele, and Chevreuil separated carboxylic acids from saponification of fats. Organic chemistry had started. Lavoisier invented and Berzelius improved combustion analysis for organic characterization. Descartes\' dictum that synthesis is required to prove an analysis was enacted by Bergman and others. The concept of organic chemistry changed radically when Wöhler and Kolbe prepared organic compounds from the elements. Berthelot\'s syntheses of non-natural fats in 1853 started modern synthetic organic chemistry as the chemistry of carbon compounds, regardless of whether occurring in Nature or not.',
    keywords: ['Analytical methods', 'History of chemistry', 'Organic bodies', 'Organic molecules', 'Synthetic methods'],
    url: 'https://doi.org/10.1002/ejoc.202101492'
  },
  {
    doi: '10.1002/cptc.202300069',
    domain: 'chemistry',
    title: 'Oxygen-Mediated Surface Photoreactions: Exploring New Pathways for Sustainable Chemistry',
    authors: ['Ivano Alessandri', 'Irene Vassalini'],
    year: 2023,
    publicationType: 'article',
    journal: 'ChemPhotoChem',
    volume: '7',
    issue: '12',
    abstract: 'This Concept analyses and reviews recent works that take advantage of oxygen-mediated surface photoreactions for addressing key issues in the fields of sustainable chemistry, circular production of feedstocks and environmental remediation. Examples of metal and polymer recovery and recycling from waste, metal-free oxidation of organic molecules and exploitation of persistent radicals for destroying pollutants and disinfection are discussed, highlighting common aspects, peculiarities, potential and limitations.',
    keywords: ['photocatalysis', 'Oxygen photochemistry', 'Green Chemistry', 'Sustainable materials'],
    url: 'https://doi.org/10.1002/cptc.202300069'
  },
  {
    doi: '10.1002/pro.70023',
    domain: 'chemistry',
    title: 'CaXML: Chemistry-informed machine learning explains mutual changes between protein conformations and calcium ions in calcium-binding proteins using structural and topological features',
    authors: ['Pengzhi Zhang', 'Jules Nde', 'Yossi Eliaz', 'Nathaniel Jennings', 'Piotr Cieplak', 'Margaret S. Cheung'],
    year: 2025,
    publicationType: 'article',
    journal: 'Protein Science',
    volume: '34',
    issue: '2',
    abstract: 'Proteins\' flexibility is a feature in communicating changes in cell signaling instigated by binding with secondary messengers, such as calcium ions, associated with the coordination of muscle contraction, neurotransmitter release, and gene expression. When binding with the disordered parts of a protein, calcium ions must balance their charge states with the shape of calcium-binding proteins and their versatile pool of partners depending on the circumstances they transmit. Accurately determining the ionic charges of those ions is essential for understanding their role in such processes. However, it is unclear whether the limited experimental data available can be effectively used to train models to accurately predict the charges of calcium-binding protein variants. Here, we developed a chemistry-informed, machine-learning algorithm that implements a game theoretic approach to explain the output of a machine-learning model without the prerequisite of an excessively large database for high-performance prediction of atomic charges. We used the ab initio electronic structure data representing calcium ions and the structures of the disordered segments of calcium-binding peptides with surrounding water molecules to train several explainable models. Network theory was used to extract the topological features of atomic interactions in the structurally complex data dictated by the coordination chemistry of a calcium ion, a potent indicator of its charge state in protein. Our design created a computational tool of CaXML, which provided a framework of explainable machine learning model to annotate ionic charges of calcium ions in calcium-binding proteins in response to the chemical changes in an environment. Our framework will provide new insights into protein design for engineering functionality based on the limited size of scientific data in a genome space.',
    keywords: ['calcium-binding protein', 'calmodulin', 'EF-hand motif', 'graph theory', 'ion charge state', 'machine learning explanation', 'many-body interactions'],
    url: 'https://doi.org/10.1002/pro.70023'
  },
  {
    doi: '10.1029/2024JG008357',
    domain: 'chemistry',
    title: 'Organic Carbon Remineralization and Calcium Carbonate Production Rates in the Red Sea Computed From Oxygen and Alkalinity Utilizations',
    authors: ['Salma Elageed', 'Abdirahman M. Omar', 'Emil Jeansson', 'Ingunn Skjelvan', 'Knut Barthel', 'Truls Johannessen'],
    year: 2025,
    publicationType: 'article',
    journal: 'Journal of Geophysical Research: Biogeosciences',
    volume: '130',
    issue: '3',
    abstract: 'Organic carbon remineralization rate (OCRR) and the calcium carbonate production rate (CCPR) are influential variables on the efficiency of the biological carbon pump (BCP) but are not well understood in Red Sea. We used historical cruise data of carbonate chemistry, oxygen, and transient tracers from five locations along the north-south central axis of the Red Sea to estimate OCRR and CCPR from tracer-based water mean ages (Γ), apparent oxygen utilization (AOU), and alkalinity utilization (AU). This resulted in the first basin-wide and depth-resolving (100-1,000 m) OCRR and CCPR estimates. Spatial distributions for Γ, AOU, and AU were strongly influenced by the large-scale circulation and showed maxima intermediate depths (400-500 m). Conversely, OCRR and CCPR showed no statistically significant latitudinal differences and peaked (6.5 ± 4.3 and 11.9 ± 4.6 mmol C m-3 yr-1, respectively) at 100-m depth, which decreased to nearly constant values (3.8 ± 0.7 and 1.4 ± 0.3 mmol C m-3 yr-1, respectively) at 300 m and deeper. By depth-integrating CCPR, we estimated annual calcium carbonate production (CCP) of (0.8 ± 0.3) × 1012 mol, or 0.6% of global ocean production, in the Red Sea, which has only 0.12% of the world ocean area. High correlation between AU and Γ indicated in situ alkalinity removal taking place also in subsurface and deep waters, probably due to chemical precipitation, which has been previously reported for the area. CCP-induced AU affects the carbonate chemistry in the Red Sea water column, and we hypothesize that it also impacts that of the Gulf of Aden through the outflowing Red Sea Outflow Water.',
    keywords: ['red sea biogeochemistry', 'oxygen utilization rate', 'alkalinity utilization rate', 'remineralization rate', 'CaCO3 production rate'],
    url: 'https://doi.org/10.1029/2024JG008357'
  },
  {
    doi: '10.1002/adfm.202000238',
    domain: 'chemistry',
    title: 'Pore Chemistry of Metal–Organic Frameworks',
    authors: ['Zhe Ji', 'Haoze Wang', 'Stefano Canossa', 'Stefan Wuttke', 'Omar M. Yaghi'],
    year: 2020,
    publicationType: 'article',
    journal: 'Advanced Functional Materials',
    volume: '30',
    issue: '41',
    abstract: 'The pores in metal-organic frameworks (MOFs) can be functionalized by placing chemical entities along the backbone and within the backbone. This chemistry is enabled by the architectural, thermal, and chemical robustness of the frameworks and the ability to characterize them by many diffraction and spectroscopic techniques. The pore chemistry of MOFs is articulated in terms of site isolation, coupling, and cooperation and relate that to their functions in guest recognition, catalysis, ion and electron transport, energy transfer, pore-dynamic modulation, and interface construction. It is envisioned that the ultimate control of pore chemistry requires arranging functionalities into defined sequences and developing techniques for reading and writing such sequences within the pores.',
    keywords: ['functionality sequencing', 'metal–organic frameworks', 'pore chemistry', 'site cooperation', 'site coupling'],
    url: 'https://doi.org/10.1002/adfm.202000238'
  },
  {
    doi: '10.1002/chem.201903232',
    domain: 'chemistry',
    title: 'The Symbiotic Relationship Between Drug Discovery and Organic Chemistry',
    authors: ['Oleksandr O. Grygorenko', 'Dmitriy M. Volochnyuk', 'Sergey V. Ryabukhin', 'Duncan B. Judd'],
    year: 2020,
    publicationType: 'article',
    journal: 'Chemistry – A European Journal',
    volume: '26',
    issue: '6',
    pages: '1196-1237',
    abstract: 'All pharmaceutical products contain organic molecules; the source may be a natural product or a fully synthetic molecule, or a combination of both. Thus, it follows that organic chemistry underpins both existing and upcoming pharmaceutical products. The reverse relationship has also affected organic synthesis, changing its landscape towards increasingly complex targets. This Review article sets out to give a concise appraisal of this symbiotic relationship between organic chemistry and drug discovery, along with a discussion of the design concepts and highlighting key milestones along the journey. In particular, criteria for a high-quality compound library design enabling efficient virtual navigation of chemical space, as well as rise and fall of concepts for its synthetic exploration (such as combinatorial chemistry; diversity-, biology-, lead-, or fragment-oriented syntheses; and DNA-encoded libraries) are critically surveyed.',
    keywords: ['chemoinformatics', 'combinatorial chemistry', 'drug discovery', 'natural products', 'organic synthesis'],
    url: 'https://doi.org/10.1002/chem.201903232'
  }
]

// Combined array
export const allCitations: Citation[] = [...aiSoftwareCitations, ...chemistryCitations]

// Helper functions
export function getCitationByDOI(doi: string): Citation | undefined {
  return allCitations.find(citation => citation.doi === doi)
}

export function getCitationsByDomain(domain: CitationDomain): Citation[] {
  return allCitations.filter(citation => citation.domain === domain)
}

export function getAllDOIs(): string[] {
  return allCitations.map(citation => citation.doi)
}

export function getDOIsByDomain(domain: CitationDomain): string[] {
  return getCitationsByDomain(domain).map(citation => citation.doi)
}

// Convert Citation to schema.org JSON-LD format for PublicationCard
export function citationToSchemaOrg(citation: Citation): any {
  const baseSchemaOrg: any = {
    '@context': 'https://schema.org',
    '@type': citation.publicationType === 'article' ? 'ScholarlyArticle' : 
             citation.publicationType === 'inproceedings' ? 'ScholarlyArticle' :
             citation.publicationType === 'book' ? 'Book' : 'CreativeWork',
    headline: citation.title,
    name: citation.title,
    doi: citation.doi,
    url: citation.url,
    datePublished: citation.year.toString(),
    author: citation.authors.map(author => ({
      '@type': 'Person',
      name: author
    }))
  }

  if (citation.abstract) {
    baseSchemaOrg.abstract = citation.abstract
  }

  if (citation.keywords) {
    baseSchemaOrg.keywords = citation.keywords
  }

  if (citation.journal) {
    baseSchemaOrg.isPartOf = {
      '@type': 'Periodical',
      name: citation.journal,
      ...(citation.volume && { volumeNumber: citation.volume }),
      ...(citation.issue && { issueNumber: citation.issue })
    }
  }

  if (citation.booktitle) {
    baseSchemaOrg.isPartOf = {
      '@type': 'Book',
      name: citation.booktitle
    }
  }

  if (citation.publisher) {
    baseSchemaOrg.publisher = {
      '@type': 'Organization',
      name: citation.publisher
    }
  }

  if (citation.pages) {
    const pageRange = citation.pages.split('–')
    if (pageRange.length === 2) {
      baseSchemaOrg.pageStart = pageRange[0]
      baseSchemaOrg.pageEnd = pageRange[1]
    }
  }

  return baseSchemaOrg
}

