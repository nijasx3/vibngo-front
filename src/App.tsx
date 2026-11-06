import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Signup from './pages/Signup';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Place from './pages/Place';
import Destination from './pages/Destination';
import Create from './pages/Create';
import Itinerary from './pages/Itinerary';
import Notebook from './pages/Notebook';
import Chat from './pages/Chat';
import Reset from './pages/Reset';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/reset" element={<Reset />} />
        <Route element={<Layout />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/place/:id" element={<Place />} />
          <Route path="/destination/rome" element={<Destination />} />
          <Route path="/create" element={<Create />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/notebook" element={<Notebook />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
