import React from 'react'
import history from './history'


class Conversations extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      user: undefined,
      conversations: [],
      startNewChat: false,
      delete: false
    }
    this.chat = this.chat.bind(this)
    this.newChat = this.newChat.bind(this)
    this.closeNewChat = this.closeNewChat.bind(this)
    this.showDelete = this.showDelete.bind(this)
    this.delete = this.delete.bind(this)
    this.logout = this.logout.bind(this)
  }


  componentDidMount(){
    //gets username from url
    var address = window.location.href
    var user
    for(let i = 0; i < address.length; i++){
      if(address[i] === 'r' && address[i + 1] === '='){
        user = address.substring(i + 2)
      }
    }

    this.setState((state) => ({
      user: user
    }))

    fetch("/api/findConvos/?user=" + user)
      .then(res => res.json())
      .then(json => {
        var data = json
        var conversations = data.conversations
        this.setState((state) => ({
          conversations: conversations
        }))
      }
    )
  }

  chat = (i) => () => {
    let convo = '/chat?user=' + this.state.user + '&recipient=' + i
    history.push(convo)
    window.location.reload();
  }

  showDelete(){
    if(this.state.delete === false){
      this.setState({
        delete: true
      })
    } else {
      this.setState({
        delete: false
      })
    }
  }

  newChat(){
    this.setState({
      startNewChat: true
    })
  }

  closeNewChat(){
    this.setState({
      startNewChat: false
    })
  }


  delete = (i) => () => {

    var username1, username2

    if(this.state.user < i){
      username1 = this.state.user
      username2 = i
    } else {
      username1 = i
      username2 = this.state.user
    }

    var url = '/api/deleteConversation/?username1=' + username1 + '&username2=' + username2
    return fetch(url, {
      method: 'DELETE'
    }).then(res => res.json())
  }

  logout(){
    history.push('/login')
    window.location.reload();
  }

  render(){
    var arrow = '\u2190'
    if(!this.state.delete){
      if(!this.state.startNewChat){
        return(
          <div id='container'>
            <div id='newConversation' class='chatPartner' onClick={this.newChat}>Create New Chat +</div>
            <div class='logout' id='arrow' onClick={this.logout}>{arrow}</div>
            {
              this.state.conversations.map((i, index) => {
                return(
                  <div>
                    <div class='chatPartner' onClick={this.chat(i)}>{i}</div>
                  </div>
                )
              })
            }
            <button class='chatPartnerDelete' onClick={this.showDelete}>Delete</button>
          </div>
        )
      } else {
        return(
          <div>
            <button id='arrow' onClick={this.closeNewChat}>{arrow}</button>
            <form action='/api/newConvoPartner' method='post'>
              <input id='convoPartner' type='text' name='convoPartner' placeholder='To' required/>
              <input id='user' type='hidden' name='user' value={this.state.user}/>
              <input id='newChat' type='submit' value='Create New Chat +'/>
            </form>
          </div>
        )
      }
    } else {
      return(
        <div id='container'>
          <div id='newConversation' class='chatPartner' onClick={this.newChat}>Create New Chat +</div>
          {
            this.state.conversations.map((i, index) => {
              return(
                <div>
                  <div class='chatPartnerDelete' onClick={this.delete(i)}>{i}</div>
                </div>
              )
            })
          }
          <button class='chatPartner' onClick={this.showDelete}>Cancel</button>
        </div>
      )
    }
  }
}

export default Conversations;
