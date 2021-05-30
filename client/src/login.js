import React from 'react'
import history from './history'


class Login extends React.Component{
  constructor(props){
    super(props);
    this.state = {}
    this.newUser = this.newUser.bind(this)
  }


  newUser(){
    history.push('/newUser')
    window.location.reload();
  }


  render(){
    return(
      <div id='main'>
        <form action='/api/login' method='post'>
          <input id='username' class='field' type='text' name='username' placeholder='Username' required/>
          <br/>
          <input id='password' class='field' type='password' name='password' placeholder='Password' required/>
          <br/>
          <input type='submit' class='button' value='Login' onClick={this.login}/>
          <br/>
        </form>
        <button class='button' onClick={this.newUser}>Create new user</button>
        <p>For example, try:</p>
        <p>Username: Lando, Password: password</p>
      </div>
    )
  }
}

export default Login;
