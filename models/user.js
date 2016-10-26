const db = require("./db");
let User = function (user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
module.exports = User;
//存储用户信息
User.prototype.save = function(callback){
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    }
    db.open(function(err, d_b){
        if(err){
            return callback(err);
        }
        //读取User集合
        d_b.collection("user", function(err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            //将用户数据插入 Users 集合
            collection.insert(user, {safe: true}, function(err, user){
                db.close();
                if(err){
                    return callback(err)
                }
                callback(null, user[0])//成功！err 为 null，并返回存储后的用户文档
            })
        })
    })
}
//读取用户信息
User.get = function(name, callback){
    //打开数据库
    db.open(function(err, d_b){
        if(err){
            return callback(err)
        }
        //读取 users 集合
        d_b.collection("user", function(err , collection){
            if(err){
                db.close();
                return callback(err)
            }
            //查找用户名为name的一个文档
            collection.findOne({name: name}, function(err, user){
                db.close();
                if(err){
                    return callback(err)
                }
                callback(null, user)//成功！返回查询的用户信息
            })
        })
    })
}