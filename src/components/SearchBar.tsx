import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare } from 'react-feather';

// Types
interface SearchResult {
  type: 'ai' | 'channel' | 'message' | 'file';
  content: string;
}

interface ToggleButtonProps {
  $isAIMode: boolean;  // Using $ prefix to avoid DOM attribute warning
}

// Styled Components
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  &:focus-within {
    border-color: #1264A3;
    box-shadow: 0 0 0 4px rgba(18,100,163,0.1);
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  padding: 0 8px;
`;

const ToggleButton = styled(motion.button)<ToggleButtonProps>`
  background: ${props => props.$isAIMode ? '#1264A3' : '#f8f8f8'};
  color: ${props => props.$isAIMode ? '#fff' : '#1d1c1d'};
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ResultsDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 400px;
  overflow-y: auto;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  top: -40px;
  right: 0;
  background: #1d1c1d;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
`;

const SearchBar = () => {
  const [query, setQuery] = useState<string>('');
  const [isAIMode, setIsAIMode] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const detectSearchMode = (input: string): boolean => {
    const questionPattern = /^(who|what|where|when|why|how)|.*\?$/i;
    return questionPattern.test(input);
  };

  useEffect(() => {
    if (query) {
      const shouldBeAIMode = detectSearchMode(query);
      if (shouldBeAIMode !== isAIMode) {
        setIsAIMode(shouldBeAIMode);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }
      
      // Simulate fetching results
      const mockResults: SearchResult[] = isAIMode ? 
        [{ type: 'ai', content: `AI-powered answer for: ${query}` }] :
        [
          { type: 'channel', content: '#general' },
          { type: 'message', content: 'Latest matching message' },
          { type: 'file', content: 'document.pdf' }
        ];
      setResults(mockResults);
    } else {
      setResults([]);
    }
  }, [query, isAIMode]);

  return (
    <SearchContainer>
      {showTooltip && (
        <Tooltip
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          Switched to {isAIMode ? 'AI Q&A' : 'Traditional'} mode
        </Tooltip>
      )}
      
      <SearchInput>
        <Search size={18} color="#1d1c1d" />
        <Input
          placeholder="Search messages, files, and more..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
        <ToggleButton
          $isAIMode={isAIMode}
          onClick={() => setIsAIMode(!isAIMode)}
          whileTap={{ scale: 0.95 }}
        >
          {isAIMode ? (
            <>
              <MessageSquare size={14} />
              AI
            </>
          ) : (
            'Traditional'
          )}
        </ToggleButton>
      </SearchInput>

      <AnimatePresence>
        {results.length > 0 && (
          <ResultsDropdown
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {results.map((result, index) => (
              <div key={index} style={{ padding: '8px 12px' }}>
                {result.content}
              </div>
            ))}
          </ResultsDropdown>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default SearchBar;
