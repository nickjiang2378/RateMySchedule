import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, {useState, useEffect} from "react";
import { ScrollView, Image, Text, View, FlatList } from "react-native";
import { Appbar, Card, TextInput, Button, Title } from "react-native-paper";
import { MainStackParamList } from "../MainStackScreen";
import { styles } from "./DetailScreen.styles";
import firebase from "firebase/app";
import "firebase/firestore";
import { PostModel } from "../../../../models/post.js";
import { API_URL } from "../../../../Api";

interface Props {
  navigation: StackNavigationProp<MainStackParamList, "DetailScreen">;
  route: RouteProp<MainStackParamList, "DetailScreen">;
}

export default function DetailScreen({ route, navigation }: Props) {
  const { post } = route.params;
  const { postTitle, postContent, scheduleImage } = post;
  const [comments, setComments] = useState();
  const [newComment, setNewComment] = useState();

  const currentUserId = firebase.auth().currentUser!.uid;

  useEffect(() => {
    const db = firebase.firestore();
    const unsubscribe = db
      .collection("posts")
      .doc(post.id)
      .collection("comments")
      .onSnapshot((querySnapshot: any) => {
        let commentObjs = [];
        querySnapshot.forEach((comment: any) => {
          const newCom = comment.data();
          commentObjs.push(newCom);
        });
        setComments(commentObjs);
      });
    return unsubscribe;
  }, [])

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate("FeedScreen")} />
        <Appbar.Content title="RateMySchedule" />
      </Appbar.Header>
    );
  };

  function renderComments({ item }) {
    const { commentContent } = item;
    console.log(item)
    return (
      <Card style={{shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1,
                    elevation: 1,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
      >
        <Card.Content>
          <Text>{commentContent}</Text>
        </Card.Content>
      </Card>
    )
  }

  async function addComment() {
    const newCommentObj = {
      commentContent: newComment,
      author: currentUserId,
      postId: post.id
    }
    console.log("New comment")
    console.log(newCommentObj)
    try {
      await fetch(`${API_URL}/addComment`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommentObj)
      }).then(() => {
        console.log("New Comment posted")
      }).catch((e) => {
        console.log("Comment failed to post")
        console.log(e)
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  console.log(comments)

  return (
    <>
      <Bar />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.view}>
            <Image style={styles.image} source={{ uri: scheduleImage }} />
            <Text style={{ ...styles.h1, marginVertical: 10 }}>
              {postTitle}
            </Text>
            <Text style={{ ...styles.subtitle, marginBottom: 5 }}>
              {postContent}
            </Text>
            <TextInput
              label="Posting comment anonymously"
              value={newComment}
              onChangeText={text => setNewComment(text)}
              style={{ marginTop: 20, marginBottom: 20, backgroundColor: "white"}}
            />
            <Button
              mode="contained"
              onPress={addComment}
            >Submit comment</Button>
          </View>

          
        </ScrollView>
        <View style={ {padding: 20, height: 300, marginBottom: 20} }>
          <Title>Comments:</Title>
          <FlatList
            data={comments}
            renderItem={renderComments}
            keyExtractor={(_: any, index: number) => "key-" + index}

          />
        </View> 
      </View>
      
    </>
  );
}
