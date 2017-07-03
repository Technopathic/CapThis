// @flow

import React from 'react';
import { ScrollView, StatusBar, AsyncStorage, View, Image, Dimensions } from 'react-native';
import { Actions as NavigationActions } from 'react-native-router-flux';

import { Container, Header, Content, List, ListItem, Text, Button, Item, Input, Toast, Spinner, Left, Body} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';

// Styles
import Styles from './Styles/ProfileStyle'

class EditProfile extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     user: "",
     token: "",
     profile:null,
     isLoading:true,
     avatar:"",
     previewImg:"",
     profileName:"",
     profileDesc:"",
     profileWebsite:"",
     profileLocation:"",
     newPassword:"",
     confirmPassword:"",
     disableSubmit:false,
     showToast:false,
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
   await AsyncStorage.getItem("token")
   .then((value) => {
     this.setState({
       token: value
     });
   })
   .then(() => {
     this.getProfile();
   })
 };

 getProfile = () => {
   fetch('http://capthis.technopathic.me/api/getProfile/'+this.props.uid+'?token='+this.state.token, {
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
         avatar: json.user.avatar,
         previewImg: json.user.avatar,
         profileName: json.profile.profileName,
         profileDesc: json.profile.profileDesc,
         profileWebsite: json.profile.profileWebsite,
         profileLocation: json.profile.profileLocation,
         isLoading:false
       })
     }
   }.bind(this))
  };

  handleProfileName = (event) => {this.setState({ profileName: event.nativeEvent.text })};
  handleProfileDesc = (event) => {this.setState({ profileDesc: event.nativeEvent.text })};
  handleProfileWebsite = (event) => {this.setState({ profileWebsite: event.nativeEvent.text })};
  handleProfileLocation = (event) => {this.setState({ profileLocation: event.nativeEvent.text })};
  handleNewPassword = (event) => {this.setState({ newPassword: event.nativeEvent.text })};
  handleConfirmPassword = (event) => {this.setState({ confirmPassword: event.nativeEvent.text })};

  updateProfile() {
    var _this = this;

    var data = new FormData();
    data.append('avatar', this.state.avatar);
    data.append('profileName', this.state.profileName);
    data.append('profileDesc', this.state.profileDesc);
    data.append('profileWebsite', this.state.profileWebsite);
    data.append('profileLocation', this.state.profileLocation);
    data.append('newPassword', this.state.newPassword);
    data.append('confirmPassword', this.state.confirmPassword);

    fetch('http://capthis.technopathic.me/api/updateProfile/'+this.props.uid+'?token=' + this.state.token, {
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
        _this.showToast('There was a problem updating.');
      }
      else if(json.success) {
        _this.setState({
          disableSubmit:true,

        })
        _this.showToast('Profile Updated.');
        setTimeout(function(){NavigationActions.pop()}, 2000);
      }
    });
  };

  handleImage = () => {
    var options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      let source = { uri: response.uri };
      this.setState({
        avatar: response.data,
        previewImg: 'data:image/jpeg;base64,' + response.data
      });
    });
  };

  removeImage = () => {
    this.setState({
      avatar:"",
      previewImg:null
    })
  };

  renderImageButtons = () => {
    const buttonContainer = {
      flex:1,
      flexDirection:'row',
    };

    const uploadButton = {
      flex:1,
      backgroundColor:'#DDDDDD',
      elevation:0,
      margin:15
    };

    if(this.state.previewImg !== null) {
      return(
        <View>
          <Image style={avatarStyle} source={{uri:this.state.previewImg}}/>
          <View style={buttonContainer}>
            <Button block style={uploadButton} onPress={() => {this.removeImage()}}><Icon name='remove-circle' size={25} style={{color:'#FFFFFF'}} /></Button>
          </View>
        </View>
      );
    }
    else {
      return(
        <Button block style={uploadButton} onPress={() => {this.handleImage()}}><Icon name='photo-camera' size={25} style={{color:'#FFFFFF'}} /></Button>
      )
    }
  };

  render () {

    const profileHead = {
      flex:1,
      flexDirection:'column',
      alignItems:'center',
      borderBottomWidth:1,
      marginTop:15,
      paddingBottom:10,
      borderBottomColor:'#CCCCCC'
    };

    const avatarButton = {
      alignSelf:'center',
      backgroundColor:'#FFFFFF',
      borderWidth:1,
      borderColor:'#DDDDDD',
      marginTop:10
    };

    const buttonText = {
      color:'#222222'
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

    const buttonStyleOne = {
      margin:15,
      elevation:0,
      backgroundColor:'#ffbe39',
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
      fontFamily:"Lobster-Regular"
    };

    const descBody = {
      fontSize:14,
      color:'#666666',
      fontFamily:'Lato-Regular'
    };

    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    }

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
        <ScrollView style={Styles.container}>
          <Header style={appBar}>
            <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
            <Left>
              <Button transparent onPress={() => NavigationActions.pop()}>
                <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
              </Button>
            </Left>
            <Body>
              <Text style={titleStyle}>Edit Profile</Text>
            </Body>
          </Header>
          <View style={profileHead}>
            {this.renderImageButtons()}
          </View>
          <View>
            <Item>
              <Icon active name='person' style={{fontSize:22, paddingLeft:5, paddingRight:5}} />
              <Input placeholder='Name'  style={descBody} value={this.state.profileName} onChange={this.handleProfileName} selectionColor="#ffbe39" underlineColorAndroid="#ffbe39"/>
            </Item>
            <Item>
              <Icon active name='edit' style={{fontSize:22, paddingLeft:5, paddingRight:5}} />
              <Input placeholder='Bio' style={descBody} value={this.state.profileDesc} onChange={this.handleProfileDesc} selectionColor="#ffbe39" underlineColorAndroid="#ffbe39"/>
            </Item>
            <Item>
              <Icon active name='lock' style={{fontSize:22, paddingLeft:5, paddingRight:5}} />
              <Input placeholder='New Password' style={descBody} value={this.state.newPassword} onChange={this.handleNewPassword} selectionColor="#ffbe39" underlineColorAndroid="#ffbe39"/>
            </Item>
            <Item>
              <Icon active name='lock' style={{fontSize:22, paddingLeft:5, paddingRight:5}} />
              <Input placeholder='Confirm Password' style={descBody} value={this.state.confirmPassword} onChange={this.handleConfirmPassword} selectionColor="#ffbe39" underlineColorAndroid="#ffbe39"/>
            </Item>
          </View>
          <Button block style={buttonStyleOne} onPress={() => this.updateProfile()}><Text>Update</Text></Button>
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

export default EditProfile
