require('dotenv').config({ quiet: true });

const LIMITE_BARALHO = 12;

const DATABASE_URL = process.env.DATABASE_URL;
let neonHttpEndPoint = null;

if (DATABASE_URL) {
    try {
        const host = new URL(DATABASE_URL).host;
        if (host) neonHttpEndPoint = `https://${host}/sql`;
    } catch (erro) {
        console.error('DATABASE_URL inválida:', erro.message);
    }
}

async function executarQueryNeon(querySQL, parametros = []) {
    if (!DATABASE_URL || !neonHttpEndPoint) {
        console.error('Falha ao comunicar com o banco de dados: DATABASE_URL não configurada');
        return null;
    }

    try {
        const resposta = await fetch(neonHttpEndPoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: querySQL,
                params: parametros
            })
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Erro HTTP ${resposta.status}: ${erroTexto}`);
        }

        const dados = await resposta.json();
        return dados.rows || [];
    } catch (erro) {
        console.error('Falha ao comunicar com o banco de dados', erro);
        return null;
    }
}

async function listarBaralho() {
    const linhas = await executarQueryNeon(
        'SELECT * FROM BARALHO ORDER BY id ASC'
    );

    return linhas === null ? null : (linhas || []);
}

async function contarBaralho() {
    const linhas = await executarQueryNeon(
        'SELECT COUNT(*)::INT AS total FROM BARALHO'
    );

    if (linhas === null) return null;

    return linhas.length > 0 ? Number(linhas[0].total) : 0;
}

async function salvarPokemonBaralho(nome, img, cp, treinador, tipo1, tipo2) {
    let dados;

    if (nome && typeof nome === 'object') {
        dados = nome;
    } else {
        dados = { nome, img, cp, treinador, tipo1, tipo2 };
    }

    const total = await contarBaralho();
    if (total === null) return null;
    if (total >= LIMITE_BARALHO) return false;

    const nomePokemon = String(dados.nome || '').trim();
    const imagemPokemon = String(dados.img || dados.imagem || '').trim();
    const poderPokemon = Number(dados.cp ?? dados.combatPower ?? 0);
    const treinadorPokemon = String(dados.treinador || '').trim();

    let primeiroTipo = String(dados.tipo1 || '').trim().toLowerCase();
    let segundoTipo = String(dados.tipo2 || '').trim().toLowerCase();

    if (!primeiroTipo && dados.tipo) {
        const tipos = String(dados.tipo).split(',').map(tipo => tipo.trim().toLowerCase()).filter(Boolean);
        primeiroTipo = tipos[0] || 'desconhecido';
        segundoTipo = tipos[1] || 'desconhecido';
    }

    primeiroTipo = (primeiroTipo || 'desconhecido').slice(0, 15);
    segundoTipo = (segundoTipo || 'desconhecido').slice(0, 15);

    if (!nomePokemon || !imagemPokemon) return false;

    const query = 'INSERT INTO BARALHO (nome, img, cp, treinador, tipo1, tipo2) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const parametros = [nomePokemon, imagemPokemon, poderPokemon, treinadorPokemon, primeiroTipo, segundoTipo];
    const linhas = await executarQueryNeon(query, parametros);

    if (linhas === null) return null;
    return linhas.length > 0;
}

// funções existentes do projeto
async function insertPokemon(nome, img, cp, treinador, tipo1, tipo2) {
    return salvarPokemonBaralho(nome, img, cp, treinador, tipo1, tipo2);
}

async function consultarDiretoComFetch() {
    const linhas = await listarBaralho();
    return linhas || [];
}

async function sqlDeletarPokemon(id) {
    const idNumerico = Number(id);
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) return 0;

    const linhas = await executarQueryNeon(
        'DELETE FROM BARALHO WHERE id = $1 RETURNING *',
        [idNumerico]
    );

    if (linhas === null) return null;
    return linhas.length;
}

module.exports = {
    LIMITE_BARALHO,
    listarBaralho,
    contarBaralho,
    salvarPokemonBaralho,
    insertPokemon,
    consultarDiretoComFetch,
    sqlDeletarPokemon,
    executarQueryNeon
};
