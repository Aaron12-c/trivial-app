
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const handleBegin = () => {
    // eslint-disable-next-line no-console
    console.warn('Starting trivia game...');
  };

  return (
    <div>
     
      <main>
        <WelcomeScreen onBegin={handleBegin} />
      </main>
    </div>
  );
}

export default App;