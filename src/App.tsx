import SearchBar from './components/SearchBar';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 60px;
`;

const App = () => {
  return (
    <AppContainer>
      <SearchBar />
    </AppContainer>
  );
};

export default App; 