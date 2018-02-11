// @flow

import React, { Component } from 'react'
import { ScrollView, StatusBar, Image, View, AsyncStorage, Dimensions, TouchableHighlight, Modal, Share, FlatList, Navigator } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Header, Container, Content, Left, Body, Right, Thumbnail, Text, Button, Footer, List, ListItem, Spinner} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import OneSignal from 'react-native-onesignal';

// Styles
import styles from './Styles/HomeStyle'

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      token:"",
      nextPage:1,
      currentPage:0,
      lastPage:1,
      isLoading:true,
      result:"",
      imageOpen:false,
      activeImage:"",
      imageLoading:false
    };
  };

  async componentWillMount() {
    await AsyncStorage.getItem("token")
    .then((value) => {
      this.setState({"token": value});
    })
    .then(() => {
      this.getTopics();
    });
  };

  showImage = (visible, image) => { this.setState({ imageOpen: visible, activeImage: image}); }

  checkID = () => {
    OneSignal.getPermissionSubscriptionState((device) => {
      if(device.userId != null) {
        AsyncStorage.setItem('uuid', device.userId)
        .then(() => {
          NavigationActions.signin();
        })
      } else {
        this.checkID();
      }
    });
  }

  getTopics = () => {
    var nextPage = this.state.nextPage;
    var topics = this.state.topics;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://capthis.technopathic.me/api/getTopics?page='+this.state.nextPage+'&token=' + this.state.token, {
        headers: {
          'Authorization':'Bearer ' +this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
        if(json.error) {
          this.checkID();
        }
        else {
          if(json.current_page !== json.last_page)
          {
             nextPage = nextPage + 1;
          }
          for(var i = 0; i < json.data.length; i++)
          {
            topics.push(json.data[i]);
          }
          this.setState({
            nextPage: nextPage,
            lastPage: json.last_page,
            currentPage: json.current_page,
            topics: topics,
            isLoading:false
          })
        }
       }.bind(this));
    }
  };

  voteTopic(id, dir) {
    var topics = this.state.topics;

    fetch('http://capthis.technopathic.me/api/voteTopic/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        dir: dir
      })
    }).then(function(response) {
        return response.json()
    })
    .then(function(voteRes) {
      if(voteRes === 1)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 1;
            topics[i].topicVotes = parseInt(topics[i].topicVotes) + 1;
          }
        }
      } else if(voteRes === 2)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 0;
            topics[i].topicVotes = parseInt(topics[i].topicVotes) - 1;
          }
        }
      } else if(voteRes === 3)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 2;
            topics[i].topicVotes = parseInt(topics[i].topicVotes) - 1;
          }
        }
      } else if(voteRes === 4)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 0;
            topics[i].topicVotes = parseInt(topics[i].topicVotes) + 1;
          }
        }
      }
      this.setState({topics:topics})
    }.bind(this));
  };

  setVote(topic)
  {
    const activeStyle = {
      backgroundColor:"#ffbe39"
    };

    const optionStyle = {
      flex:1,
      flexDirection:'row',
      justifyContent:'space-around',
      marginTop:3
    };

    const activeIcon = {
      fontSize:20,
      color:'#EEEEEE'
    };

    const iconStyle = {
      fontSize:20,
      color:'#666666'
    };

    var upVote = <Button transparent onPress={() => this.voteTopic(topic.id, 1)}><Icon name="favorite-border" style={iconStyle}/></Button>;
    var selectUp = <Button transparent style={activeStyle} onPress={() => this.voteTopic(topic.id, 1)}><Icon name="favorite" style={activeIcon}/></Button>;

    var replies = <Button transparent onPress={() => {NavigationActions.detail({id:topic.id})}}><Icon name="chat-bubble-outline" style={iconStyle}/></Button>;
    var share = <Button transparent onPress={() => this.shareText(topic)}><Icon name="share" style={iconStyle}/></Button>;


    if(topic.vote === 0) {
      return (
        <View style={optionStyle}>
          {upVote}{replies}{share}
        </View>
      );
    } else if(topic.vote === 1) {
      return (
        <View style={optionStyle}>
          {selectUp}{replies}{share}
        </View>
      );
    } else if(topic.vote === 2) {
      return (
        <View style={optionStyle}>
          {upVote}{replies}{share}
        </View>
      );
    }
  };

  renderEnd()
  {
    const noTopics = {
      color:'#555555',
      fontSize:11,
      fontStyle:'italic',
      padding:15,
      flex:1,
      justifyContent:'center',
      textAlign:'center',
      alignItems:'center',
    };

    if(this.state.currentPage === this.state.lastPage)
    {
      return(
        <Text style={noTopics}>
          You have reached the end.
        </Text>
      );
    }
  };

 shareText = (topic) => {
   Share.share({
     message: topic.caption + ":: See more on the CapThis app!",
     url: topic.topicImg,
     title: 'CapThis'
   }, {
     dialogTitle: 'Share this Topic',
     excludedActivityTypes: [
       'com.apple.UIKit.activity.PostToTwitter'
     ],
     tintColor: 'green'
   })
   .then(this.showResult)
   .catch((error) => this.setState({result: 'error: ' + error.message}));
 };

 showResult = (result) => {
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        this.setState({result: 'shared with an activityType: ' + result.activityType});
      } else {
        this.setState({result: 'shared'});
      }
    } else if (result.action === Share.dismissedAction) {
      this.setState({result: 'dismissed'});
    }
  }

  renderCaption = (topic) => {
    if(topic.caption !== null)
    {
      return(
        <View style={{flex:1, width:Dimensions.get('window').width, minHeight:40, maxHeight:280, backgroundColor:'rgba(0, 0, 0, 0.5)', alignItems:'center', justifyContent:'center', position:'absolute', bottom:50, borderTopWidth:1, borderBottomWidth:1, borderTopColor:'#ffbe39', borderBottomColor:'#ffbe39'}}>
          <Text style={{color:'#FFFFFF', padding:5, textAlign:'center'}}>{topic.caption}</Text>
        </View>
      )
    }
  }

  renderTopics = (topic) => {
    var topic = topic.item;

    const cardStyle = {
      flex: 1,
      shadowOpacity:0,
      elevation:0,
      borderLeftWidth:0,
      borderRightWidth:0,
      borderTopWidth:0,
      borderBottomWidth:1,
      borderBottomColor:'#EAEAEA',
      borderRadius:0,
      marginBottom:0,
      marginTop:0,
    };

    const cardHead = {
      flex:1,
      flexDirection:'row',
      paddingLeft:10,
      paddingRight:10,
      paddingTop:5,
    };

    const cardImage = {
      flex:1,
      borderBottomWidth:0,
      borderTopWidth:0,
      paddingTop:5,
      paddingBottom:5,
    };

    const headerStyle = {
      flex:1,
      flexDirection:'column',
      paddingLeft:10
    };

    const headerText = {
      marginBottom:0,
      paddingBottom:0,
    };

    const itemStyle = {
      paddingTop:0,
      paddingBottom:10,
      paddingLeft:10,
      paddingRight:10,
    };

    const smallText = {
      fontSize:11,
      color:'#777777',
      fontFamily:'Montserrat-Regular'
    };

    const noteText = {
      fontSize:11,
      color:'#777777',
      marginTop:-12
    };

    const noGutter = {
      paddingTop:0,
      paddingBottom:0,
      marginTop:0,
      marginBottom:0
    };

    return(
      <View style={cardStyle}>
        <View style={cardHead}>
          <Thumbnail source={{uri:topic.avatar}} small onPress={() => {NavigationActions.profile({uid:topic.userID})}}/>
          <View style={headerStyle}>
            <Text style={{fontSize:14, fontFamily:'Montserrat-Regular'}} onPress={() => {NavigationActions.profile({uid:topic.userID})}}>{topic.profileName}</Text>
            <Text note style={{fontSize:11, fontFamily:'Montserrat-Regular'}} onPress={() => {NavigationActions.profile({uid:topic.userID})}}>{topic.topicDate}</Text>
          </View>
        </View>
        <TouchableHighlight onPress={() => {this.showImage(true, topic.topicImg)}}>
          <View style={cardImage}>
            <Image style={{ flex:1, width:Dimensions.get('window').width, height:300 }} resizeMode='cover' source={{uri:topic.topicThumbnail}}/>
            {this.renderCaption(topic)}
          </View>
        </TouchableHighlight>
        <View style={{paddingLeft:10, paddingRight:10}}>
          <Text style={smallText} onPress={() => {NavigationActions.detail({id:topic.id})}}>
            {topic.topicVotes} Likes &middot; {topic.topicReplies} Replies
          </Text>
        </View>
        <View style={noGutter}>
          {this.setVote(topic)}
        </View>
      </View>
    )
  }

  renderLoading = () => {
    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    }

    if(this.state.imageLoading === true) {
      return(
        <View style={spinnerStyle}>
          <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
          <Spinner color='#ffbe39'/>
        </View>
      )
    }
  }



  render () {

    const appBar = {
      backgroundColor:"#263238",
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
      fontFamily:'Lobster-Regular'
    };

    const mainContainer = {
      flex:1,
      flexDirection:'column',
    }

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
          <Container>
            <Header style={appBar}>
              <StatusBar backgroundColor="#ffbe39" barStyle="dark-content" />
              <Text style={titleStyle}> CapThis </Text>
            </Header>
            <FlatList
              data={this.state.topics}
              keyExtractor={(topic, index) => index}
              renderItem={this.renderTopics}
              onEndReached={this.getTopics}
              extraData={this.state}
              onEndReachedThreshold={1}
              disableVirtualization={true}
            />

            <Content>
              {this.renderEnd()}
            </Content>
            <Modal animationType={"slide"} transparent={false} visible={this.state.imageOpen}  onRequestClose={() => {}}>
              <TouchableHighlight style={{flex:1, minWidth:Dimensions.get('window').width, minHeight:Dimensions.get('window').height}} onPress={() => {this.showImage(false,"")}}>
                <Image
                  style={{ flex:1, minWidth:Dimensions.get('window').width }}
                  resizeMode='cover'
                  source={{uri:this.state.activeImage}}
                  onLoadStart={() => this.setState({imageLoading:true}) }
                  onLoadEnd={() => this.setState({imageLoading:false}) }
                />
              </TouchableHighlight>
              {this.renderLoading()}
            </Modal>
          </Container>
      )
    }
  }
}
