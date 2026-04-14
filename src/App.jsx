import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComplaintProvider } from './context/ComplaintContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ViewComplaints from './pages/ViewComplaints';
import AdminPage from './pages/AdminPage';
import AiAnalytics from './pages/AiAnalytics';

function App() {
  return (
    <ComplaintProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/complaints" element={<ViewComplaints />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/analytics" element={<AiAnalytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ComplaintProvider>
  );
}

export default App;
