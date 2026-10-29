const form = document.querySelector('#idformulario');
const nomeInput = document.querySelector('#nomePokemon');
const tipoInput = document.querySelector('#tipoPokemon');
const treinadorInput = document.querySelector('#treinadorPokemon');
const poderInput = document.querySelector('#poderPokemon');
const feedback = document.querySelector('#IdFeedback');
const listaCards = document.querySelector('#listaCards');
const contadorCards = document.querySelector('#contadorCards');
const estadoVazio = document.querySelector('#estadoVazio');
const statusBusca = document.querySelector('#statusBusca');

// const dadomockado = {name: 'pikachu', types: [ {slot: 1, type: {name: 'eletric'}}], sprites: {
//     front_default: './pikachu.png',
//     other: {
//         'official-artwork': {
//             front_default:'./pikachu.png'
//         }
//     }
// }, base_experience: '112'}

const URL_POKEAPI = 'https://pokeapi.co/api/v2/pokemon';
let debounceBusca;
let controladorBusca;
let pokemonAtual = null;

function mostrarFeedback(mensagem = '', tipo = '') {
  feedback.textContent = mensagem;
  feedback.className = `feedback ${tipo}`.trim();
}

function normalizarNome(nome) {
  return nome.toLowerCase().trim().replaceAll(' ', '-');
}

async function buscarDadosPokemon(nome) {
  controladorBusca?.abort();
  controladorBusca = new AbortController();
  const resposta = await fetch(`${URL_POKEAPI}/${normalizarNome(nome)}`, { signal: controladorBusca.signal });

  if (!resposta.ok) throw new Error('Pokémon não encontrado.');
  return resposta.json();
}

function extrairImagemPokemon(dados) {
  return dados?.sprites?.other?.['official-artwork']?.front_default
    || dados?.sprites?.front_default
    || '';
}

function extrairTiposPokemon(dados) {
  return (dados?.types || []).map(({ type }) => type.name).join(', ');
}

function extrairCombatPower(dados) {
  //base_experience é usado como poder
  return dados?.base_experience ?? 0;
}

function preencherFormulario(dados) {
  pokemonAtual = dados;
  nomeInput.value = dados.name;
  tipoInput.value = extrairTiposPokemon(dados);
  poderInput.value = extrairCombatPower(dados);
  statusBusca.className = 'status-busca success';
  mostrarFeedback('Dados preenchidos pela PokeAPI. Agora você pode cadastrar o Pokémon.', 'info');
}




async function completarDados(nome) {
  const nomeConsultado = nome.trim();
  if (nomeConsultado.length < 3) {
    pokemonAtual = null;
    tipoInput.value = '';
    poderInput.value = '';
    statusBusca.className = 'status-busca';
    mostrarFeedback('Digite pelo menos 3 caracteres para buscar.', 'info');
    return;
  }

  statusBusca.className = 'status-busca loading';
  mostrarFeedback('Buscando dados na PokeAPI…', 'info');

  try {
    const dados = /*dadomockado*/ await buscarDadosPokemon(nomeConsultado);
    if (normalizarNome(nomeInput.value) !== dados.name) return;
    preencherFormulario(dados);
  } catch (error) {
    if (error.name === 'AbortError') return;
    pokemonAtual = null;
    tipoInput.value = '';
    poderInput.value = '';
    statusBusca.className = 'status-busca error';
    mostrarFeedback('Não encontrei esse Pokémon. Confira o nome e tente novamente.', 'error');
  }
}

nomeInput.addEventListener('input', () => {
  pokemonAtual = null;
  tipoInput.value = '';
  poderInput.value = '';
  clearTimeout(debounceBusca);
  controladorBusca?.abort();
  statusBusca.className = 'status-busca';

  const valor = nomeInput.value.trim();
  if (valor.length < 3) {
    mostrarFeedback('Digite pelo menos 3 caracteres para buscar.', 'info');
    return;
  }

  debounceBusca = setTimeout(() => completarDados(valor), 550);
});

