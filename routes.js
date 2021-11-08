const router = require('express').Router()
const axios = require('axios')
const admin = require("firebase-admin")
const serviceAccount = require("./keys.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore();

// define the default route that fetches all of our notes
router.get('/', async function (req, res) {
    // data the conserves our API quota for development

    try {
        console.log("Getting all posts")
        let postData = [];
        const posts_ref = db.collection("posts")
        await posts_ref.get().then((querySnapshot) => {
            console.log("Received queries")
            querySnapshot.forEach((doc) => {
                console.log("Post Id: " + doc.id)

                postData.push({"id": doc.id, ...doc.data()})

            });
        });
        for (const post of postData) {
            comments = []
            await posts_ref.doc(post.id).collection("comments").get().then((commentQueries) =>{
                console.log("Comments in post " + post.id + " detected.")
                commentQueries.forEach((commentDoc) => {
                    comments.push({"id": commentDoc.id, ...commentDoc.data()})
                })
            })
            post["comments"] = comments
        }
        console.log("Returning value")
        res.json(postData)
        
    } catch (e) {
        console.log(e)
        res.status(500).send('Error.')
    }
})
router.post('/addPost', async function (req, res) {
    // extract note text from request body
    //const { note } = req.body
    //const data = {
    //    note
    //}
    //console.log(note)
    console.log(req.body)
    const { postContent, 
            postTitle, 
            scheduleImage, 
            authorid, 
            likes
        } = req.body

    let newPost = {
        "postContent": postContent,
        "likes": likes,
        "authorid": authorid,
        "scheduleImage": scheduleImage,
        "postTitle": postTitle,
    }
    try {
        // add api call
        console.log("Writing post to DB")
        await db.collection("posts").doc().set(newPost)
        res.json({
            message: 'Note added'
        })
    } catch (e) {
        console.log(e)
        res.status(500).send("Error.")
    }
})

router.post('/deletePost', async function (req, res) {
    console.log(req.body)
    const { postId } = req.body;
    try {
        await db.collection("posts").doc(postId).delete();
        console.log("Post successfully deleted");
    }
    catch (e) {
        console.log(e)
        res.status(500).send("Error")
    }
})

router.post('/addComment', async function (req, res) {
    // extract the note id to delete from request body
    //const { noteId } = req.body
    //console.log(noteId)
    console.log(req.body)
    console.log(postId)
    const { postId, author, commentContent } = req.body;
    const newComment = {
        "authorid": author,
        "commentContent": commentContent
    }
    console.log(newComment)
    try {
        // add api call
        await db.collection("posts").doc(postId)
                .collection("comments").doc()
                .set(newComment)
        console.log("Comment created")
        res.send('Comment created')
    } catch (e) {
        console.log(e)
        res.status(500).send('Error.')
    }
})

router.get("/deleteComment", async function (req, res) {
    const { postId, commentId } = req.body
    try {
        await db.collection("posts").doc(postId)
                .collection("comments").doc(commentId)
                .delete()
        console.log("Comment deleted")
        res.send("Comment deleted")
    }
    catch (e) {
        console.log(e)
        res.status(500).send("Error")
    }
})

module.exports = router