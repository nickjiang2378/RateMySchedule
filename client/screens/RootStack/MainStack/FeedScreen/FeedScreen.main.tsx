import React, { useState, useEffect } from "react";
import { View, FlatList, Text } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";
import firebase from "firebase/app";
import "firebase/firestore";
import { PostModel } from "../../../../models/post.js";
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import { AppStyles } from "../../../../AppStyles.js";
import { API_URL } from "../../../../Api";


interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {
  // List of post objects
  const [posts, setPosts] = useState<PostModel[]>([]);
  console.log("Rendering Feed Screen")

  const [currentUserId, setCurrentUserId] = useState(firebase.auth().currentUser!.uid);
  console.log("Signed in as " + currentUserId)

  useEffect(() => {
    const db = firebase.firestore();
    const unsubscribe = db
      .collection("posts")
      .onSnapshot((querySnapshot: any) => {
        var newPosts : PostModel[] = [];
        querySnapshot.forEach((post: any) => {
          const newPost = post.data() as PostModel;
          newPost.id = post.id;
          newPosts.push(newPost);
        });
        setPosts(newPosts);
      });
    return unsubscribe;
  }, []);

  /*useEffect(() => {
    console.log(API_URL)
    fetch(`${API_URL}/`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(async res => {
      try {
        const jsonRes = await res.json()
        let newPosts: PostModel[] = [];
        if (res.status == 200) {
          console.log(jsonRes)
          jsonRes.forEach((post: any) => {
            const newPost = post as PostModel
            newPosts.push(newPost)
          })
        }
        setPosts(newPosts)
      } catch (e) {
        console.log(e)
      }
    }).catch((e) => {
      console.log(e)
    })

  }, []);*/

  const toggleInterested = (post: PostModel, liked: boolean) => {
    if (liked) {
      console.log("Adding user to likes")
      firebase.firestore()
          .collection("posts")
          .doc(post.id)
          .update({
            likes: firebase.firestore.FieldValue.arrayUnion(currentUserId)
          })
          .catch((error) => {console.log(error)})
      post.likes.push(currentUserId)
    } else {
      console.log("Removing user from likes")
      firebase.firestore()
          .collection("posts")
          .doc(post.id)
          .update({
            likes: firebase.firestore.FieldValue.arrayRemove(currentUserId)
          })
          .catch((error) => {console.log(error)})
      let remove_idx = post.likes.indexOf(currentUserId)
      post.likes.splice(remove_idx, 1)
    }

  };

  const deletePost = (post: PostModel) => {
    if (post.authorid == currentUserId) {
      firebase.firestore()
        .collection("socials")
        .doc(post.id)
        .delete()
        .then(() => {
          console.log("Doc successfully deleted")
        })
        .catch((error) => {console.log(error)})
    }
    
  };

  const renderPosts = ({ item }: { item: PostModel }) => {
    
    const onPress = () => {
      navigation.navigate("DetailScreen", {
        post: item,
      });
    };
    //console.log(item.likes)
    //console.log(currentUserId)
    //console.log(item.likes.includes(currentUserId))
    console.log(item)

    return (
      <Card onPress={onPress} style={{ margin: 16 }}>
        <Card.Cover source={{ uri: item.scheduleImage }} />
        <Card.Title
          title={item.postTitle}
          subtitle={
            item.postContent +
            " • " +
            `${item.likes.length}` + " likes"

          }
        />
        <Card.Actions>
          {item.likes?.includes(currentUserId) ? 
            <Button 
              icon="heart"
              onPress={() => {toggleInterested(item, false)}}
            >
              Liked
            </Button> : 
            <Button 
              icon="heart-outline"
              onPress={() => {toggleInterested(item, true)}}
            >
              Like
            </Button>
          }
          
          {item.authorid == currentUserId ? <Button onPress={() => {deletePost(item)}}><Text style={{color: "red"}}>Remove</Text></Button> : null}
        </Card.Actions>

      </Card>
    );
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action
          icon="exit-to-app"
          onPress={() => {setCurrentUserId(null); firebase.auth().signOut()}}
        />
        <Appbar.Content title="RateMySchedule" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate("NewPostScreen");
          }}
        />
      </Appbar.Header>
    );
  };

  const ListEmptyComponent = () => {
    return (
      <Text style={styles.filler_page}>No posted schedules at this time. Be the first to create one!</Text>
    );
  }

  return (
    <>
      <Bar />
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={renderPosts}
          keyExtractor={(_: any, index: number) => "key-" + index}

          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
    </>
  );
}
