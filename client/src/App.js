import React from 'react'
import Login from './login.js'
import NewUser from './newUser.js'
import Conversations from './conversations.js'
import Chat from './chat.js'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.scss'



function App() {


  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login">
            <Login/>
          </Route>

          <Route path="/newUser">
            <NewUser/>
          </Route>

          <Route path="/chat">
            <Chat/>
          </Route>

          <Route path="/Conversations">
            <Conversations/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}


export default App;
