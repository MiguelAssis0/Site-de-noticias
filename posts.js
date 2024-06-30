let mongooge = require("mongoose");
let Schema = mongooge.Schema;

let postSchema = new Schema({
    titulo:String,
    imagem:String,
    categoria:String,
    conteudo:String,
    autor:String,
    views:Number,
    slug:String
},{collection:"Posts"});

let Posts = mongooge.model("Posts",postSchema);

module.exports = Posts;