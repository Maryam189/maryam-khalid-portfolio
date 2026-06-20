import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, Mail, ExternalLink, Code, Briefcase, GraduationCap, Award, ChevronDown, Star, GitFork, RefreshCw, AlertCircle, MessageCircle, DollarSign, BriefcaseBusiness } from 'lucide-react';
export default function AutomatedPortfolio() {
  const [activeTab, setActiveTab] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // GitHub username
  const GITHUB_USERNAME = 'Maryam189';

  // Categorization logic based on repo data
  const categorizeProject = (repo) => {
    const description = (repo.description || '').toLowerCase();
    const topics = repo.topics || [];
    const language = (repo.language || '').toLowerCase();
    const name = (repo.name || '').toLowerCase();

    // AI/ML keywords
    if (
      topics.some(t => ['ai', 'ml', 'nlp', 'machine-learning', 'deep-learning', 'tensorflow', 'pytorch', 'llm', 'bert'].includes(t.toLowerCase())) ||
      description.includes('nlp') || 
      description.includes('machine learning') ||
      description.includes('summarization') ||
      description.includes('bert') ||
      description.includes('llm') ||
      description.includes('ai') ||
      description.includes('neural') ||
      name.includes('nlp') ||
      name.includes('ml')
    ) {
      return 'aiml';
    }

    // Automation keywords
    if (
      topics.some(t => ['automation', 'n8n', 'workflow', 'ai-agent', 'langchain'].includes(t.toLowerCase())) ||
      description.includes('automation') ||
      description.includes('agent') ||
      description.includes('workflow') ||
      name.includes('automation')
    ) {
      return 'automation';
    }

    // Full-stack keywords
    if (
      topics.some(t => ['react', 'nodejs', 'web', 'fullstack', 'frontend', 'backend', 'website'].includes(t.toLowerCase())) ||
      description.includes('website') ||
      description.includes('web') ||
      language === 'javascript' ||
      language === 'typescript' ||
      language === 'html' ||
      description.includes('ecommerce') ||
      description.includes('shopping') ||
      name.includes('website') ||
      name.includes('web')
    ) {
      return 'fullstack';
    }

    return 'other';
  };

  // Extract tech stack from repo
  const extractTechStack = (repo) => {
    const tech = [];
    
    if (repo.language) tech.push(repo.language);
    
    // Add topics as tech stack
    if (repo.topics && repo.topics.length > 0) {
      repo.topics.slice(0, 5).forEach(topic => {
        const formatted = topic.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        if (!tech.includes(formatted)) {
          tech.push(formatted);
        }
      });
    }

    // If no topics, add language-based tech
    if (tech.length === 0) {
      if (repo.language) tech.push(repo.language);
    }

    return tech.slice(0, 6); // Limit to 6 technologies
  };

  // Fetch GitHub repositories
  const fetchGitHubProjects = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log(`Fetching repos for ${GITHUB_USERNAME}...`);
      
      // Fetch user repos
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const repos = await response.json();
      console.log(`Fetched ${repos.length} total repositories`);

      // Less aggressive filtering - only filter out forks
      const validRepos = repos
        .filter(repo => !repo.fork && !repo.private && repo.visibility !== 'private')
        .sort((a, b) => {
          // Sort by: stars first, then updated date
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.updated_at) - new Date(a.updated_at);
        });

      console.log(`${validRepos.length} repositories after filtering`);

      setDebugInfo({
        total: repos.length,
        afterFilter: validRepos.length,
        forked: repos.filter(r => r.fork).length,
        archived: repos.filter(r => r.archived).length
      });

      // Transform repos to project format
      const transformedProjects = validRepos.map(repo => {
        const category = categorizeProject(repo);
        console.log(`${repo.name} -> ${category}`);
        
        return {
          title: repo.name
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          description: repo.description || 'A project by Maryam Khalid',
          tech: extractTechStack(repo),
          category: category,
          github: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updated: new Date(repo.updated_at),
          homepage: repo.homepage,
          highlights: [
            repo.stargazers_count > 0 ? `⭐ ${repo.stargazers_count} stars` : '🚀 Active development',
            repo.language ? `💻 Built with ${repo.language}` : '📝 Open source',
            new Date(repo.updated_at).getFullYear() === 2024 || new Date(repo.updated_at).getFullYear() === 2025 
              ? '🆕 Recently updated' 
              : '📦 Maintained'
          ]
        };
      });

      // Add custom/featured projects
      const customProjects = [
        {
          title: 'n8n Automation Workflows',
          description: 'Custom automation workflows using n8n for business process automation, data synchronization, and AI-powered task automation.',
          tech: ['n8n', 'API Integration', 'Webhooks', 'JavaScript', 'AI Agents'],
          category: 'automation',
          highlights: ['🔄 Multi-platform integration', '⚡ Automated workflows', '💰 Cost reduction'],
          custom: true
        },
        {
          title: 'AI Agent Development',
          description: 'Building intelligent AI agents using LangChain and LLMs for automated decision-making and task execution.',
          tech: ['LangChain', 'Python', 'OpenAI API', 'Vector DBs', 'RAG'],
          category: 'automation',
          highlights: ['🤖 Autonomous agents', '🧠 Memory systems', '🔧 Tool integration'],
          custom: true
        }
      ];

      const allProjects = [...customProjects, ...transformedProjects];
      console.log(`Total projects (including custom): ${allProjects.length}`);
      
      setProjects(allProjects);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching GitHub projects:', error);
      setError(error.message);
      
      // Fallback to custom projects only if API fails
      const fallbackProjects = [
        {
          title: 'AI Text Summarization System',
          description: 'Advanced text summarization using DistilBERT, T5-Small, and BART models. Fine-tuned on CNN/Daily Mail dataset.',
          tech: ['Python', 'NLP', 'Transformers', 'BERT', 'T5'],
          category: 'aiml',
          github: 'https://github.com/Maryam189/Enhancing-Text-Summarization-Accuracy-using-NLP-and-LLMS',
          highlights: ['🎯 Fine-tuned LLMs', '🚀 Production-ready', '📊 High accuracy'],
          custom: true
        },
        {
          title: 'n8n Automation Workflows',
          description: 'Custom automation workflows for business process automation and AI-powered task automation.',
          tech: ['n8n', 'API Integration', 'Webhooks', 'JavaScript'],
          category: 'automation',
          highlights: ['🔄 Multi-platform', '⚡ Automated', '💰 Cost savings'],
          custom: true
        },
        {
          title: 'RedShop E-commerce Platform',
          description: 'Full-stack e-commerce website with modern UI/UX, shopping cart, and payment integration.',
          tech: ['React', 'Node.js', 'MongoDB', 'Bootstrap'],
          category: 'fullstack',
          github: 'https://github.com/Maryam189/RedShop-Shopping-Website-FrontEnd',
          highlights: ['📱 Responsive', '🔐 Secure', '👤 Authentication'],
          custom: true
        },
        {
          title: 'Technical Documentation Portfolio',
          description: 'Comprehensive technical writing featuring API documentation, tutorials, and user manuals.',
          tech: ['Markdown', 'Documentation', 'Technical Writing'],
          category: 'other',
          github: 'https://github.com/Maryam189/Technical-Writing',
          highlights: ['📝 Clear docs', '👥 User-centric', '🔍 API guides'],
          custom: true
        }
      ];
      
      setProjects(fallbackProjects);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchGitHubProjects();
  }, []);

  const skills = {
    aiml: [
      'Generative AI',
      'Natural Language Processing',
      'Large Language Models',
      'TensorFlow',
      'PyTorch',
      'Scikit-learn',
      'OpenCV',
      'Pandas'
    ],
    automation: [
      'n8n Automation',
      'AI Agents (Agentic AI)',
      'LangChain',
      'Workflow Automation',
      'API Integration',
      'Zapier',
      'Make (Integromat)'
    ],
    fullstack: [
      'React.js',
      'Node.js',
      'Python',
      'HTML/CSS',
      'Bootstrap',
      'Tailwind CSS',
      'MongoDB',
      'MySQL',
      'PostgreSQL'
    ],
    devops: [
      'Docker',
      'Jenkins',
      'AWS',
      'Git/GitHub',
      'Linux',
      'CI/CD',
      'Hadoop'
    ]
  };

  const experience = [
    {
      title: 'Lab Instructor',
      company: 'NUCES FAST Islamabad',
      period: 'Ongoing',
      description: 'Teaching Computer Networks (CL-3001), guiding students through complex networking concepts, VLSM, routing protocols, and network security.',
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      title: 'Freelance Full-Stack Developer',
      company: 'Self-Employed',
      period: 'Ongoing',
      description: 'Building custom web applications, AI solutions, and automation systems for clients worldwide. Specializing in AI integration and workflow automation.',
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      title: 'NLP Researcher',
      company: 'Academic Research',
      period: 'Ongoing',
      description: 'Conducting research in Natural Language Processing, focusing on text summarization, LLMs, and generative AI applications.',
      icon: <Code className="w-6 h-6" />
    }
  ];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="#" className="flex items-center gap-3">
        <img
          src="/maryli-logo.png"
          alt="Maryli Tech"
          className="h-9 w-auto"
        />
        <div className="leading-tight">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Maryli Tech
          </h1>
          <p className="text-xs text-slate-400">by Maryam Khalid</p>
        </div>
      </a>
            <div className="flex gap-4 items-center">
              <button
                onClick={fetchGitHubProjects}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                title="Refresh projects"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" 
                 className="hover:text-purple-400 transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/in/maryam-khalid-fast-nuces" target="_blank" rel="noopener noreferrer"
                 className="hover:text-purple-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="https://twitter.com/maryamk07994353" target="_blank" rel="noopener noreferrer"
                 className="hover:text-purple-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://discord.com/users/maryam_590" target="_blank" rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </a>
              <a href="https://www.upwork.com/freelancers/~010e383ce3ced1200e" target="_blank" rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors">
               <BriefcaseBusiness className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center gap-3 flex-wrap">
            
            <span className="px-4 py-2 bg-green-500/20 rounded-full text-green-300 text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Available for Freelance Projects
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            AI/ML Expert & Full-Stack Developer
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            Specializing in <span className="text-purple-400 font-semibold">Generative AI</span>, 
            <span className="text-pink-400 font-semibold"> NLP</span>, 
            <span className="text-purple-400 font-semibold"> AI Agents</span>, and 
            <span className="text-pink-400 font-semibold"> Workflow Automation</span>
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#contact" 
               className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition-transform">
              Hire Me
            </a>
            <a href="#projects" 
               className="px-8 py-3 bg-slate-800 rounded-lg font-semibold hover:bg-slate-700 transition-colors border border-purple-500/30">
              View Projects
            </a>
          </div>
          
          {/* Debug Info 
          {debugInfo && (
            <div className="mt-6 text-xs text-slate-500">
              Debug: {debugInfo.total} total repos, {debugInfo.afterFilter} shown ({debugInfo.forked} forked, {debugInfo.archived} archived)
            </div>
          )}
          */}
          {lastUpdated && (
            <p className="mt-6 text-sm text-slate-400">
              Last synced: {lastUpdated.toLocaleString()}
            </p>
          )}
          
          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 mx-auto text-purple-400" />
          </div>
        </div>
      </section>
{/*

      {error && (
        <div className="container mx-auto max-w-4xl px-6 mb-8">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-semibold">GitHub API Issue</p>
              <p className="text-yellow-200/80 text-sm mt-1">{error}</p>
              <p className="text-yellow-200/60 text-xs mt-2">Showing fallback projects. This usually happens due to rate limiting. Try refreshing in a minute.</p>
            </div>
          </div>
        </div>
      )}
*/}
      {/* Skills Section */}
      <section className="py-20 px-6 bg-slate-800/30" id="skills">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Skills & Technologies
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">AI & Machine Learning</h3>
              <div className="flex flex-wrap gap-2">
                {skills.aiml.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-500/20 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all">
              <h3 className="text-2xl font-semibold mb-4 text-pink-400">Automation & AI Agents</h3>
              <div className="flex flex-wrap gap-2">
                {skills.automation.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-pink-500/20 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <h3 className="text-2xl font-semibold mb-4 text-blue-400">Full-Stack Development</h3>
              <div className="flex flex-wrap gap-2">
                {skills.fullstack.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-500/20 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all">
              <h3 className="text-2xl font-semibold mb-4 text-green-400">DevOps & Cloud</h3>
              <div className="flex flex-wrap gap-2">
                {skills.devops.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-500/20 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-6" id="projects">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
            <h2 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Featured Projects
              </span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Github className="w-4 h-4" />
              <span>Auto-synced from GitHub</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['all', 'aiml', 'automation', 'fullstack', 'other'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 text-xs opacity-70">
                  ({tab === 'all' ? projects.length : projects.filter(p => p.category === tab).length})
                </span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto animate-spin text-purple-400 mb-4" />
              <p className="text-slate-400">Syncing with GitHub...</p>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProjects.map((project, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-semibold text-purple-300 flex-1">{project.title}</h3>
                    {!project.custom && (
                      <div className="flex gap-3 text-sm text-slate-400 ml-2">
                        {project.stars > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {project.stars}
                          </div>
                        )}
                        {project.forks > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" />
                            {project.forks}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-300 mb-4">{project.description}</p>
                  
                  {project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {project.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm">
                        <Github className="w-4 h-4" />
                        View Code
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {project.homepage && (
                      <a href={project.homepage} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>

          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                    {exp.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div>
                        <h3 className="text-xl font-semibold text-purple-300">{exp.title}</h3>
                        <p className="text-slate-400">{exp.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-pink-500/20 rounded-full text-sm text-pink-300">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-slate-300">{exp.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Services I Offer
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">AI & ML Solutions</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Custom NLP models</li>
                <li>• LLM integration</li>
                <li>• AI chatbots</li>
                <li>• Text summarization</li>
                <li>• Computer vision</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-pink-300">Automation & AI Agents</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• n8n workflow automation</li>
                <li>• AI agent development</li>
                <li>• API integrations</li>
                <li>• Business process automation</li>
                <li>• Data pipeline creation</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Full-Stack Development</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Web applications</li>
                <li>• E-commerce platforms</li>
                <li>• RESTful APIs</li>
                <li>• Database design</li>
                <li>• Cloud deployment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-slate-800/30" id="contact">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let's Work Together
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Available for freelance projects and consulting. Let's build something amazing!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <a href="mailto:maryamkhalidgrw@gmail.com" 
               className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
              Email Me
            </a>
            <a href="https://linkedin.com/in/maryam-khalid-fast-nuces" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 rounded-lg font-semibold hover:bg-slate-700 transition-colors border border-purple-500/30">
              <Linkedin className="w-5 h-5" />
              Connect on LinkedIn
            </a>
          </div>

          <div className="flex justify-center gap-6 text-slate-400">
            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer"
               className="hover:text-purple-400 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com/in/maryam-khalid-fast-nuces" target="_blank" rel="noopener noreferrer"
               className="hover:text-purple-400 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="https://www.upwork.com/freelancers/~010e383ce3ced1200e" target="_blank" rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
              title="Hire me on Upwork">
              <BriefcaseBusiness className="w-6 h-6" />
            </a>
            <a href="https://twitter.com/maryamk07994353" target="_blank" rel="noopener noreferrer"
               className="hover:text-purple-400 transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://discord.com/users/maryam_590" target="_blank" rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
              title="Discord: maryam_590">
              <MessageCircle className="w-6 h-6" />
            </a>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-purple-500/20">
        <div className="container mx-auto text-center text-slate-400">
          <p>© 2024 Maryam Khalid. All rights reserved.</p>
          <p className="text-sm mt-2">Built with React & Tailwind CSS • Auto-synced with GitHub</p>
        </div>
      </footer>
    </div>
  );
}
