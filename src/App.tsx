import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Transactions from './pages/Transactions';
import Alerts from './pages/Alerts';
import AttackTimeline from './pages/AttackTimeline';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/timeline" element={<AttackTimeline />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
