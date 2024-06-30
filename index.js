const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const Posts = require('./posts.js');

let session = require('express-session');
const fileUpload = require('express-fileupload');

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }));


mongoose.connect('mongodb+srv://root:xgMqEpBTvqU84bVI@cluster0.p2njhoe.mongodb.net/PortalNtc?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true }).then(function () {
    console.log('Conectado ao MongoDB');
}).catch(function (erro) {
    console.log(erro.message);
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp')
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

app.get('/', (req, res) => {
    if (req.query.busca == null) {
        Posts.find({}).sort({ '_id': -1 }).then(function (posts) {
            posts = posts.map(function (post) {
                return {
                    titulo: post.titulo,
                    conteudo: post.conteudo,
                    descSmall: post.conteudo.substr(0, 100),

                    imagem: post.imagem,
                    slug: post.slug,
                    categoria: post.categoria
                }
            })
            Posts.find({}).sort({ 'views': -1 }).limit(3).then(function (maisVistos) {
                maisVistos = maisVistos.map(function (vw) {
                    return {
                        titulo: vw.titulo,
                        conteudo: vw.conteudo,
                        descSmall: vw.conteudo.substr(0, 100),
                        imagem: vw.imagem,
                        slug: vw.slug,
                        categoria: vw.categoria
                    }
                })
                res.render('home', { posts: posts, maisVistos: maisVistos });
            })
        })
    } else {
        Posts.find({ titulo: { $regex: req.query.busca, $options: 'i' } }).then(function (posts) {
            posts = posts.map(function (post) {
                return {
                    titulo: post.titulo,
                    conteudo: post.conteudo,
                    descSmall: post.conteudo.substr(0, 100),

                    imagem: post.imagem,
                    slug: post.slug,
                    categoria: post.categoria
                }
            })
            res.render('busca', { posts: posts, contagem: posts.length })
            console.log(posts);
        })
    }
})

app.get('/:slug', (req, res) => {
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } }, { new: true }).then(function (noticia) {
        // console.log(resposta);
        if (noticia != null) {

            Posts.find({}).sort({ 'views': -1 }).limit(3).then(function (maisVistos) {
                // console.log(posts[0]);
                maisVistos = maisVistos.map(function (val) {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descSmall: val.conteudo.substr(0, 100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views

                    }
                })

                res.render('single', { noticia: noticia, maisVistos: maisVistos });

            })



        } else {
            res.redirect('/');
        }
    })

})


let usuarios = [
    {
        login: 'miguel',
        senha: '123456'
    }
]




app.post('/admin/login', (req, res) => {
    usuarios.map((user) => {
        if (user.login = req.body.login && user.senha == req.body.senha) {
            req.session.login = 'miguel';
        }
    })
    res.redirect('/admin/login');
})

app.post('/admin/cadastro', (req, res) => {

    let formato = req.files.arquivo.name.split('.');
    var imagem = "";

    if (formato[formato.length - 1] == "jpg" || formato[formato.length - 1] == "png" || formato[formato.length - 1] == "jpeg") {
        imagem = new Date().getTime() + '.' + formato;
        req.files.arquivo.mv(__dirname + '/public/images/' + imagem);
    } else {
        fs.unlinkSync(req.files.arquivo.tempFilePath);
    }

    Posts.create({
        titulo: req.body.titulo,
        conteudo: req.body.noticia,
        imagem: 'http://localhost:3000/public/images/' + imagem,
        slug: req.body.slug,
        categoria: req.body.categoria,
        autor: req.body.autor,
        views: 0
    })

    res.redirect('/admin/login');
})

app.get('/admin/deletar/:id', (req, res) => {

    Posts.deleteOne({ _id: req.params.id }).then(function () {
        res.redirect('/admin/login');
    })
})

app.get('/admin/login', (req, res) => {
    if (req.session.login == null) {
        res.render('admin-login')
    } else {
        Posts.find({}).sort({ '_id': -1 }).then(function (posts) {
            posts = posts.map(function (vw) {
                return {
                    id: vw._id,
                    titulo: vw.titulo
                }
            })
            res.render('admin-painel', { posts: posts });
        })
    }

})




app.listen(3000, () => { })

