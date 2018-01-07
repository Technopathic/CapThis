// @flow

import React from 'react'
import { View, StatusBar, ScrollView, Text, Image, AsyncStorage, Dimensions } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Content, Header, Button, Toast } from 'native-base';
import MyCon from 'react-native-vector-icons/MaterialCommunityIcons';

import { google, facebook, twitter } from 'react-native-simple-auth';

// Styles
import styles from './Styles/SignInStyle'

class SignIn extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     uuid:"",
     isLoading:true,
     showToast: false
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
    await AsyncStorage.getItem("uuid")
    .then((value) => {
      this.setState({
        uuid: value,
        isLoading:false
      });
    })
  };

  facebookSignIn = () => {
    var _this = this;
    facebook({
      appId: '',
      callback:'://authorize'
    }).then((info) => {
      fetch('http://capthis.technopathic.me/api/socialSignOn', {
        method: 'POST',
        body: JSON.stringify({
          token: info.credentials.access_token,
          provider:'Facebook',
          uuid:this.state.uuid
        })
      }).then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.error) {
          _this.showToast(json.error);
        }
        else if(json.token) {
          AsyncStorage.setItem('token', json.token);
          fetch('http://capthis.technopathic.me/api/authenticate/user?token='+ json.token, {
            headers: {
              "Authorization":"Bearer "+json.token
            }
          })
          .then(function(userResponse) {
            return userResponse.json();
          })
          .then(function(userJson) {
            _this.setState({disableSubmit:true});
            AsyncStorage.setItem('user', JSON.stringify(userJson.user));
            _this.showToast('Hey there, '+userJson.profile.profileName+"!");
            setTimeout(function(){NavigationActions.root()}, 3000);
          })
        }
      })
    }).catch((error) => {
      // error.code
      // error.description
    });
  };

  twitterSignIn = () => {
    var _this = this;
    twitter({
      appId: '',
      appSecret: '',
      callback: 'com.capthis://authorize',
    }).then((info) => {
      fetch('http://capthis.technopathic.me/api/socialSignOn', {
        method: 'POST',
        body: JSON.stringify({
          token: info.credentials.oauth_token,
          secret:info.credentials.oauth_token_secret,
          provider:'Twitter',
          uuid:this.state.uuid
        })
      }).then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.error) {
          _this.showToast(json.error);
        }
        else if(json.token) {
          AsyncStorage.setItem('token', json.token);
          fetch('http://capthis.technopathic.me/api/authenticate/user?token='+ json.token, {
            headers: {
              "Authorization":"Bearer "+json.token
            }
          })
          .then(function(userResponse) {
            return userResponse.json();
          })
          .then(function(userJson) {
            _this.setState({disableSubmit:true});
            AsyncStorage.setItem('user', JSON.stringify(userJson.user));
            _this.showToast('Hey there, '+userJson.profile.profileName+"!");
            setTimeout(function(){NavigationActions.root()}, 3000);
          })
        }
      })
    }).catch((error) => {
      // error.code
      // error.description
    });
  };

  googleSignIn = () => {
    var _this = this;
    google({
      appId: '',
      callback: 'com.capthis:/oauth2redirect',
    }).then((info) => {
      fetch('http://capthis.technopathic.me/api/socialSignOn', {
        method: 'POST',
        body: JSON.stringify({
          token: info.credentials.access_token,
          provider:'Google',
          uuid:this.state.uuid
        })
      }).then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.error) {
          _this.showToast(json.error);
        }
        else if(json.token) {
          AsyncStorage.setItem('token', json.token);
          fetch('http://capthis.technopathic.me/api/authenticate/user?token='+ json.token, {
            headers: {
              "Authorization":"Bearer "+json.token
            }
          })
          .then(function(userResponse) {
            return userResponse.json();
          })
          .then(function(userJson) {
            _this.setState({disableSubmit:true});
            AsyncStorage.setItem('user', JSON.stringify(userJson.user));
            _this.showToast('Hey there, '+userJson.profile.profileName+"!");
            setTimeout(function(){NavigationActions.root()}, 3000);
          })
        }
      })
    }).catch((error) => {
      // error.code
      // error.description
    });
  };

  render () {

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
      fontFamily:"Lobster-Regular"
    };

    const backgroundContainer = {
      flex:1,
      width:null,
      height:Dimensions.get('window').height,
      paddingTop:15,
      paddingBottom:15,
      backgroundColor:'#444444',
    };

    const logoContainer = {
      resizeMode: 'cover',
      width:150,
      height:150,
      alignSelf:'center',
    };

    const titleContainer = {
      alignSelf:'center',
      color:'#FFFFFF',
      fontSize:32,
      marginBottom:15,
      fontFamily:'Lobster-Regular'
    };

    const inputContainer = {
      backgroundColor:'rgba(0, 0, 0, 0.3)',
      padding:15,
      borderTopWidth:1,
      borderTopColor:'#888888',
      borderBottomWidth:1,
      borderBottomColor:'#888888'
    };

    const facebookButton = {
      backgroundColor:'#3b5998',
      marginTop:10,
      marginLeft:15,
      marginRight:15,
      elevation:0,
    };

    const twitterButton = {
      backgroundColor:'#1dcaff',
      marginTop:10,
      marginLeft:15,
      marginRight:15,
      elevation:0,
    };

    const googleButton = {
      backgroundColor:'#EA4335',
      marginTop:10,
      marginLeft:15,
      marginRight:15,
      elevation:0,
    };

    const resetText = {
      marginTop:15,
      alignSelf:'center',
      color:'#CCCCCC',
      fontSize:11
    };

    const buttonText = {
      color:"#EEEEEE",
      fontWeight:"bold",
      fontSize:16,
    };

    return (
      <ScrollView>
        <Header style={appBar}>
          <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
          <Text style={titleStyle}> Sign In </Text>
        </Header>
        <View style={backgroundContainer}>
          <Image style={logoContainer} source={require('../Images/CapThisLogo.png')} />
          <Text style={titleContainer}>CapThis</Text>
          <View style={inputContainer}>
            <Button block style={facebookButton} onPress={() => {this.facebookSignIn()}}><MyCon size={20} color="#EEEEEE" name='facebook' /><Text style={buttonText}> Facebook</Text></Button>
            <Button block style={twitterButton} onPress={() => {this.twitterSignIn()}}><MyCon size={20} color="#EEEEEE" name='twitter' /><Text style={buttonText}> Twitter</Text></Button>
            <Button block style={googleButton} onPress={() => {this.googleSignIn()}}><MyCon size={20} color="#EEEEEE" name='google' /><Text style={buttonText}> Google</Text></Button>
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default SignIn
