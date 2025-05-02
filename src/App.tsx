import './App.css';
import { Outlet, Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
