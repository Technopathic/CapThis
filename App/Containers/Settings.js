// @flow

import React from 'react'
import { ScrollView, StatusBar, Linking, AsyncStorage, View, Image, Switch, Dimensions, TouchableOpacity } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Header, Content, List, ListItem, Text, Button, Right, Left, Body, Toast, Spinner } from 'native-base'
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import Styles from './Styles/ProfileStyle'

class Settings extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     user: "",
     token: "",
     notiVote:null,
     notiReply:null,
     notiBounce:null,
     notiMention:null,
     profPrivate:null,
     isLoading:true,
     showToast:false
   };
 };

 showToast = (text) => {
   Toast.show({
    text: text,
    position: 'bottom',
    buttonText:'OK',
    duration:3000
   });
 };

 async componentWillMount() {
   await AsyncStorage.multiGet(["token", "user"], (err, stores) => {
    stores.map((result, i, store) => {
      this.setState({
        token: store[0][1],
        user: JSON.parse(store[1][1])
      });
    });
  })
  .then(() => {
     this.getSettings();
   })
 };

  getSettings = () => {
    fetch('http://capthis.technopathic.me/api/getSettings/?token='+this.state.token, {
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    })
    .then(function(response) {
     return response.json()
    })
    .catch((error) => console.warn("fetch error:", error))
    .then(function(json) {
     if(json.error === "token_not_provided")
     {
        //NavigationActions.signin();
     }
     else {
       this.setState({
         notiVote:json.notiVote,
         notiReply:json.notiReply,
         notiBounce:json.notiReply,
         notiMention:json.notiMention,
         profPrivate:json.profPrivate,
         isLoading:false
       })
     }
    }.bind(this))
  };

  updateSettings = () => {
    var _this = this;

    var data = new FormData();
    data.append('notiVote', this.state.notiVote);
    data.append('notiReply', this.state.notiReply);
    data.append('notiBounce', this.state.notiBounce);
    data.append('notiMention', this.state.notiMention);
    data.append('profPrivate', this.state.profPrivate);

    fetch('http://capthis.technopathic.me/api/updateSettings/?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      },
      body:data
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast(json.error);
      }
      else if(json.success) {
        _this.setState({
          disableSubmit:true
        })
        _this.showToast(json.success);
      }
    }.bind(this));
  };

  signOut = () => {
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("user");
    this.showToast('Good-Bye!.');
    NavigationActions.signin();
  };

  getWebsite = (url) => {
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };

  render () {

    const profileHead = {
      flex:1,
      flexDirection:'row',
      marginLeft:15,
      marginRight:15,
      marginTop:15,
      paddingBottom:15,
      borderBottomWidth:1,
      borderBottomColor:'#CCCCCC'
    };

    const profileRight = {
      flex:1,
      flexDirection:'column',
      justifyContent:'center',
    };

    const profileStats = {

    };

    const profileFollow = {
      flex:1,
      flexDirection:'row'
    };

    const followBox = {
      flex:1,
      flexDirection:'column',
      justifyContent:'center',
      alignItems:'center',
      paddingLeft:5,
      paddingRight:5,
      marginTop:5,
      marginLeft:10,
      marginRight:10,
      borderRadius:3,
    };

    const statNum = {
      color:'#333333',
      fontWeight:'bold',
      fontSize:20,
    };

    const statTitle = {
      color:'#444444',
      fontSize:10,
    };

    const profileButtons = {
      flex:1,
      flexDirection:'row',
      justifyContent:'center',
    };

    const avatarStyle = {
      height:100,
      width:100,
      borderRadius:5,
    };

    const textStyle = {
      fontSize:14,
      color:'#333333',
      marginTop:-3
    };

    const descBody = {
      fontSize:14,
      color:'#666666',
      marginTop:-3
    };

    const appBar = {
      backgroundColor:"#263238",
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      height:55,
      borderBottomWidth:1,
      borderBottomColor:'#ffbe39'
    };

    const titleStyle = {
      textAlign:"center",
      fontSize:28,
      color:"#EEEEEE",
      maxWidth:200,
      fontFamily:"Lobster-Regular"
    };

    const inputRow = {
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      borderBottomWidth:1,
      borderBottomColor:'#EEEEEE',
      paddingBottom:10
    };

    const inputRowTwo = {
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      borderBottomWidth:1,
      borderBottomColor:'#EEEEEE',
      paddingTop:10,
      paddingBottom:10
    };

    const settingTitle = {
      fontSize:16,
      color:'#444444',
      fontFamily:'Lato-Regular'
    };

    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    };

    if (this.state.isLoading) {
      return (
        <View style={spinnerStyle}>
          <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
          <Spinner color='#ffbe39'/>
        </View>
      )
    }
    else {
      return (
        <ScrollView>
          <Header style={appBar}>
            <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
            <Left>
              <Button transparent onPress={() => NavigationActions.pop()}>
                <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
              </Button>
            </Left>
            <Body>
              <Text style={titleStyle}>Settings</Text>
            </Body>
          </Header>
          <Content>
            <List>
              <ListItem style={inputRow}>
                <Text style={settingTitle}>Show Notifcations on Votes</Text>
                <Switch onValueChange={(value) => this.setState({notiVote: value}, function(){this.updateSettings();}) } value={this.state.notiVote} />
              </ListItem>
              <ListItem style={inputRowTwo}>
                <Text style={settingTitle}>Show Notifcations on Replies</Text>
                <Switch onValueChange={(value) => this.setState({notiReply: value}, function(){this.updateSettings();}) } value={this.state.notiReply} />
              </ListItem>
              <ListItem style={inputRowTwo}>
                <Text style={settingTitle}>Show Notifcations on Mentions</Text>
                <Switch onValueChange={(value) => this.setState({notiMention: value}, function(){this.updateSettings();}) } value={this.state.notiMention} />
              </ListItem>
              <ListItem style={inputRowTwo}>
                <Text style={settingTitle}>Private Profile</Text>
                <Switch onValueChange={(value) => this.setState({profPrivate: value}, function(){this.updateSettings();}) } value={this.state.profPrivate} />
              </ListItem>
            </List>
            <List>
              <ListItem style={inputRowTwo} onPress={() => this.getWebsite('http://capthis.technopathic.me')}>
                <Text style={settingTitle}>Website</Text>
              </ListItem>
              <ListItem style={inputRowTwo} onPress={() => this.getWebsite('http://capthis.technopathic.me/capthis-privacy.html')}>
                <Text style={settingTitle}>Privacy Policy</Text>
              </ListItem>
              <ListItem style={inputRowTwo} onPress={() => this.getWebsite('http://capthis.technopathic.me/capthis-tos.html')}>
                <Text style={settingTitle}>Terms of Service</Text>
              </ListItem>
              <ListItem style={inputRowTwo} onPress={() => this.signOut()}>
                <Text style={settingTitle}>Log Out</Text>
              </ListItem>
            </List>
          </Content>
        </ScrollView>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default Settings
