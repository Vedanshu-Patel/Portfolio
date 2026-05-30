function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return 'https://vedanshu-patel.vercel.app';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

export const SITE_URL = resolveSiteUrl();

export type Profile = {
  name: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  links: {
    linkedin: string;
    github: string;
    resume: string;
  };
};

export type Experience = {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  tech: string[];
  github: string;
  highlights: string[];
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Education = {
  school: string;
  degree: string;
  start: string;
  end: string;
  location: string;
  gpa: string;
  coursework: string[];
};

export type Publication = {
  title: string;
  venue: string;
  url: string;
  description: string;
};

export const profile: Profile = {
  name: 'Vedanshu Patel',
  tagline: 'Data Engineer & ML Practitioner',
  bio: "Master's in Computer Science from Northeastern University. I build production data systems and ML pipelines — most recently a multi-product sales forecasting solution and a RAG-powered document QA system at Boehringer Ingelheim. Open to full-time Data Engineering and ML Engineering roles.",
  location: 'Boston, MA',
  email: 'vedanshu.patel02@gmail.com',
  phone: '617-866-1489',
  links: {
    linkedin: 'https://www.linkedin.com/in/vedanshu-patel/',
    github: 'https://github.com/Vedanshu-Patel',
    resume: '/resume.pdf',
  },
};

export const experience: Experience[] = [
  {
    company: 'Boehringer Ingelheim',
    role: 'Data Science Co-op',
    location: 'Ridgefield, CT',
    start: 'July 2025',
    end: 'December 2025',
    bullets: [
      'Built a multi-product sales forecasting solution in Databricks using SARIMAX, Prophet, Random Forest, and Elastic Net — achieved 12% MAPE and 0.89 R².',
      'Preprocessed and feature-engineered Snowflake data via AWS Glue, landing curated datasets in S3 for model training.',
      'Deployed the forecasting stack on AWS with SageMaker, Airflow orchestration, and a GitHub Actions + Terraform CI/CD pipeline.',
      'Built a RAG system over 500+ bioreactor documents using ChromaDB and GPT-4o with hybrid retrieval and recursive chunking.',
      'Shipped a Streamlit chatbot used by 50+ scientists to query the corpus, with conversation memory and inline feedback capture.',
      'Implemented MCP-based AI agents that dynamically pull context from internal databases during retrieval.',
    ],
  },
  {
    company: 'Techgrains Technologies',
    role: 'Software Engineer',
    location: 'Ahmedabad, India',
    start: 'August 2023',
    end: 'July 2024',
    bullets: [
      'Designed a retail e-commerce data platform processing 10M+ daily clickstream/POS events through Kafka and Flink into S3 — cut analytics latency from 4 hours to 15 minutes.',
      'Orchestrated 15+ Airflow DAGs managing Databricks notebooks, AWS Glue jobs, and Lambdas across bronze/silver/gold layers at 99.5% reliability.',
      'Developed 30+ PySpark transformations and 25+ dbt models in Snowflake handling 50GB+ daily, powering 8 BI dashboards and 3 recommendation models.',
      'Engineered 40+ behavioral and transactional features that fed recommendation and segmentation models processing 2M+ daily customer records.',
    ],
  },
];

export const projects: Project[] = [
  {
    slug: 'agentic-trade-desk',
    name: 'Agentic Trade Desk',
    description:
      'Multi-agent stock trading system in Python — agents use the OpenAI Agents SDK with MCP servers to research markets, manage portfolios, and send alerts.',
    tech: [
      'Python',
      'OpenAI Agents SDK',
      'MCP',
      'FastMCP',
      'asyncio',
      'SQLite',
      'Polygon.io',
    ],
    github: 'https://github.com/Vedanshu-Patel/Agentic-Trade-Desk',
    highlights: [
      'Multi-agent stock traders using the OpenAI Agents SDK and MCP — accounts, Polygon market data, and Pushover alerts as agent tools.',
      'MCP tool servers for trading (accounts, market, push) and research (fetch, Brave Search, LibSQL memory) keep agents tool-driven.',
      'Asyncio runs with market-hours checks, multi-LLM routing (OpenAI / DeepSeek / Gemini / Grok), and tracing for observability.',
      'SQLite-backed portfolios, logs, and cached market data cut repeat API calls and stabilize agent context.',
    ],
  },
  {
    slug: 'coauthor-finder',
    name: 'CoAuthorFinder',
    description:
      'Co-author recommendation system over a Neo4j knowledge graph, with a Gemini-powered chatbot that translates natural language into Cypher queries.',
    tech: ['Python', 'Neo4j', 'Streamlit', 'Gemini', 'Knowledge Graphs', 'Graph RAG'],
    github: 'https://github.com/Vedanshu-Patel/ResearchRecommendation',
    highlights: [
      'Jaccard similarity + weighted-average recommendations over researcher profiles; ETL extracts papers via APIs into Neo4j.',
      'Gemini chatbot converts natural language to Cypher, runs against the graph with retry, and returns formatted results in a Streamlit UI.',
    ],
  },
  {
    slug: 'fraud-detection-pipeline',
    name: 'Fraud Detection Data Pipeline',
    description:
      'Real-time fraud detection over transaction streams with stateful pattern detection per user.',
    tech: ['Apache Flink', 'Apache Kafka', 'PyFlink', 'Stream Processing', 'State Management'],
    github: 'https://github.com/Vedanshu-Patel/Fraud-Detection-DataPipeline',
    highlights: [
      'Built a real-time fraud detection pipeline over Kafka + Flink with stateful pattern detection.',
      'Wrote PyFlink KeyedProcessFunctions using the Haversine formula and per-user state to track behavior.',
      'Flags location jumps over 500km and amount spikes exceeding 3× a rolling threshold.',
    ],
  },
  {
    slug: 'crypto-analysis-pipeline',
    name: 'Crypto Analysis Data Pipeline',
    description:
      'Real-time cryptocurrency analytics computing technical indicators across 20+ assets with 30s micro-batches.',
    tech: [
      'Kafka',
      'PySpark',
      'Spark Structured Streaming',
      'PostgreSQL',
      'Zookeeper',
      'Window Functions',
    ],
    github: 'https://github.com/Vedanshu-Patel/Crypto-Analysis-DataPipeline',
    highlights: [
      'Streams 20+ crypto assets via Kafka, with Structured Streaming jobs converting JSON to Parquet.',
      'Computes SMA, EMA, and volatility indicators using windowed aggregations over 1-min and 5-min horizons.',
      '30s micro-batches with checkpointing — identifies top 5 gainers/losers in real time, lands results in 3 normalized PostgreSQL tables.',
    ],
  },
  {
    slug: 'retail-sales-pipeline',
    name: 'Retail Sales Data Pipeline',
    description:
      'Batch ETL pipeline processing daily sales across 10 stores and 50 items, orchestrated end-to-end with Airflow.',
    tech: [
      'Apache Airflow',
      'Apache NiFi',
      'PySpark',
      'HDFS',
      'Workflow Orchestration',
      'Window Functions',
    ],
    github: 'https://github.com/Vedanshu-Patel/Retail-Sales-DataPipeline',
    highlights: [
      'Sales ETL over 10 stores and 50 items via Airflow, NiFi, and PySpark — aggregated metrics stored in HDFS.',
      'NiFi ingestion flow moves CSVs into HDFS; Airflow DAGs schedule the downstream daily PySpark jobs.',
      'PySpark transformations compute quantity sold and revenue per store-item across 100+ daily transactions.',
    ],
  },
  {
    slug: 'delivery-delay-pipeline',
    name: 'Delivery Delay Detection Pipeline',
    description:
      'Streaming pipeline enriching delivery records with weather and traffic data to detect delays and fault percentages.',
    tech: ['Apache Kafka', 'Apache Spark', 'PySpark', 'Python', 'Pandas'],
    github: 'https://github.com/Vedanshu-Patel/Deliveries-Delay-Detection-DataPipeline',
    highlights: [
      'Streams 500K+ delivery records through Kafka and Spark with weather/traffic enrichment.',
      'Kafka producer converts CSV to JSON and feeds the real-time delivery topic.',
      'PySpark streaming ETL performs temporal joins to compute delay and fault scores.',
    ],
  },
  {
    slug: 'adaptive-learning',
    name: 'Adaptive Learning & Evaluation System',
    description:
      'Personalized learning platform that picks questions by difficulty and target skill, and predicts student performance with ML/DL models.',
    tech: ['Python', 'LSTM', 'RNN', 'XGBoost', 'K-means', 'PCA', 'NumPy', 'Pandas'],
    github: 'https://github.com/Vedanshu-Patel/ADAPTIVE-LEARNING-EVALUATION-SYSTEM',
    highlights: [
      'Dynamically selects questions by difficulty and target skill to improve engagement and performance prediction.',
      'ML + DL models forecast question types and expected scores from historical responses, topic relevance, and indicators.',
    ],
  },
  {
    slug: 'credit-approval',
    name: 'Credit Approval Model',
    description:
      'Credit card approval classifier tuned for recall — bagging and boosting ensembles minimize false negatives in lending decisions.',
    tech: ['Python', 'scikit-learn', 'Bagging', 'Boosting', 'EDA'],
    github: 'https://github.com/Vedanshu-Patel/Credit-Card',
    highlights: [
      'Achieved 85% recall and 78% precision, optimizing for false-negative minimization using income, family size, and employment length.',
      'EDA + feature engineering surfaced patterns and trends that improved model performance.',
    ],
  },
  {
    slug: 'canvas-pro',
    name: 'Canvas Pro',
    description:
      'Full-stack MERN learning management system with modular React, Redux state, REST APIs on Node.js, and MongoDB persistence.',
    tech: ['React', 'Redux', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
    github: 'https://github.com/Vedanshu-Patel/kambaz-node-server-app/tree/a6/Kambaz',
    highlights: [
      'MERN LMS with modular React components, Redux state, REST APIs, and Mongoose-backed Mongo.',
      'Auth, role-based navigation, dynamic forms, and route-based rendering.',
      'Frontend on Netlify, backend on Render, CI/CD via GitHub Actions.',
    ],
  },
  {
    slug: 'image-processing-java',
    name: 'Image Processing Application',
    description:
      'Java image processor supporting 14+ operations across GUI, scripting, and file-input modes — MVC architecture with 250+ tests.',
    tech: ['Java', 'MVC', 'Swing', 'JUnit', 'SOLID'],
    github: 'https://github.com/Vedanshu-Patel/PDP/tree/master/Recitation/Assignment%206',
    highlights: [
      '14+ operations — Greyscale, Sepia, Brightness, Blur, Sharpen, Compression, Downscale, Masking.',
      'MVC architecture with three input modes: GUI, text scripting, and file input.',
      'Split-preview Swing interface; 250+ unit and integration tests for reliability.',
    ],
  },
  {
    slug: 'hotel-booking-management',
    name: 'Hotel Booking Management',
    description:
      'Hotel booking platform handling inventory conflicts and transactional consistency, with Java Swing UI on MySQL.',
    tech: ['MySQL', 'Stored Procedures', 'Triggers', 'Java', 'Java Swing'],
    github: 'https://github.com/Vedanshu-Patel/DBMS/tree/master/Assignments/Project',
    highlights: [
      'Tackled booking conflicts and transactional consistency across inventory, payments, loyalty, seasonal pricing, and reviews.',
      'CRUD across bookings, payments, loyalty tracking, cancellations, and reviews with advanced filtering and check-in/out flows.',
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['Python', 'SQL', 'Scala', 'Java', 'C++', 'JavaScript', 'HTML/CSS'],
  },
  {
    category: 'Data & Streaming',
    items: ['PySpark', 'Kafka', 'Airflow', 'Flink', 'Apache Beam', 'dbt', 'Databricks'],
  },
  {
    category: 'ML & GenAI',
    items: [
      'TensorFlow',
      'PyTorch',
      'scikit-learn',
      'Keras',
      'Pandas',
      'NumPy',
      'Streamlit',
      'ChromaDB',
      'RAG',
      'MCP Agents',
    ],
  },
  {
    category: 'Cloud & DevOps',
    items: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Git', 'Linux'],
  },
  {
    category: 'Databases',
    items: ['Snowflake', 'PostgreSQL', 'MySQL', 'MongoDB', 'Neo4j', 'ChromaDB'],
  },
  {
    category: 'BI & Tools',
    items: ['Tableau', 'Power BI', 'Excel', 'Postman', 'React', 'Node.js'],
  },
];

export const education: Education[] = [
  {
    school: 'Northeastern University',
    degree: 'Master of Science in Computer Science',
    start: 'September 2024',
    end: 'April 2026',
    location: 'Boston, MA',
    gpa: '3.9 / 4.0',
    coursework: [
      'DBMS',
      'Algorithms',
      'Knowledge Graphs with GenAI / GraphDB',
      'Programming Design Paradigms',
      'Web Development',
      'MLOps',
    ],
  },
  {
    school: 'Vellore Institute of Technology',
    degree: 'Bachelor of Technology in Computer Science',
    start: 'August 2020',
    end: 'June 2024',
    location: 'Vellore, India',
    gpa: '8.51 / 10.0',
    coursework: [
      'Machine Learning',
      'Deep Learning',
      'NLP',
      'Statistics',
      'Linear Algebra',
      'Calculus',
      'Distributed Computing',
    ],
  },
];

export const publications: Publication[] = [
  {
    title: 'Computational Intelligence in Cancer Diagnostics',
    venue: 'MDPI Diagnostics, Volume 13, Issue 9',
    url: 'https://www.mdpi.com/2075-4418/13/9/1563',
    description:
      'Peer-reviewed study applying computational intelligence techniques to cancer diagnostic workflows.',
  },
];
