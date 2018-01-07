// @flow

import React from 'react';
import { ScrollView, StatusBar, Image, View, AsyncStorage, Modal, Dimensions, TextInput, FlatList } from 'react-native';
import { Actions as NavigationActions } from 'react-native-router-flux';

import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Left, Body, Right, List, ListItem, Footer, Input, Toast, ActionSheet, Spinner, Segment} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyCon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styles
import detailStyles from './Styles/DetailStyle'
import styles from './Styles/HomeStyle'

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:"",
      user:"",
      topic: null,
      replies:[],
      chars_left: 1000,
      replyBody:"",
      replyMentions:[],
      selectReply:0,
      nextPage:1,
      currentPage:0,
      lastPage:1,
      topicLoading:true,
      repliesLoading:true,
      optionsModal: false,
      reportModal: false,
      deleteModal: false,
      replyModal: false,
      reportReplyModal: false,
      deleteReplyModal: false,
      showToast:false,
      loadMode:'Best'
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
     this.getTopic();
     this.getBest();
    })
  };

  getTopic = () => {
    fetch('http://capthis.technopathic.me/api/showTopic/'+this.props.id+'?token='+this.state.token, {
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    })
    .then(function(response) {
      return response.json()
    })
    .then(function(json) {
      this.setState({
        topic: json,
        topicLoading:false
      })
    }.bind(this));
  };

  getReplies = () => {
    var nextPage = this.state.nextPage;
    var replies = this.state.replies;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://capthis.technopathic.me/api/getReplies/'+this.props.id+'?page='+this.state.nextPage+'&token='+this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
         if(json.current_page !== json.last_page)
         {
            nextPage = nextPage + 1;
         }
         for(var i = 0; i < json.data.length; i++)
         {
           replies.push(json.data[i]);
         }
         this.setState({
           nextPage: nextPage,
           lastPage: json.last_page,
           currentPage: json.current_page,
           replies: replies,
           repliesLoading:false
         })
       }.bind(this));
     }
  };

  getBest = () => {
    var nextPage = this.state.nextPage;
    var replies = this.state.replies;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://capthis.technopathic.me/api/getBestReplies/'+this.props.id+'?page='+this.state.nextPage+'&token='+this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
         if(json.current_page !== json.last_page)
         {
            nextPage = nextPage + 1;
         }
         for(var i = 0; i < json.data.length; i++)
         {
           replies.push(json.data[i]);
         }
         this.setState({
           nextPage: nextPage,
           lastPage: json.last_page,
           currentPage: json.current_page,
           replies: replies,
           repliesLoading:false
         })
       }.bind(this));
     }
  };

  storeReply = () => {
    var _this = this;
    var replies = this.state.replies;

    fetch('http://capthis.technopathic.me/api/storeReply?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        topicID: this.props.id,
        replyBody: this.state.replyBody
      })
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast("There was a problem posting this.");
      }
      else {
        if(json === 0)
        {
          _this.showToast("You cannot make an empty post.");
        }
        else if(json === 2)
        {
          _this.showToast("You do not have permission.");
        }
        else if(json === 3)
        {
          _this.showToast("You can only have 1 Mention.");
        }
        else if(json === 4)
        {
          _this.showToast("Your reply is too long.");
        }
        else if(json === 5)
        {
          _this.showToast("You're posting too quickly.");
        }
        else if(json === 6)
        {
          _this.showToast("This topic has reached it's maximum potential.");
        }
        else
        {
          replies.push(json);
          _this.setState({
            replyBody:"",
            replies:replies
          })
          _this.showToast("Reply Added!");
        }
      }
    });
  };

  showReport(visible) { this.setState({optionsModal:false, reportModal: visible}); }
  showDelete(visible) { this.setState({optionsModal:false, deleteModal: visible}); }

  showReplyReport(visible) { this.setState({replyModal:false, reportReplyModal: visible}); }
  showReplyDelete(visible) { this.setState({replyModal:false, deleteReplyModal: visible}); }

  deleteTopic() {
    var _this = this;

    fetch('http://capthis.technopathic.me/api/deleteTopic/'+this.props.id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem posting this.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showDelete(!_this.state.deleteModal)
          _this.showToast('Topic was deleted.');
          setTimeout(function(){NavigationActions.root({refresh: {index:0}})}, 2000);
        }
      }
    });
  };

  reportTopic()
  {
    var _this = this;

    fetch('http://capthis.technopathic.me/api/reportTopic/'+this.props.id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem reporting this topic.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReport(!_this.state.reportModal);
          _this.showToast('Topic was reported.');
        }
      }
    });
  };

  unReportTopic()
  {
    var _this = this;

    fetch('http://capthis.technopathic.me/api/unReportTopic/'+this.props.id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem clearing this topic.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showToast('Topic was cleared');
        }
      }
    });
  };

  deleteReply(id) {
    var _this = this;

    fetch('http://capthis.technopathic.me/api/deleteReply/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem deleting this.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReplyDelete(!_this.state.deleteReplyModal);
          _this.showToast('Reply was deleted.');
        }
      }
    });
  }

  reportReply(id) {
    var _this = this;

    fetch('http://capthis.technopathic.me/api/reportReply/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem reporting this reply.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReplyReport(!_this.state.reportReplyModal);
          _this.showToast('Reply was reported.');
        }
        else if(json === 2)
        {
          _this.showReplyReport(!_this.state.reportReplyModal);
          _this.showToast('You cannot report yourself.');
        }
      }
    });
  };

  unReportReply()
  {
    var _this = this;

    fetch('http://capthis.technopathic.me/api/unReportReply/'+this.state.selectReply+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem clearing this reply.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReplyReport(!_this.state.reportReplyModal);
          _this.showToast('Reply was cleared.');
        }
      }
    });
  };

  optionButtons = () => {
    var options = ['Report'];
    if(this.state.user.user.role == 1 || this.state.user.user.id == this.state.topic.userID)
    {
      options.push('Delete');
    }

    return options;
  }

  optionReplyButtons = () => {
    var options = ['Profile', 'Report'];
    if(this.state.user.user.role == 1)
    {
      options.push('Delete');
    }

    return options;
  }

  renderCrown = (activeCaption) => {
    if(activeCaption === 1)
    {
      return(
        <MyCon name='crown' size={25} style={{color:'#ffbe39', position:'absolute', bottom:-8}}/>
      )
    }
  }

  voteReply(id, dir) {
    var replies = this.state.replies;

    fetch('http://capthis.technopathic.me/api/replyVote/'+id+'?token=' + this.state.token, {
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
        for(var i = 0; i < replies.length; i++)
        {
          if(replies[i].id === id)
          {
            replies[i].vote = 1;
            replies[i].replyVotes = parseInt(replies[i].replyVotes) + 1;
          }
        }
      } else if(voteRes === 2)
      {
        for(var i = 0; i < replies.length; i++)
        {
          if(replies[i].id === id)
          {
            replies[i].vote = 0;
            replies[i].replyVotes = parseInt(replies[i].replyVotes) - 1;
          }
        }
      } else if(voteRes === 3)
      {
        for(var i = 0; i < replies.length; i++)
        {
          if(replies[i].id === id)
          {
            replies[i].vote = 2;
            replies[i].replyVotes = parseInt(replies[i].replyVotes) - 1;
          }
        }
      } else if(voteRes === 4)
      {
        for(var i = 0; i < replies.length; i++)
        {
          if(replies[i].id === id)
          {
            replies[i].vote = 0;
            replies[i].replyVotes = parseInt(replies[i].replyVotes) + 1;
          }
        }
      }
      this.setState({replies:replies})
    }.bind(this));
  };

  setVote(reply)
  {
    var upVote = <Icon name='favorite-border' size={30} style={{color:'#444444'}} onPress={() => this.voteReply(reply.id, 1)}/>;
    var selectUp = <Icon name='favorite' size={30} style={{color:'#ffbe39'}} onPress={() => this.voteReply(reply.id, 1)}/>;

    if(reply.vote === 0) {
      return (
        <View>
          {upVote}
        </View>
      );
    } else if(reply.vote === 1) {
      return (
        <View>
          {selectUp}
        </View>
      );
    } else if(reply.vote === 2) {
      return (
        <View>
          {upVote}
        </View>
      );
    }
  };


  renderReplies = (reply) => {
    var reply = reply.item

    return(
      <ListItem avatar onPress={() => this.voteReply(reply.id, 1)} onLongPress = {() => {
        this.setState({
          selectReply:reply.id
        });
        ActionSheet.show(
        {
        options: this.optionReplyButtons(),
        title:'Options'
        },
        (buttonIndex) => {
          if(buttonIndex == 0)
          {
            NavigationActions.profile({uid:reply.userID});
          }
          else if(buttonIndex == 1)
          {
            this.showReplyReport(!this.state.reportReplyModal);
          }
          else if(buttonIndex == 2)
          {
            this.showReplyDelete(!this.state.deleteReplyModal);
          }
        }
      )}}>
        <Left>
          <Thumbnail source={{uri:reply.avatar}} small/>
          {this.renderCrown(reply.activeCaption)}
        </Left>
        <Body style={{flex:1}}>
            <Text style={{fontSize:13, fontFamily:'Lato-Regular'}}>{reply.replyBody}</Text>
            <Text note style={{fontSize:11, fontFamily:'Montserrat-Regular'}}>{reply.profileName} - {reply.replyDate} - {reply.replyVotes} Points</Text>
        </Body>
        <Right>
          {this.setVote(reply)}
        </Right>
      </ListItem>
    );
  }

  renderSegment = () => {

    if(this.state.loadMode === 'Best')
    {
      return(
        <Body>
          <Segment style={{backgroundColor:"transparent"}}>
            <Button style={{backgroundColor:'#FFFFFF'}} first active onPress={() => {
              this.setState({
                replies: [],
                nextPage:1,
                currentPage:0,
                lastPage:1,
                isLoading:true,
                loadMode:'Best'
              }, function() {
                this.getBest();
              })
            }}
            ><Text style={{color:'#444444'}}>Best</Text></Button>
            <Button last onPress={() => {
              this.setState({
                replies: [],
                nextPage:1,
                currentPage:0,
                lastPage:1,
                isLoading:true,
                loadMode:'New'
              }, function() {
                this.getReplies();
              })
            }}><Text style={{color:'#FFFFFF'}}>New</Text></Button>
          </Segment>
        </Body>
      );
    }
    else if(this.state.loadMode === 'New') {
      return(
        <Body>
          <Segment style={{backgroundColor:"transparent"}}>
            <Button first onPress={() => {
              this.setState({
                replies: [],
                nextPage:1,
                currentPage:0,
                lastPage:1,
                isLoading:true,
                loadMode:'Best'
              }, function() {
                this.getBest();
              })
            }}
            ><Text style={{color:'#FFFFFF'}}>Best</Text></Button>
            <Button style={{backgroundColor:'#FFFFFF'}} last active onPress={() => {
              this.setState({
                replies: [],
                nextPage:1,
                currentPage:0,
                lastPage:1,
                isLoading:true,
                loadMode:'New'
              }, function() {
                this.getReplies();
              })
            }}><Text style={{color:'#444444'}}>New</Text></Button>
          </Segment>
        </Body>
      );
    }
  }

  moreReplies = () => {
    if(this.state.loadMode === 'New')
    {
      this.getReplies();
    }
    else if(this.state.loadMode === 'Best')
    {
      this.getBest();
    }
  }


  render() {

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

    const buttonStyleOne = {
      margin:15,
      elevation:0,
      backgroundColor:'#02BB75'
    };

    const buttonStyleTwo = {
      marginLeft:30,
      marginRight:30,
      elevation:0,
      backgroundColor:'#CCCCCC'
    };

    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    };

    if (this.state.topicLoading || this.state.repliesLoading) {
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
              <Left>
                <Button transparent onPress={() => NavigationActions.pop()}>
                  <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
                </Button>
              </Left>
              {this.renderSegment()}
              <Right style={{flex:1, flexDirection:'column'}}>
                <Button transparent onPress={() => ActionSheet.show(
                  {
                  options: this.optionButtons(),
                  cancelButtonIndex:3,
                  title:'Options'
                  },
                  (buttonIndex) => {
                    if(buttonIndex == 0)
                    {

                      this.showReport(!this.state.reportModal);
                    }
                    else if(buttonIndex == 1)
                    {
                      this.showDelete(!this.state.deleteModal);
                    }
                  }
                )}>
                  <Icon name='more-vert' size={26} style={{color:'#EEEEEE'}} />
                </Button>
              </Right>
            </Header>

            <FlatList
              data={this.state.replies}
              keyExtractor={(reply, index) => index}
              renderItem={this.renderReplies}
              onEndReached={this.moreReplies}
              extraData={this.state}
              onEndReachedThreshold={1}
              disableVirtualization={false}
            />

            <Footer style={{height:40, backgroundColor:'#FFFFFF', borderTopWidth:1, borderTopColor:'#DDDDDD'}}>
              <TextInput style={{height: 40, flex:1}} onChangeText={(text) => this.setState({replyBody:text})} value={this.state.replyBody} placeholder="Leave a reply" returnKeyType="send" selectionColor="#ffbe39" underlineColorAndroid="#ffbe39" onSubmitEditing={() => this.storeReply()} underlineColorAndroid='transparent'/>
            </Footer>

          <Modal animationType={"slide"} transparent={false} visible={this.state.reportModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to report this topic?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.reportTopic()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showReport(!this.state.reportModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>

          <Modal animationType={"slide"} transparent={false} visible={this.state.deleteModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to delete this topic?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.deleteTopic()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showDelete(!this.state.deleteModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>

          <Modal animationType={"slide"} transparent={false} visible={this.state.reportReplyModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to report this reply?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.reportReply(this.state.selectReply)}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showReplyReport(!this.state.reportReplyModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>

          <Modal animationType={"slide"} transparent={false} visible={this.state.deleteReplyModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to delete this reply?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.deleteReply(this.state.selectReply)}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showReplyDelete(!this.state.deleteReplyModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>
        </Container>
      );
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

export default Detail
