const db = require("./db");
function Post(name, title, post){
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;
Post.prototype.save = function(callback){
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的数据
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        time: time
    }
    db.open(function(err, d_b){
        if(err){
            callback(err)
        }
        //读取posts集合
        d_b.collection("posts", {safe: true}, function(err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            collection.insert(post, function(err, post){
                db.close();
                if(err){
                    return callback(err)
                }
                callback(null)
            })
        })
    })
}
Post.get = function(name, callback){
    db.open(function(err, d_b){
        d_b.collection("posts", function(err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }

            collection.find(query).sort({time: -1}).toArray(
                function(err, docs){
                    db.close();
                    if(err){
                        return callback(err);
                    }
                    callback(null, docs)
                }
            )

        })
    })
}
