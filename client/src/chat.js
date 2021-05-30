import React from 'react'
import history from './history'


class Chat extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      sender: undefined,
      recipient: undefined,
      messages:[]
    }
    this.back = this.back.bind(this)
  }

  //searchs the url for the sender and recipient
  componentDidMount(){
    var address = window.location.href
    var sender, recipient
    for(var i = 0; i < address.length; i++){
      if(address[i] === 'r' && address[i + 1] === '='){
        break
      }
    }
    for(var j = i; j < address.length; j++){
      if(address[j] === '&'){
        sender = address.substring(i + 2, j)
        break
      }
    }
    recipient = address.substring(j + 11)

    this.setState({
      sender: sender,
      recipient: recipient
    })

    //fetches the chat
    fetch("/api/findChats/?user=" + sender + '&recipient=' + recipient)
      .then(res => res.json())
      .then(json => {
        var data = json
        var chats = data.messages
        this.setState((state) => ({
          messages: chats
        }))
      }
    )
  }

  back(){
    history.push('/conversations/?user=' + this.state.sender)
    window.location.reload();
  }


  render(){
    var messages = this.state.messages
    var arrow = '\u2190'
    return(
      <div>
        <div id='recipientContainer'>
          <button id='back' onClick={this.back}>{arrow}</button>
          <p id='recipient'>{this.state.recipient}</p>
        </div>
        <div id='messageContainer'>
          {
            messages.map((i) => {
              if(i[1] === this.state.sender){
                return(
                  <div class='messageFloat'>
                    <ul class='senderMessage message'>{i[0]}</ul>
                  </div>
                )
              } else {
                return(
                  <div class ='messageFloat'>
                    <ul class='recipientMessage message'>{i[0]}</ul>
                  </div>
                )
              }
            })
          }
        </div>
        <form action='/api/newMessage' method='post'>
          <textarea id='newMessage' type='text' name='newMessage' placeholder='New Message' required/>
          <input id='sender' type='hidden' name='sender' value={this.state.sender}/>
          <input id='recipient' type='hidden' name='recipient' value={this.state.recipient}/>
          <input id='submitMessageButton' type='submit' value='Send Message'/>
        </form>
      </div>
    )
  }
}

export default Chat;