nomeInput.addEventListener('change', () => completarDados(nomeInput.value));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nome = nomeInput.value.trim();
  const treinador = treinadorInput.value.trim();

  if (nome.length < 3) {
    mostrarFeedback('O nome deve conter pelo menos 3 caracteres.', 'error');
    nomeInput.focus();
    return;
  }

  const idPokemon = normalizarNome(nome);
  if (verificarAntes(idPokemon)) {
    mostrarFeedback(`O Pokémon ${formatarNome(nome)} já está cadastrado na lista!`);
    return;
  }

  // Se o usuário clicar em cadastrar antes do debounce terminar, conclui a busca.
  if (!pokemonAtual || normalizarNome(nome) !== pokemonAtual.name) {
    try {
      mostrarFeedback('Finalizando a busca dos dados…', 'info');
      const dados = await buscarDadosPokemon(nome);
      preencherFormulario(dados);
    } catch {
      mostrarFeedback('Não foi possível cadastrar: Pokémon não encontrado na API.', 'error');
      return;
    }
  }

  criarCardPokemon({
    nome: pokemonAtual.name,
    imagem: extrairImagemPokemon(pokemonAtual),
    tipo: extrairTiposPokemon(pokemonAtual),
    combatPower: extrairCombatPower(pokemonAtual),
    treinador: treinadorInput.value,
    id: buscarDadosPokemon.id
    

    
  });

  mostrarFeedback(`${formatarNome(pokemonAtual.name)} foi cadastrado com sucesso!`, 'success');
  form.reset();
  tipoInput.value = '';
  poderInput.value = '';
  pokemonAtual = null;
  statusBusca.className = 'status-busca';
});

function formatarNome(nome) {
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function criarCardPokemon({ nome, imagem, tipo, combatPower, treinador, id }) {
  estadoVazio?.remove();

  const card = document.createElement('article');
  card.className = 'card-pokemon';
  card.id = normalizarNome(nome);

  const listaDeTiposDoPokemon = tipo.split(',').map(t => t.trim().toLowerCase());
  aplicarEstiloPorTipo(card, listaDeTiposDoPokemon);

  const img = document.createElement('img');
  img.src = imagem || 'https://placehold.co/180x180/171d35/cbd5e1?text=?';
  img.alt = `Imagem de ${formatarNome(nome)}`;
  img.loading = 'lazy';

  const nomeCard = document.createElement('h3');
  nomeCard.className = 'card-pokemon-nome';
  nomeCard.textContent = formatarNome(nome);

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const tipoBadge = document.createElement('p');
  tipoBadge.className = 'tipo-badge';
  tipoBadge.textContent = 'Tipo: ' + tipo || 'desconhecido';

  const cpBadge = document.createElement('span');
  cpBadge.className = 'cp-badge';
  cpBadge.textContent = `\n CP: ${combatPower || 0}`;
  meta.append(tipoBadge, cpBadge);

  const treinadorEl = document.createElement('span');
  treinadorEl.className = 'treinador';
  treinadorEl.textContent = treinador ? `Treinador: ${treinador}` : `Treinador: Sem Treinador`;

  const botaoDeletar = document.createElement('button');
  botaoDeletar.className = 'btn-deletar';
  botaoDeletar.textContent = 'Excluir';
  botaoDeletar.onclick = () => {
    card.remove();

    contadorCards.textContent = listaCards.querySelectorAll('.card-pokemon').length;
    mostrarFeedback(`${formatarNome(nome)} removido com sucesso!`);

  };


  card.append(img, nomeCard, meta, treinadorEl, botaoDeletar);

  listaCards.appendChild(card);
  contadorCards.textContent = listaCards.querySelectorAll('.card-pokemon').length;
}

function aplicarEstiloPorTipo(card, tipos) {
  const estiloCard = {
    normal: { borda: '#7f8c8d', fundo: '#ececec' },
    water: { borda: '#2980d9', fundo: '#dcecff' },
    grass: { borda: '#3a9d3a', fundo: '#26ff00' }, 
    electric: { borda: '#d4a800', fundo: '#fff7c2' },
    poison: { borda: '#8e44ad', fundo: '#ae00ff' },
    fire: { borda: '#e25822', fundo: '#ffe3d6' }
  };


  const listaTipos = (tipos);

  const estilo1 = estiloCard[listaTipos[0]];
  const estilo2 = estiloCard[listaTipos[1]];

  card.style.borderColor = estilo1.borda;

  if (estilo2) {
    card.style.background = `linear-gradient(135deg, ${estilo1.fundo} 50%, ${estilo2.fundo} 50%)`;
  } else {
    card.style.background = estilo1.fundo;
  }
}

document.querySelector('#botaolimpar').addEventListener('click', () => {
  clearTimeout(debounceBusca);
  controladorBusca?.abort();
  form.reset();
  pokemonAtual = null;
  listaCards.innerHTML = '';
  listaCards.appendChild(estadoVazio);
  contadorCards.textContent = '0';
  statusBusca.className = 'status-busca';
  mostrarFeedback('Formulário e cards limpos com sucesso.', 'success');
  nomeInput.focus();
});


function verificarAntes(id) {

  const verificarCards = document.querySelectorAll('.card-pokemon');
  console.log("Cards encontrados na tela:", verificarCards);


  let existe = Array.from(verificarCards).some(card => {
    console.log("Comparando card id:", card.id, "com o ID buscado:", id);
    return card.id === id;
  });

  console.log("O Pokémon já existe na lista?", existe);
  return existe;
}
