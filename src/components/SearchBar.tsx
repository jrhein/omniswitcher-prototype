import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Clock, X } from 'react-feather';

// Types
interface SearchResult {
  type: 'suggestion' | 'recent';
  icon?: React.ReactNode;
  content: string;
  subtext?: string;
}

interface SearchContainerProps {
  $isOpen: boolean;
}

interface SearchHeaderProps {
  $isOpen: boolean;
}

// Styled Components
const SearchContainer = styled.div<SearchContainerProps>`
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  background: ${props => props.$isOpen ? '#fff' : 'transparent'};
  border-radius: 8px;
  box-shadow: ${props => props.$isOpen ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'};
`;

const SearchHeader = styled.div<SearchHeaderProps>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: ${props => props.$isOpen ? '1px solid #e8e8e8' : 'none'};
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 8px 12px;

  &:focus-within {
    border-color: #611f69;
    box-shadow: 0 0 0 4px rgba(97,31,105,0.1);
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  padding: 0 8px;
  color: #1d1c1d;
  
  &::placeholder {
    color: #616061;
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

const ResultsContainer = styled(motion.div)`
  padding: 12px 0;
`;

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

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #611f69;
`;

const ResultContent = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-size: 14px;
  color: #1d1c1d;
`;

const ResultSubtext = styled.div`
  font-size: 13px;
  color: #616061;
  margin-top: 2px;
`;

const SearchBar = () => {
  const [query, setQuery] = useState<string>('');
  const [isAIMode, setIsAIMode] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const suggestions: SearchResult[] = [
    {
      type: 'suggestion',
      icon: <Star size={16} />,
      content: 'Help me make the most of my day',
    },
    {
      type: 'suggestion',
      icon: <Star size={16} />,
      content: '@Sales Coach Prep me for my Greenleaf Intro call in 1 hour',
    },
    {
      type: 'suggestion',
      icon: <Star size={16} />,
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

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  const toggleMode = () => {
    setIsAIMode(!isAIMode);
  };

  return (
    <SearchContainer $isOpen={isOpen}>
      <SearchHeader $isOpen={isOpen}>
        <SearchInput>
          {isAIMode ? (
            <Star size={18} color="#611f69" />
          ) : (
            <Search size={18} color="#616061" />
          )}
          <Input
            placeholder={isAIMode ? "Ask for anything" : "Search everywhere"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
          />
        </SearchInput>
        {isOpen && (
          <CloseButton onClick={handleClose}>
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
          >
            <SectionTitle>Suggestions</SectionTitle>
            {suggestions.map((item, index) => (
              <ResultItem
                key={`suggestion-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                <ResultContent>
                  <ResultTitle>{item.content}</ResultTitle>
                  {item.subtext && <ResultSubtext>{item.subtext}</ResultSubtext>}
                </ResultContent>
              </ResultItem>
            ))}

            <SectionTitle style={{ marginTop: 16 }}>Recent</SectionTitle>
            {recentItems.map((item, index) => (
              <ResultItem
                key={`recent-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (suggestions.length + index) * 0.05 }}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                <ResultContent>
                  <ResultTitle>{item.content}</ResultTitle>
                  {item.subtext && <ResultSubtext>{item.subtext}</ResultSubtext>}
                </ResultContent>
              </ResultItem>
            ))}
          </ResultsContainer>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default SearchBar;
