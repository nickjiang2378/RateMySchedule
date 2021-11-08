import React, { useState, useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync } from "../../../Utils";

import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { PostModel } from "../../../models/post";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";
import { API_URL } from "../../../Api"

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewPostScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  // Event details.
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [scheduleImage, setScheduleImage] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  // Snackbar.
  const [message, setMessage] = useState("");
  // Loading state for submit button
  const [loading, setLoading] = useState(false);

  const currentUserId = firebase.auth().currentUser!.uid;

  // Code for ImagePicker (from docs)
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const {
          status,
        } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        } 
      }
    })();
  }, []);

  // Code for ImagePicker (from docs)
  const pickImage = async () => {
    console.log("picking image");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log("done");
    if (!result.cancelled) {
      setScheduleImage(result.uri);
    }
  };

  // Code for SnackBar (from docs)
  const onDismissSnackBar = () => setVisible(false);
  const showError = (error: string) => {
    setMessage(error);
    setVisible(true);
  };

  // This method is called AFTER all fields have been validated.
  const savePost = async () => {
    if (!postTitle) {
      showError("Please enter a post name.");
      return;
    } else if (!postContent) {
      showError("Please enter an event description.");
      return;
    } else if (!scheduleImage) {
      showError("Please choose an image of your schedule.");
      return;
    } else {
      setLoading(true);
    }

    try {
      // Firestore wants a File Object, so we first convert the file path
      // saved in eventImage to a file object.
      console.log("getting file object");
      const object: Blob = (await getFileObjectAsync(scheduleImage)) as Blob;
      // Generate a brand new doc ID by calling .doc() on the socials node.
      const socialRef = firebase.firestore().collection("socials").doc();
      console.log("putting file object at " + socialRef + ".jpg");
      const result = await firebase
        .storage()
        .ref()
        .child(socialRef.id + ".jpg")
        .put(object);
      console.log("getting download url");
      const downloadURL = await result.ref.getDownloadURL();
      // TODO: You may want to update this SocialModel's default
      // fields by adding one or two attributes to help you with
      // interested/likes & deletes
      const doc: PostModel = {
        postContent: postContent,
        scheduleImage: downloadURL,
        postTitle: postTitle,
        authorid: currentUserId,
        comments: [],
        likes: [],
      };
      console.log("setting download url");
      //await socialRef.set(doc);
      await fetch(`${API_URL}/addPost`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc)
      }).then(() => {
        console.log("Posted new post")
      })
      

      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      showError(error.toString());
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="New Post" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        <TextInput
          label="Post Title"
          value={postTitle}
          onChangeText={(name: any) => setPostTitle(name)}
          style={{ backgroundColor: "white", marginBottom: 20 }}
        />
        <TextInput
          label="Explain briefly what you're asking about"
          value={postContent}
          multiline={true}
          onChangeText={(desc: any) => setPostContent(desc)}
          style={{ backgroundColor: "white", marginBottom: 20 }}
        />

        <Button mode="outlined" onPress={pickImage} style={{ marginTop: 20 }}>
          {scheduleImage ? "Change schedule image" : "Pick an image of your schedule"}
        </Button>
        <Button
          mode="contained"
          onPress={savePost}
          style={{ marginTop: 30 }}
          loading={loading}
        >
          Post
        </Button>
        <Snackbar
          duration={3000}
          visible={visible}
          onDismiss={onDismissSnackBar}
        >
          {message}
        </Snackbar>
      </View>
    </>
  );
}
