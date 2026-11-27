import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Quiz, { QuizIntro } from './pages/Quiz';
import Countries from './pages/Countries';
import Result from './pages/Result';
import Destinations from './pages/Destinations';
import Prepare from './pages/Prepare';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Explore from './pages/Explore';
import Place from './pages/Place';
import Destination from './pages/Destination';
import Event from './pages/Event';
import Community from './pages/Community';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Saved from './pages/Saved';
import Network from './pages/Network';
import Settings from './pages/Settings';
import Trips from './pages/Trips';
import Trip from './pages/Trip';
import TripSaved from './pages/TripSaved';
import Create from './pages/Create';
import Vibi from './pages/Vibi';
import Proposal from './pages/Proposal';
import Modify from './pages/Modify';
import Transport from './pages/Transport';
import { ManualActivityForm, ManualAdd, ManualForm, ManualFree, ManualProgram } from './pages/Manual';
import Upcoming from './pages/Upcoming';
import TripMap from './pages/TripMap';
import { Bookings, Flight, ReminderDone, ReminderForm } from './pages/Bookings';
import { Leg, RouteCompare, RouteDetail } from './pages/Routes';
import Collaborate from './pages/Collaborate';
import { Carnet, CarnetPreview, CarnetVisibility, SouvenirForm } from './pages/Carnet';
import { ChooseTrip, PlanVisit } from './pages/PlanVisit';
import Soon from './pages/Soon';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/intro" element={<QuizIntro />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/result" element={<Result />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/prepare" element={<Prepare />} />
          <Route path="/home" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/place/:id" element={<Place />} />
          <Route path="/destination/rome" element={<Destination />} />
          <Route path="/event/:id" element={<Event />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/network" element={<Network />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trip" element={<Trip />} />
          <Route path="/upcoming/:id" element={<Upcoming />} />
          <Route path="/trip/map" element={<TripMap />} />
          <Route path="/trip/bookings" element={<Bookings />} />
          <Route path="/trip/flight" element={<Flight />} />
          <Route path="/trip/reminder" element={<ReminderForm />} />
          <Route path="/trip/reminder-done" element={<ReminderDone />} />
          <Route path="/trip/route" element={<RouteDetail />} />
          <Route path="/trip/compare" element={<RouteCompare />} />
          <Route path="/trip/collaborate" element={<Collaborate />} />
          <Route path="/leg" element={<Leg />} />
          <Route path="/carnet" element={<Carnet />} />
          <Route path="/carnet/new" element={<SouvenirForm />} />
          <Route path="/carnet/edit/:id" element={<SouvenirForm />} />
          <Route path="/carnet/preview" element={<CarnetPreview />} />
          <Route path="/carnet/visibility" element={<CarnetVisibility />} />
          <Route path="/plan" element={<ChooseTrip />} />
          <Route path="/plan/visit" element={<PlanVisit />} />
          <Route path="/trip-saved" element={<TripSaved />} />
          <Route path="/create" element={<Create />} />
          <Route path="/create/vibi" element={<Vibi mode="create" />} />
          <Route path="/vibi" element={<Vibi mode="chat" />} />
          <Route path="/proposal" element={<Proposal />} />
          <Route path="/modify" element={<Modify />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/manual" element={<ManualForm />} />
          <Route path="/manual/program" element={<ManualProgram />} />
          <Route path="/manual/add" element={<ManualAdd />} />
          <Route path="/manual/form" element={<ManualActivityForm />} />
          <Route path="/manual/free" element={<ManualFree />} />
          <Route path="/soon" element={<Soon />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
