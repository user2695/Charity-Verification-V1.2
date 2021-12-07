//jshint esversion:6

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
qrcode = require('qrcode');
var qr = require('qrcode');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const DB = "mongodb+srv://admin-zubair:zubair12@cluster0.7tjmi.mongodb.net/testDatabase?retryWrites=true&w=majority/notesDB"
let posts=[];

mongoose.connect(DB, {  
 useNewUrlParser: true,
 useUnifiedTopology: true,
 useCreateIndex: true,
 useFindAndModify: false
}).then(()=>{
    console.log("connected to mongoDb");
}).catch((error)=>
        console.log("no connection"));

//Schema
const userSchema = {
  email: String,
  password: String,
}
const User = mongoose.model("User",userSchema);
const { check, validationResult} = require("express-validator");
const { Router } = require("express");
app.use("/styles",express.static("styles"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");


//Navigation
app.get("/scan",function(req,res){
  res.render("scan")
});
app.get("/",function(req,res){
    res.render("login")
});
app.get("/login",function(req,res){
    res.render("login")
})
app.get("/register", function(req, res){
  res.render("register")
})
app.get("home",function(req,res){
  res.render("home")
});


app.post("/", function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  let newUser = new User({ 
      email:req.body.email,
      password:hash, 
  });
  newUser.save();
  res.redirect("/");
  })

})

app.post("/login", function(req, res){
 const email = req.body.email;
 const password = req.body.password;
var foundUser;
  User.findOne({email:email}, function(err, foundUser){
  if (err){
    res.send("Invalid login details");
  }else{
     if (foundUser){
         bcrypt.compare(password, foundUser.password, function(err, result){
          if (result === true){
            const url = foundUser.toString();            
            if (url.length === 0) res.send("Empty Data!");
            qr.toDataURL(url, (err, src) => {
                if (err) res.send("Error occured");       
                res.render("scan", { src });
                // res.render("index",{
                // email: req.body.email
                // })             
            });
          }else{
            res.send("Invalid login details! Try again.");
            }          
        }); 
      }
    }
}); 
})


// compose post req
const postSchema = {
  name: String,
  text: String
};
const Post = mongoose.model("Post", postSchema);


// To Render Posts
app.get("/home", function(req, res){
  Post.find({}, function(err, posts){
    res.render("home", {
      posts: posts
      });
  });

  // this for onclick
//   var clicks = 50;
// var hasClicked = false;

//     function onClick() 
//     {
//         if(!hasClicked)
//         {
//            clicks += 1;
//            document.getElementById("output").innerHTML = clicks;
//            hasClicked = true;
//         }

//     };
});
app.get("/compose", function(req, res){
  res.render("compose")
})
  app.post("/compose", function(req, res){
    const post = new Post({
      name: req.body.name,
      text: req.body.text,
    });
    post.save()
    res.redirect("home")
  });
 

app.get("/posts/:postId", function(req, res){
const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      name: post.name,
      text: post.text
    });
  });
});

app.listen(3000, function(){
  console.log("Server started at port 3000");
});