import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Hompage from './Components/Homepage/hompage';
import Signin from './Components/Signin/signin';
import Signup from './Components/Signup/signup';

import UserProfile from './Components/User Profile/userProfile';
import Friends from './Components/Friends/friends';

import Group from './Components/Group Expenses/group';
import TrackMyExpenses from './Components/TrackMyExpenses/trackMyExpenses';
import TravelExpenses from './Components/Travel Expenses/travelExpenses';
import RecurringExpenses from './Components/Recurring Expenses/recurringExpenses';
import SavingGoals from './Components/Saving Goals/savingGoals';

function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Hompage/>}/>
          <Route path='/Signin' element={<Signin/>} />
          <Route path='/Signup' element={<Signup/>} />
          
          <Route path='/userProfile' element={<UserProfile/>} />
          <Route path='/friends' element={<Friends/>}/>
        
          <Route path='/trackMyExpenses' element={<TrackMyExpenses/>}/>
          <Route path='/groupExpenses' element={<Group/>}/>

          <Route path='/travelExpenses' element={<TravelExpenses/>} />
          <Route path='/recurringExpenses' element={<RecurringExpenses/>} />
          <Route path='/savingGoals' element={<SavingGoals/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
