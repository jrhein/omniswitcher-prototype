import { useState, useRef, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, X, User, Hash, File, MessageSquare } from 'react-feather';

// Custom Sparkle Icon component
const SparkleIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" fill={color} />
  </svg>
);

// Types
type SearchResultType = 'channel' | 'user' | 'message' | 'file' | 'ai_suggestion' | 'suggestion' | 'recent';

interface SearchResult {
  type: SearchResultType;
  icon?: React.ReactNode;
  content: string;
  subtext?: string;
  highlights?: { start: number; end: number }[];
}

interface SearchContainerProps {
  $isOpen: boolean;
}

interface SearchHeaderProps {
  $isOpen: boolean;
}

interface ToggleBackgroundProps {
  $isAI: boolean;
}

interface HighlightedTextProps {
  text: string;
  highlights: { start: number; end: number }[];
}

interface SearchInputProps {
  $isOpen: boolean;
}

// Natural language detection patterns
const NL_PATTERNS = {
  QUESTIONS: /^(what|where|when|why|who|how|can|could|would|will|should|is|are|do|does|did|has|have|had)/i,
  COMMANDS: /^(find|search|show|tell|help|get|create|make|write|draft|analyze|explain|suggest)/i,
  PRONOUNS: /\b(me|my|i|we|our|us|you|your)\b/i,
  ARTICLES: /\b(a|an|the)\b/i,
  PREPOSITIONS: /\b(in|on|at|to|for|with|by|about|between|among|through|over|under|during|before|after)\b/i
};

// Styled Components
const SearchContainer = styled.div<SearchContainerProps>`
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  background: ${props => props.$isOpen ? '#fff' : 'transparent'};
  border-radius: 8px;
  box-shadow: ${props => props.$isOpen ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'};
  font-family: 'Lato', sans-serif;
`;

const SearchHeader = styled.div<SearchHeaderProps>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: ${props => props.$isOpen ? '1px solid #e8e8e8' : 'none'};
`;

const ModeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  position: absolute;
  left: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(97, 31, 105, 0.1);
  }
`;

const IconWrapper = styled(motion.div)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${props => props.$isActive ? '#611f69' : 'transparent'};
  color: ${props => props.$isActive ? '#fff' : '#616061'};
`;

const ResultIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #616061;
  flex-shrink: 0;
`;

const ToggleContainer = styled(motion.div)`
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 2px;
  cursor: pointer;
  width: 64px;
  height: 32px;
  user-select: none;
`;

const ToggleBackground = styled(motion.div)<ToggleBackgroundProps>`
  position: absolute;
  width: 30px;
  height: 28px;
  background: ${props => props.$isAI ? '#611f69' : '#ffffff'};
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const IconContainer = styled(motion.div)`
  position: absolute;
  left: 12px; /* Move initial magnifying glass right */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #616061;
`;

const ToggleIconContainer = styled.div`
  position: relative;
  width: 30px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &:first-child {
    margin-right: 2px;
  }
`;

const SearchInput = styled.div<SearchInputProps>`
  display: flex;
  align-items: center;
  flex: 1;
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  padding-left: ${props => props.$isOpen ? '76px' : '40px'}; /* Adjust closed state padding for new icon position */
  position: relative;
  transition: padding 0.2s ease;

  &:focus-within {
    outline: none;
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  padding: 0;
  color: #1d1c1d;
  font-family: 'Lato', sans-serif;
  
  &::placeholder {
    color: #616061;
  }

  &:focus {
    outline: none;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  margin-left: 8px;
  cursor: pointer;
  color: #616061;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #1d1c1d;
  }
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  top: -40px;
  right: 0;
  background: #1d1c1d;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;

  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: 20px;
    width: 8px;
    height: 8px;
    background: #1d1c1d;
    transform: rotate(45deg);
  }
`;

const ResultsContainer = styled(motion.div)`
  padding: 12px 0;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Lato', sans-serif;
