var btoa = require('btoa');
function definirUser(req){
    if(req.session.user){
        dados = req.session.user;
    }else{
        dados = {};
    }
    return dados
}
module.exports = function(app){
    app.get('/', function(req, res){
        let dados = definirUser(req);
        res.render('./index.ejs', dados)
    })
    app.get('/signup', function(req, res){
        let dados = definirUser(req);
        res.render('./cadastrar.ejs', dados);
    })
    app.get('/destroySession',function(req, res){
        if(req.session.destroy()){
            res.redirect('/')
        }else{
            res.status(404).send('N�o foi poss��vel destruir a sess�o, Tente novamente mais tarde');
        }
    })
    app.get('/myIdea', function(req, res){
        let dados = definirUser(req);

        if(dados.user){
            res.render('./myIdea.ejs', dados);
        }else{
            res.redirect('/');
        }
    })
    app.get('/ideia',function(req, res){
        let dados = definirUser(req);
        if(req.query.op && dados.user){
            res.render('./Ideia.ejs', dados);
        }
        if(req.query.id && dados.user){
            dados.idideia = req.query.id;
            res.render('./IdeiaEditar.ejs', dados);
        }
    });
    
}