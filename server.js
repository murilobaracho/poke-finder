const http = require('http');
const fs = require('fs');
const path = require('path');
const { LIMITE_BARALHO, listarBaralho, contarBaralho, salvarPokemonBaralho, sqlDeletarPokemon } = require('./script_db.js');

const PORTA = process.env.PORT || 3002;

const ARQUIVOS = {
    '/': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/index.html': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/style.css': { arquivo: 'style.css', tipo: 'text/css; charset=utf-8' },
    '/script.js': { arquivo: 'script.js', tipo: 'text/javascript; charset=utf-8' },
};

function responderJSON(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(dados));
}

function lerCorpo(req) {
    return new Promise((resolve, reject) => {
        let corpo = '';
        req.on('data', pedaco => corpo += pedaco);
        req.on('end', () => {
            try {
                resolve(JSON.parse(corpo || '{}'));
            } catch (erro) {
                reject(erro);
            }
        });
    });
}

const servidor = http.createServer(async (req, res) => {

    if (req.url === '/api/baralho' && req.method === 'GET') {
        const linhas = await listarBaralho();
        if (linhas === null) {
            return responderJSON(res, 500, { erro: 'Falha ao consultar o banco de dados' });
        }
        return responderJSON(res, 200, linhas);
    }

    if (req.url === '/api/baralho' && req.method === 'POST') {
        try {
            const pokemon = await lerCorpo(req);
            const resultado = await salvarPokemonBaralho(pokemon);

            if (resultado === null) {
                return responderJSON(res, 500, { erro: 'Falha ao salvar o Pokémon no banco de dados' });
            }

            if (resultado === false) {
                const total = await contarBaralho();
                return responderJSON(res, 400, {
                    erro: 'Limite do baralho atingido ou dados inválidos',
                    limite: LIMITE_BARALHO,
                    total: total === null ? 0 : total
                });
            }

            return responderJSON(res, 201, { mensagem: 'Pokémon salvo no baralho' });
        } catch (erro) {
            return responderJSON(res, 400, { erro: 'Corpo da requisição inválido' });
        }
    }

    if (req.url.startsWith('/api/baralho/') && req.method === 'DELETE') {
        const id = req.url.split('/').pop();
        const resultado = await sqlDeletarPokemon(id);

        if (resultado === null) {
            return responderJSON(res, 500, { erro: 'Falha ao consultar o banco de dados' });
        }

        if (resultado === 0) {
            return responderJSON(res, 404, { erro: 'Pokémon não encontrado' });
        }

        return responderJSON(res, 200, { mensagem: 'Pokémon removido do baralho' });
    }

    const rota = ARQUIVOS[req.url];
    if (rota) {
        res.writeHead(200, { 'Content-Type': rota.tipo });
        return fs.createReadStream(path.join(__dirname, rota.arquivo)).pipe(res);
    }

  
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Página não encontrada');
});

servidor.listen(PORTA, () => {
    console.log(`Arena Pokemon em http://localhost:${PORTA}`);
});