`;

const AIQueryEcho = styled.div`
  padding: 16px;
  margin: 8px 16px;
  background: #f8f8f8;
  border-radius: 8px;
  font-size: 15px;
  color: #1d1c1d;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const AIIcon = styled.div`
  color: #611f69;
  margin-top: 2px;
`;

const AIContent = styled.div`
  flex: 1;
  line-height: 1.4;
`;

const AIResponse = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e8e8e8;
  color: #616061;
  font-style: italic;
`;

const HighlightedText = ({ text, highlights }: HighlightedTextProps) => {
  if (!highlights || highlights.length === 0) return <>{text}</>;

  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  highlights.forEach(({ start, end }, i) => {
    // Add non-highlighted text
    if (start > lastIndex) {
      parts.push(<span key={`text-${i}`}>{text.slice(lastIndex, start)}</span>);
    }
    // Add highlighted text
    parts.push(
      <mark key={`highlight-${i}`} style={{ backgroundColor: '#fff7c6', padding: 0 }}>
        {text.slice(start, end)}
      </mark>
    );
    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
};

const SectionTitle = styled.div`
  padding: 0 16px 8px;
  font-size: 13px;
  font-weight: 700;
  color: #1d1c1d;
`;

const ResultItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  
  &:hover {
    background: #f8f8f8;
  }
`;

const ResultContent = styled.div`
  flex: 1;
  min-width: 0; /* Enable text truncation */
`;

const ResultTitle = styled.div`
  font-size: 14px;
  color: #1d1c1d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Lato', sans-serif;
`;

const ResultSubtext = styled.div`
  font-size: 13px;
  color: #616061;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Lato', sans-serif;
`;

const ModeIndicator = styled.div<{ $isAI: boolean }>`
  position: absolute;
  top: -24px;
  right: 0;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.$isAI ? '#611f69' : '#1d1c1d'};
  color: white;
  opacity: 0.8;
`;

const SuggestionCategory = styled.div`
  padding: 12px 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #616061;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Lato', sans-serif;
`;

const SearchBar = () => {
  const [query, setQuery] = useState<string>('');
  const [isAIMode, setIsAIMode] = useState(false); // Default to traditional search
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipText, setTooltipText] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to detect if text is likely natural language
  const isNaturalLanguage = (text: string): boolean => {
    if (!text.trim()) return false;
    
    // Count matches for different patterns
    const patterns = Object.values(NL_PATTERNS);
    const matchCount = patterns.reduce((count, pattern) => 
      count + (pattern.test(text) ? 1 : 0), 0
    );

    // Check for specific patterns that strongly indicate natural language
    const isQuestion = NL_PATTERNS.QUESTIONS.test(text);
    const isCommand = NL_PATTERNS.COMMANDS.test(text);
    const hasPronouns = NL_PATTERNS.PRONOUNS.test(text);
    
    // Word count and length checks
    const words = text.trim().split(/\s+/);
    const isLongEnough = words.length >= 3;
    
    // Scoring system
    if (isQuestion || isCommand) return true;
    if (hasPronouns && matchCount >= 2) return true;
    if (isLongEnough && matchCount >= 3) return true;
    
    // Default to keyword search for short queries
    return false;
  };

  // Simulated search results
  const getSearchResults = (query: string): SearchResult[] => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    let results: SearchResult[] = [];

    if (isAIMode) {
      // AI mode results
      if (query.length > 2) {
        results = [
          {
            type: 'ai_suggestion',
            content: 'Based on recent messages and documents:',
            subtext: `Here's what I found about "${query}"...`,
          },
          {
            type: 'message',
            icon: <MessageSquare size={16} />,
            content: 'Related message from #general',
            subtext: 'The Q2 budget deadline is March 31st, as mentioned in the all-hands...',
            highlights: [{ start: 4, end: 15 }],
          },
        ];
      }
    } else {
      // Traditional search results
      results = [
        {
          type: 'channel' as const,
          icon: <Hash size={16} />,
          content: '#budget-2024',
          highlights: [{ start: 1, end: 7 }],
        },
        {
          type: 'user',
          icon: <User size={16} />,
          content: 'Budget Admin',
          highlights: [{ start: 0, end: 6 }],
        },
        {
          type: 'message',
          icon: <MessageSquare size={16} />,
          content: 'Q2 budget planning meeting notes',
          subtext: 'in #finance-team',
          highlights: [{ start: 3, end: 9 }],
        },
        {
          type: 'file',
          icon: <File size={16} />,
          content: 'Q2_Budget_Template.xlsx',
          subtext: 'Shared in #finance-team',
          highlights: [{ start: 3, end: 9 }],
        },
      ].filter(result => 
        result.content.toLowerCase().includes(lowerQuery) ||
        (result.subtext && result.subtext.toLowerCase().includes(lowerQuery))
      );
    }

    return results;
  };

  // Simulated search results with typeahead
  const getTypeaheadResults = (query: string): SearchResult[] => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    const results = [
      // Channels
      {
        type: 'channel' as const,
        icon: <Hash size={16} />,
        content: '#engineering',
        subtext: '843 members',
        highlights: query ? [{ start: 1, end: 1 + query.length }] : [],
      },
      {
        type: 'channel' as const,
        icon: <Hash size={16} />,
        content: '#design-team',
        subtext: '156 members',
        highlights: query ? [{ start: 1, end: 1 + query.length }] : [],
      },
      {
        type: 'channel' as const,
        icon: <Hash size={16} />,
        content: '#product',
        subtext: '392 members',
        highlights: query ? [{ start: 1, end: 1 + query.length }] : [],
      },
      {
        type: 'channel' as const,
        icon: <Hash size={16} />,
        content: '#random',
        subtext: '1,024 members',
        highlights: query ? [{ start: 1, end: 1 + query.length }] : [],
      },
      // Direct Messages
      {
        type: 'user' as const,
        icon: <User size={16} />,
        content: 'Sarah Parker',
        subtext: 'Software Engineer • Online',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'user' as const,
        icon: <User size={16} />,
        content: 'Alex Thompson',
        subtext: 'Product Manager • Away',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'user' as const,
        icon: <User size={16} />,
        content: 'Maria Garcia',
        subtext: 'Design Lead • In a meeting',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      // Recent Messages
      {
        type: 'message' as const,
        icon: <MessageSquare size={16} />,
        content: 'Updated the design system documentation with new component guidelines',
        subtext: 'in #design-team • 2h ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'message' as const,
        icon: <MessageSquare size={16} />,
        content: 'Sprint planning meeting notes from yesterday',
        subtext: 'in #engineering • 1d ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'message' as const,
        icon: <MessageSquare size={16} />,
        content: 'Q4 roadmap discussion highlights',
        subtext: 'in #product • 2d ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      // Files
      {
        type: 'file' as const,
        icon: <File size={16} />,
        content: 'Design System Guidelines.pdf',
        subtext: 'Shared in #design-team • 3d ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'file' as const,
        icon: <File size={16} />,
        content: 'Q4_Product_Roadmap.xlsx',
        subtext: 'Shared in #product • 1w ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'file' as const,
        icon: <File size={16} />,
        content: 'Engineering_Architecture_Diagram.png',
        subtext: 'Shared in #engineering • 2w ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      },
      {
        type: 'file' as const,
        icon: <File size={16} />,
        content: 'Team_Offsite_Photos.zip',
        subtext: 'Shared in #random • 3w ago',
        highlights: query ? [{ start: 0, end: query.length }] : [],
      }
    ] satisfies SearchResult[];

    // Filter results based on query
    return results.filter(result => {
      const contentMatch = result.content.toLowerCase().includes(lowerQuery);
      const subtextMatch = result.subtext && result.subtext.toLowerCase().includes(lowerQuery);
      
      // Special handling for channel searches
      if (result.type === 'channel') {
        // Allow searching with or without the # prefix
        const channelName = result.content.substring(1).toLowerCase();
        return lowerQuery.startsWith('#') 
          ? result.content.toLowerCase().includes(lowerQuery)
          : channelName.includes(lowerQuery);
      }
      
      return contentMatch || subtextMatch;
    }).map((result): SearchResult => {
      // Update highlight positions based on actual match
      const newResult = { ...result };
      
      // Only set highlights for the first matching field
      if (result.content.toLowerCase().includes(lowerQuery)) {
        const matchIndex = result.content.toLowerCase().indexOf(lowerQuery);
        newResult.highlights = [{ start: matchIndex, end: matchIndex + lowerQuery.length }];
      } else if (result.subtext?.toLowerCase().includes(lowerQuery)) {
        const matchIndex = result.subtext.toLowerCase().indexOf(lowerQuery);
        newResult.highlights = [{ start: matchIndex, end: matchIndex + lowerQuery.length }];
      } else {
        newResult.highlights = [];
      }

      return newResult;
    });
  };

  // Handle query changes and mode detection
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Only attempt mode detection if there's actual input
    if (newQuery.trim()) {
      const shouldBeAIMode = isNaturalLanguage(newQuery);
      
      // Only switch modes if it's different from current mode
      if (shouldBeAIMode !== isAIMode) {
        setIsAIMode(shouldBeAIMode);
        setTooltipText(shouldBeAIMode 
          ? 'Switched to AI mode for better results' 
          : 'Switched to traditional search');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    }
  };

  const suggestions: SearchResult[] = [
    {
      type: 'suggestion',
      icon: <SparkleIcon size={16} />,
      content: 'Help me make the most of my day',
    },
    {
      type: 'suggestion',
      icon: <SparkleIcon size={16} />,
      content: '@Sales Coach Prep me for my Greenleaf Intro call in 1 hour',
    },
    {
      type: 'suggestion',
      icon: <SparkleIcon size={16} />,
      content: 'Draft an out of office plan for my upcoming PTO',
    },
  ];

  const recentItems: SearchResult[] = [
    {
      type: 'recent',
      icon: <Clock size={16} />,
      content: 'Design Moves',
    },
    {
      type: 'recent',
      icon: <Clock size={16} />,
      content: 'Where is the Acme org chart?',
    },
    {
      type: 'recent',
      icon: <Clock size={16} />,
      content: 'Project Gizmo PRD',
    },
    {
      type: 'recent',
      icon: <Clock size={16} />,
      content: 'Reorg announcements',
    },
  ];

  // Personalized suggestions based on user role (Engineering)
  const recommendedQueries: SearchResult[] = [
    {
      type: 'suggestion' as const,
      icon: <SparkleIcon size={16} />,
      content: 'Show me recent API discussions',
      subtext: 'Find recent messages about APIs across channels',
    },
    {
      type: 'suggestion' as const,
      icon: <SparkleIcon size={16} />,
      content: 'Summarize sprint planning decisions',
      subtext: 'Get key points from recent planning meetings',
    },
    {
      type: 'suggestion' as const,
      icon: <SparkleIcon size={16} />,
      content: 'Find code review feedback',
      subtext: 'Collect recent code review comments',
    },
  ];

  const recentSearches: SearchResult[] = [
    {
      type: 'recent' as const,
      icon: <Clock size={16} />,
      content: '"deployment issues"',
      subtext: 'in #engineering • 2h ago',
    },
    {
      type: 'recent' as const,
      icon: <Clock size={16} />,
      content: 'from:sarah standup updates',
      subtext: 'in #team-updates • 1d ago',
    },
    {
      type: 'recent' as const,
      icon: <Clock size={16} />,
      content: 'has:link documentation',
      subtext: 'in #engineering-docs • 3d ago',
    },
    {
      type: 'recent' as const,
      icon: <Clock size={16} />,
      content: 'before:2024-01-01 roadmap',
      subtext: 'in #product • 1w ago',
    },
  ];

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  const handleModeToggle = () => {
    setIsAIMode(!isAIMode);
    setTooltipText(!isAIMode 
      ? 'Switched to AI mode for better results' 
      : 'Switched to traditional search');
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
    // Maintain focus after mode toggle
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <SearchContainer $isOpen={isOpen}>
      {showTooltip && (
        <Tooltip
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {tooltipText}
        </Tooltip>
      )}
      <SearchHeader $isOpen={isOpen}>
        <SearchInput $isOpen={isOpen}>
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <IconContainer
                key="search-icon"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Search size={16} />
              </IconContainer>
            ) : (
              <ToggleContainer
                key="toggle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={handleModeToggle}
                role="button"
                aria-label={`Switch to ${isAIMode ? 'traditional' : 'AI'} search mode`}
              >
                <ToggleBackground
                  $isAI={isAIMode}
                  initial={false}
                  animate={{
                    x: isAIMode ? 32 : 2,
                    backgroundColor: isAIMode ? '#611f69' : '#ffffff'
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
                <ToggleIconContainer>
                  <Search 
                    size={16} 
                    color={!isAIMode ? '#1d1c1d' : '#616061'} 
                    style={{ transition: 'color 0.2s ease' }}
                  />
                </ToggleIconContainer>
                <ToggleIconContainer>
                  <SparkleIcon 
                    size={16} 
                    color={isAIMode ? '#ffffff' : '#616061'} 
                  />
                </ToggleIconContainer>
              </ToggleContainer>
            )}
          </AnimatePresence>
          <Input
            ref={inputRef}
            placeholder={isAIMode ? "Ask for anything" : "Search everywhere"}
            value={query}
            onChange={handleQueryChange}
            onFocus={handleInputFocus}
            aria-label="Search input"
            role="searchbox"
            aria-expanded={isOpen}
          />
        </SearchInput>
        {isOpen && (
          <CloseButton onClick={handleClose} aria-label="Close search">
            <X size={20} />
          </CloseButton>
        )}
      </SearchHeader>

      <AnimatePresence>
        {isOpen && !query && (
          <ResultsContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="listbox"
          >
            <SuggestionCategory>Recommended for you</SuggestionCategory>
            {recommendedQueries.map((item, index) => (
              <ResultItem
                key={`suggestion-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                role="option"
              >
                <ResultIconWrapper>{item.icon}</ResultIconWrapper>
                <ResultContent>
                  <ResultTitle>{item.content}</ResultTitle>
                  {item.subtext && <ResultSubtext>{item.subtext}</ResultSubtext>}
                </ResultContent>
              </ResultItem>
            ))}

            <SuggestionCategory>Recent Searches</SuggestionCategory>
            {recentSearches.map((item, index) => (
              <ResultItem
                key={`recent-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (recommendedQueries.length + index) * 0.05 }}
                role="option"
              >
                <ResultIconWrapper>{item.icon}</ResultIconWrapper>
                <ResultContent>
                  <ResultTitle>{item.content}</ResultTitle>
                  {item.subtext && <ResultSubtext>{item.subtext}</ResultSubtext>}
                </ResultContent>
              </ResultItem>
            ))}
          </ResultsContainer>
        )}

        {isOpen && query && (
          <ResultsContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="listbox"
          >
            {isAIMode ? (
              <AIQueryEcho>
                <AIIcon>
                  <SparkleIcon size={16} />
                </AIIcon>
                <AIContent>
                  {query}
                </AIContent>
              </AIQueryEcho>
            ) : (
              // Search Mode: Show typeahead results
              getTypeaheadResults(query).map((result, index) => (
                <ResultItem
                  key={`result-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  role="option"
                >
                  <ResultIconWrapper>{result.icon}</ResultIconWrapper>
                  <ResultContent>
                    <ResultTitle>
                      <HighlightedText 
                        text={result.content}
                        highlights={result.highlights || []}
                      />
                    </ResultTitle>
                    {result.subtext && (
                      <ResultSubtext>
                        <HighlightedText 
                          text={result.subtext}
                          highlights={result.highlights || []}
                        />
                      </ResultSubtext>
                    )}
                  </ResultContent>
                </ResultItem>
              ))
            )}
          </ResultsContainer>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default SearchBar;
