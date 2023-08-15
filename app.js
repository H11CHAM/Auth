const express = require('express');
const app = express();
const flash = require('connect-flash');
const mongoose =require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy; 
const {log}= require('console');

app.use(flash());

app.use(session({
    secret: 'hicham123',  
    resave: false,
    saveUninitialized: false
}));

app.use(passport.session());
app.use(passport.initialize());



app.use(express.urlencoded({extended :false, }))
mongoose.connect('mongodb://127.0.0.1:27017/passportDB').then(()=> {
    log("connected to the database")
}).catch(err=> {
    log(err.message)
});




const {Schema} = mongoose;
const UserSchema = new Schema({
    username : String,
    password : String,
});
UserSchema.methods.verifyPassword = function(password) {
    return this.password === password;
};
const User = mongoose.model('user',UserSchema )

passport.use(new LocalStrategy( {},
    function(username, password, done) {
      User.findOne({ username: username }).then(user=> {
             if(!user) {
              return done(null,false)
             } else if (!user.verifyPassword(password)) {
                return done(null,false)
             } else {
              return done(null,user)
             }
      }).catch(err=> {
        if(err){
          console.log(err);
          return done(err);
        }
      })
    }
    ));
                                                                                                         
     console.log(User.username);
  passport.serializeUser(function(user, done) {
    done(null, user.username);
  });
  
  passport.deserializeUser(function(username, done) {
    User.find({username : username}).then(user => {
        if(!user) return done(null,false);
        if(user) return done(null,true);
    } ).catch(err=> {
      if(err) {
        console.log(err);
        return done(err);
      }
    }) 
     
    });
  


app.get('/',(req,res)=> {
    res.send("<h1>hello there , woooo woooop</h1>");
})
app.get('/home',(req,res)=> {
  res.send("you made it ! ")
})
app.get('/failure',(req,res)=> {
  res.send('coward! ')
})
app.post('/', 
  passport.authenticate('local', { failureRedirect: '/failure', failureFlash : true ,failureMessage:true}),
  function(req, res) {
    res.redirect('/home');
  });


app.listen(3000, ()=> {
    console.log("listening on port 3000! ");
})

  