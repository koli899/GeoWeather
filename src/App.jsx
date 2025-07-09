import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './component/Home';
import Getgraph from './component/Get_graph';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/details" element={<Getgraph />} />
      </Routes>
    </Router>
  );
}

export default App;
