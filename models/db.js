const settings = require("../settings"),
    Db = require("mongodb").Db,
    Connection = require("mongodb").Connection,
    Server = require("mongodb").Server;
//设置数据库连接实例
module.exports = new Db(settings.db, new Server(settings.host, settings.port), {safe: true})