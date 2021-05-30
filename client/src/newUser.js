import React from 'react'
import history from './history'

class NewUser extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      error:''
    }
    this.checkPasswordAndUsername = this.checkPasswordAndUsername.bind(this)
    this.back = this.back.bind(this)
  }

  checkPasswordAndUsername(){
    /*
    let password1 = document.getElementById('password').value
    let password2 = document.getElementById('confirmPassword').value
    if(password1.length < 8){
      this.setState({
        error:'Password must be at least 8 characters long'
      })
    } else {
      if(password1 === password2){
        //Goes to login if everything checks out
        history.push('/login')
        window.location.reload();
      } else {
        this.setState({
          error:'Passwords do not match'
        })
      }
    }
    */
  }

  back(){
    history.push('/login')
    window.location.reload();
  }

  render(){
    var arrow = '\u2190'
    return(
      <div id='main'>
        <button id='arrow' onClick={this.back}>{arrow}</button>
        <form action='/api/newUser' method='post'>
          <input class='field' id='username' type='text' name='username' placeholder='Username' required/>
          <br/>
          <input class='field' id='password' type='password' name='password' placeholder='Password' required/>
          <br/>
          <input class='button' type='submit' value='Create new user' onClick={this.checkPasswordAndUsername}/>
          <p id='error'>{this.state.error}</p>
        </form>
      </div>
    )
  }
}

export default NewUser;
