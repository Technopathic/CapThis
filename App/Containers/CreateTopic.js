// @flow

import React from 'react'
import { View, ScrollView, StatusBar, Text, AsyncStorage, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native'
import Autocomplete from 'react-native-autocomplete-input'
import { Container, Header, Content, InputGroup, List, ListItem, Button, Toast, Spinner} from 'native-base';
import { Actions as NavigationActions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import styles from './Styles/CreateTopicStyle'

class CreateTopic extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     token:"",
     autoTags:[],
     tags:"",
     topicTags:[],
     topicImg:"",
     previewImg:null,
     disableSubmit: false,
     showToast: false,
     isLoading:false
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
      this.setState({token: value});
    })
    .then(() => {
      fetch('http://capthis.technopathic.me/api/getTaggable?token=' + this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
      .then(function(response) {
        return response.json()
      })
      .then(function(json) {
        this.setState({
          autoTags: json
        })
      }.bind(this));
    })
  };

  handleTopicTags = (event) => {
    this.setState({
      tags: event.nativeEvent.text
    })
  };

  setTopicTags = (event, chosenRequest) => {
    var tags = this.state.topicTags;
    var tag = null;
    if(chosenRequest === undefined && event !== 0)
    {
      chosenRequest = event.nativeEvent.text;
    }
    if(chosenRequest.tagName)
    {
      tag = chosenRequest;
    }
    else if(chosenRequest.trim().length != 0){
      tag = {tagName:chosenRequest};
    }
    else {
      return;
    }

    var dup = false;
    for(var i = 0; i < tags.length; i++)
    {
      if(tags[i].tagName === tag.tagName)
      {
        dup = true;
      }
    }
    if(dup === true)
    {
      _this.showToast('You cannot add this tag again.');
    }
    else {
      tags.push(tag);
      this.setState({
        topicTags:tags,
        tags:""
      });
    }
  };

  findTags(query) {
   if (query === '') {
     return [];
   }

   const { autoTags } = this.state;
   const regex = new RegExp(`${query.trim()}`, 'i');
   return autoTags.filter(tag => tag.tagName.search(regex) >= 0);
 };

 handleTagDelete = (index) => {
    this.topicTags = this.state.topicTags;
    this.topicTags.splice(index, 1);
    this.setState({topicTags: this.topicTags});
  };

  handleImage = () => {
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      let source = { uri: response.uri };
      this.setState({
        topicImg: response.data,
        previewImg: 'data:image/jpeg;base64,' + response.data
      });
    });
  };

  removeImage = () => {
    this.setState({
      topicImg:"",
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
      marginTop:10,
      marginBottom:10,
      backgroundColor:'#DDDDDD',
      elevation:0,
    };

    if(this.state.previewImg !== null) {
      return(
        <View>
          <View style={buttonContainer}>
            <Button block style={uploadButton} onPress={() => {this.handleImage()}}><Icon name='redo' size={25} style={{color:'#FFFFFF'}} /></Button>
            <Button block style={uploadButton} onPress={() => {this.removeImage()}}><Icon name='remove-circle' size={25} style={{color:'#FFFFFF'}} /></Button>
          </View>
          <Image style={{ flex:1, height:300 }} source={{uri:this.state.previewImg}}/>
        </View>
      );
    }
    else {
      return(
        <Button block style={uploadButton} onPress={() => {this.handleImage()}}><Icon name='photo-camera' size={25} style={{color:'#FFFFFF'}} /></Button>
      )
    }
  };

  storeTopic() {
    var _this = this;

    var data = new FormData();
    data.append('topicImg', this.state.topicImg);
    data.append('topicTags', JSON.stringify(this.state.topicTags));

    this.setState({
      isLoading:true
    })

    fetch('http://capthis.technopathic.me/api/storeTopic?token=' + this.state.token, {
      method: 'POST',
      body:data,
      headers: {
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast(json.error);
      }
      else {
        _this.setState({
          disableSubmit:true,
          topicImg:"",
          previewImg:null,
          topicTags:[],
          isLoading:false
        })
        _this.showToast('Topic Added!');
        setTimeout(function(){NavigationActions.root({refresh: {index:0}})}, 3000);
      }
    }.bind(this));
  };

  renderIsLoading = () => {

    const loadingStyle = {
      flex:1,
      width:Dimensions.get('window').width,
      height:Dimensions.get('window').height,
      paddingTop:15,
      paddingBottom:15,
      backgroundColor:"rgba(0, 0, 0, 0.3)",
      justifyContent:'center',
      alignItems:'center',
      position:'absolute',
      zIndex:99999
    }

    if(this.state.isLoading === true)
    {
      return(
        <View style={loadingStyle}>
          <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
          <Spinner color='#ffbe39'/>
        </View>
      )
    }
  }

  render () {

    const smallText = {
      fontSize:11,
      marginLeft:5,
      fontFamily:'Montserrat-Regular'
    };

    const topicOptions = {
      flex:1,
      flexDirection:'row',
      justifyContent:'space-between'
    };

    const iconStyle = {
      color:'#666666',
      fontSize:22
    };

    const inputStyle = {
      marginTop:15
    };

    const chipStyle = {
      flex:1,
      flexDirection:'row'
    };

    const singleChip = {
      backgroundColor:'#EEEEEE',
      borderRadius:25,
      paddingTop:2,
      paddingBottom:2,
      paddingLeft:10,
      paddingRight:10,
      margin:3,
    };

    const tagIcon = {
      fontSize:16,
    };

    const autoInputStyle = {
      backgroundColor:'transparent',
      borderWidth:0,
      margin:0,
      marginTop:10,
      marginBottom:10,
    };

    const autoStyle = {
      paddingLeft:10,
      paddingRight:10,
      paddingTop:3,
      paddingBottom:3,
      margin:0
    };

    const buttonStyleOne = {
      margin:15,
      elevation:0,
      backgroundColor:'#ffbe39',
    };

    const autocompleteContainerOne = {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: -200,
      zIndex: 1
    };

    const autocompleteContainerTwo = {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: -400,
      zIndex: 1
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

    const contentStyle = {
      padding:10
    }

    const { tags } = this.state;
    const autoTags = this.findTags(tags);
    const comp = (s, s2) => s.toLowerCase().trim() === s2.toLowerCase().trim();

    return (
      <ScrollView>
        {this.renderIsLoading()}
        <Header style={appBar}>
          <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
          <Text style={titleStyle}> New Topic </Text>
        </Header>
        <Content style={contentStyle}>
          {this.renderImageButtons()}
          <Autocomplete
            style={autoInputStyle}
            listStyle={autoStyle}
            inputContainerStyle={autoInputStyle}
            autoCapitalize="none"
            autoCorrect={false}
            defaultValue={tags}
            selectionColor="#ffbe39"
            underlineColorAndroid="#ffbe39"
            onChangeText={text => this.setState({ tags: text })}
            data={autoTags.length === 1 && comp(tags, autoTags[0].tagName) ? [] : autoTags}
            placeholder="Add your tags"
            renderItem={({ id, tagName }) => (
              <TouchableOpacity onPress={() => this.setTopicTags(0, {id, tagName})}>
                <Text>
                  {tagName}
                </Text>
              </TouchableOpacity>
            )}
            onSubmitEditing={this.setTopicTags}
          />
          <View style={chipStyle}>
            {this.state.topicTags.map((topicTag, i) => (
              <Text key={i} onPress={() => this.handleTagDelete(i)} style={singleChip}>
                {topicTag.tagName}
              </Text>
            ))}
          </View>
        </Content>
        <Button block style={buttonStyleOne} onPress={() => this.storeTopic()} disabled={this.state.disableSubmit}><Text style={{color:'#FFFFFF', fontWeight:'bold'}}>Done</Text></Button>
      </ScrollView>
    )
  }
}

export default CreateTopic
