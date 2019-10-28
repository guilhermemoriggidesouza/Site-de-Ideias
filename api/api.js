var mysql = require('mysql');
var fs = require('fs');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ideias'
})
async function QueryExecuta (sql){
    var promise = new Promise(function(resolve, reject){
        connection.query(sql, function(error, results, fields){
            if(error){
                reject({result : error, field :fields});
            }else{
                resolve({result : results, field :fields});
            }
        })
    })
    return promise;
}
function resolverPromisse(sql, res){
    var query = QueryExecuta(sql);
    query
    .then(function(result){
        res.status(200).send(result.result);
    })
    .catch(function(error){
        res.status(404).send(error.result);
    })
}
function gerarSqlInsert(tabela, arrDados){
    var keys= Object.keys(arrDados), campos = '(', valores = '(', sql = '';
    keys.forEach(function(element){
        campos += element+', ';
        switch(typeof arrDados[element]){
            case "string":
                valores += '"'+arrDados[element]+'", ';
            break;
            case "int":
                valores += arrDados[element]+', ';
            break;
        }
    })
    campos = campos.substr(0,campos.length-2)+')';
    valores = valores.substr(0,valores.length-2)+')';
    sql = 'INSERT INTO '+tabela+' '+campos+' VALUES '+valores;
    return sql;
}
function gerarSqlUpdate(tabela, arrDados, where){
    var keys= Object.keys(arrDados), keysWhere = Object.keys(where), valores='', sql = '';
    keys.forEach(function(element){
        switch(typeof arrDados[element]){
            case "string":
            valores += element+'= "'+arrDados[element]+'", ';
            break;
            case "int":
                valores += element+'='+arrDados[element]+', ';
            break;
        }
    })
    valores = valores.substr(0,valores.length-2);
    sql = 'UPDATE '+tabela+' SET '+valores+' '+where;
    return sql;
}
module.exports = function(app){
    app.get('/api/get', function(req, res){
        let sql = '', status;
        if(req.query.tipo == 'login'){
            sql = 'SELECT * FROM '+req.query.tabela+' WHERE email = "'+req.query.email+'"';
            var query = QueryExecuta(sql);
            query
            .then(function(result){
                if(result.result.length > 0){
                    result.result.forEach(function(element){
                        if(element.senha === req.query.senha){
                            req.session.user = {user: element.nome, email: element.email, id : element.idusuario};
                            res.status(200).send('logado');
                        }
                    })
                }else{
                    res.status(200).send({error:1, msg:'não foi possível achar o email'});
                }
            })
            .catch(function(error){
                res.status(200).send({error:1, msg:error});
            })
        }else{
            resolverPromisse(req.query.sql, res)
        }
    })
    app.post('/api/post', function(req, res) {
        let tabela = req.query.tabela, sql = '';
        if(req.query.tipo == 'usuario'){
            var cadastro = QueryExecuta('SELECT senha FROM usuarios WHERE email = "'+req.body.email+'" AND senha = "'+req.body.senha+'"');
            cadastro.then(function(result){
                if(result.result.length > 0){
                    res.status(200).send('Já Existe uma senha dessa cadastrada');
                }else{
                    sql = gerarSqlInsert(tabela, req.body);
                    resolverPromisse(sql, res)
                }
            },function(error){
                res.status(200).send(error);
            })
        }else{
            sql = gerarSqlInsert(tabela, req.body);
            var query = QueryExecuta(sql);
            console.log(sql);
            query
            .then(function(result){
                var idideia = result.result.insertId;
                if(req.files.arquivo){
                    var path_origem = req.files.arquivo.path;
                    var path_destino = "public/data/"+req.query.nomeImage+'.jpg';
                    fs.rename(path_origem, path_destino, function(err){
                        if(err){
                            res.status(500).json({error:err});
                            return;
                        }else{
                            sql = gerarSqlUpdate(tabela, {nomeImage:req.query.nomeImage+'.jpg'}, 'WHERE idideia = '+idideia);
                            resolverPromisse(sql, res)
                        }
                    })
                }else{
                    res.status(200).send(result.result);
                    console.log('inseriu aqui');
                }
            })
            .catch(function(error){
                res.status(200).send(error.result);
                console.log(error);
            })
        }
    });
    app.put('/api/put', function(req, res){
        var sql;
        if(req.query.tipo == 'coluna'){
            sql = `UPDATE ${req.query.tabela} SET coluna = coluna ${req.body.coluna} ${req.query.where}`
            console.log(sql)
        }else{
            sql = gerarSqlUpdate(req.query.tabela, req.body, req.query.where)
        }
        resolverPromisse(sql, res)
    })
    app.delete('/api/delete', function(req, res){
        var sql = `DELETE FROM ${req.query.tabela} ${req.body.where}`;
        console.log(sql);
        resolverPromisse(sql, res)
    })
}
