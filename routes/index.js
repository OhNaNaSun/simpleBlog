var express = require('express');
var router = express.Router();
var crypto = require("crypto"),
    User = require("../models/user.js"),
    Post = require("../models/post.js");
/* GET home page. */
router.get('/', function(req, res, next) {
  Post.get(null, function(err, posts){
    if(err){
      posts = []
    }
    console.log(posts);
    res.render('index', {
      title: '主页',
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString(),
      posts: posts
    });

  })

});
router.get("/reg", checkNotLogIn);
router.get("/reg", function(req, res){
  res.render("reg", {
    title: "注册",
    user: req.session.user,
    success: req.flash("success").toString(),
    error: req.flash("error").toString()
  })
})
//注册
router.post("/reg", checkNotLogIn);
router.post("/reg", function(req, res){
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body["password-repeat"];
      //检验用户两次输入的密码是否一致
    if(password !== password_re){
      req.flash("error", "两次输入的密码不一致！");
      return res.redirect("/reg");
    }
    //生成 密码 的md5值
    var md5 = crypto.createHash("md5"),
        password = md5.update(req.body.password).digest("hex");
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    })
    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user){
      if(err){
        //req.session?
        req.flash("error", err);
        return res.redirect("/");
      }
      if(user){
        req.flash("error", err);
        return res.redirect("/reg");
      }
      //如果不存在则新增
      newUser.save(function(err, user){
        if(err){
          req.flash("error", err);
          return res.redirect("/reg");
        }
        req.session.user = newUser;//将用户信息存入session
        req.flash("success", "注册成功！");
        res.redirect("/");
      })
    })

})
router.get("/login", checkNotLogIn);
router.get("/login", function(req, res){
  res.render("login", {
    title:"登陆",
    user: req.session.user||"",
    success: req.flash("success").toString(),
    error: req.flash("error").toString()
  })
})
router.post("/login", checkNotLogIn);
router.post("/login", function(req, res){
  //生成密码的 md5 值
  var md5 = crypto.createHash("md5"),
      password = md5.update(req.body.password).digest("hex");
  //检查用户是否存在
  User.get(req.body.name, function(err, user){
    if(!user){
      req.flash("error", "用户不存在");
      return res.redirect("/login");
    }
    if(user.password != password){
      req.flash("error", "密码错误");
      return res.redirect("/login");
    }
    //用户名和密码都匹配后， 将用户信息存入 session
    req.session.user = user;//?session的有效时间是？
    req.flash("success", "登陆成功");
    res.redirect("/");
  })
})
router.get("/post", checkLogIn);
router.get("/post", function(req, res){
  res.render("post", {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
})
//登陆
router.post("/post", checkLogIn);
router.post("/post", function(req, res){
  var currentUser = req.session.user,
      post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function(err){
      if(err){
        req.flash("error", err);
        return res.redirect("/")
      }
      req.flash("success", "发布成功！");
      res.redirect("/");
    })
})
router.get("/logout", checkLogIn);
router.get("/logout", function(req, res){
  req.session.user = null;
  req.flash("success", "登出成功");
  res.redirect("/");
})
//路由中间件
//检察是否登陆
function checkLogIn(req, res, next){
  if(!req.session.user){
    req.flash("error", "未登陆");
    res.redirect("/login");
  }
  next();
}
//检察是否没登陆
function checkNotLogIn(req, res, next){
  if(req.session.user){
    req.flash("error", "已登陆");
    res.redirect("back");
  }
  next();
}
module.exports = router;
