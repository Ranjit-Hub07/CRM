import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Employees from './pages/Employees';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/team" element={<Team />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
