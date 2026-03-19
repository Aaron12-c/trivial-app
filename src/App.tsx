import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const handleBegin = () => {};

  return (
    <div>
      <Navbar />
      <main>
        <WelcomeScreen onBegin={handleBegin} />
      </main>
    </div>
  );
}

export default App;
