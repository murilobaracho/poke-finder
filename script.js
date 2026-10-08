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

  const resposta = await fetch(
    `${URL_POKEAPI}/${normalizarNome(nome)}`,
    { signal: controladorBusca.signal }
  );

  if (!resposta.ok) {
    throw new Error('Pokémon não encontrado.');
  }

  return resposta.json();
}

function extrairImagemPokemon(dados) {
  return dados?.sprites?.other?.['official-artwork']?.front_default
    || dados?.sprites?.front_default
    || '';
}

function extrairTiposPokemon(dados) {
  return (dados?.types || []).map(({ type }) => type.name);
}

function extrairCombatPower(dados) {
  // A PokeAPI não possui CP oficial; base_experience será usado como poder.
  return dados?.base_experience ?? 0;
}

function formatarNome(nome) {
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function preencherFormulario(dados) {
  pokemonAtual = dados;
  nomeInput.value = dados.name;
  tipoInput.value = extrairTiposPokemon(dados).join(' / ');
  poderInput.value = extrairCombatPower(dados);
  statusBusca.className = 'status-busca success';
  mostrarFeedback(
    'Dados preenchidos pela PokeAPI. Agora você pode cadastrar o Pokémon.',
    'info'
  );
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
    const dados = await buscarDadosPokemon(nomeConsultado);

    if (normalizarNome(nomeInput.value) !== dados.name) {
      return;
    }

    preencherFormulario(dados);
  } catch (error) {
    if (error.name === 'AbortError') return;

    pokemonAtual = null;
    tipoInput.value = '';
    poderInput.value = '';
    statusBusca.className = 'status-busca error';
    mostrarFeedback(
      'Não encontrei esse Pokémon. Confira o nome e tente novamente.',
      'error'
    );
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

nomeInput.addEventListener('change', () => {
  completarDados(nomeInput.value);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nome = nomeInput.value.trim();
  const treinador = treinadorInput.value.trim();

  if (nome.length < 3) {
    mostrarFeedback('O nome deve conter pelo menos 3 caracteres.', 'error');
    nomeInput.focus();
    return;
  }

  // Garante a busca mesmo se o usuário clicar antes do debounce terminar.
  if (!pokemonAtual || normalizarNome(nome) !== pokemonAtual.name) {
    try {
      mostrarFeedback('Finalizando a busca dos dados…', 'info');
      const dados = await buscarDadosPokemon(nome);
      preencherFormulario(dados);
    } catch {
      mostrarFeedback(
        'Não foi possível cadastrar: Pokémon não encontrado na API.',
        'error'
      );
      return;
    }
  }

  criarCardPokemon({
    nome: pokemonAtual.name,
    imagem: extrairImagemPokemon(pokemonAtual),
    tipos: extrairTiposPokemon(pokemonAtual),
    combatPower: extrairCombatPower(pokemonAtual),
    treinador
  });

  mostrarFeedback(
    `${formatarNome(pokemonAtual.name)} foi cadastrado com sucesso!`,
    'success'
  );

  form.reset();
  tipoInput.value = '';
  poderInput.value = '';
  pokemonAtual = null;
  statusBusca.className = 'status-busca';
});

function criarCardPokemon({ nome, imagem, tipos, combatPower, treinador }) {
  estadoVazio?.remove();

  const card = document.createElement('article');
  card.className = 'card-pokemon';

  const img = document.createElement('img');
  img.src = imagem || 'https://placehold.co/180x180/171d35/cbd5e1?text=?';
  img.alt = `Imagem de ${formatarNome(nome)}`;
  img.loading = 'lazy';

  const nomeCard = document.createElement('h3');
  nomeCard.className = 'card-pokemon-nome';
  nomeCard.textContent = formatarNome(nome);

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const tipoBadge = document.createElement('span');
  tipoBadge.className = 'tipo-badge';
  tipoBadge.textContent = tipos.length ? `Tipo: ${tipos.join(' / ')}` : 'Tipo: desconhecido';

  const cpBadge = document.createElement('span');
  cpBadge.className = 'cp-badge';
  cpBadge.textContent = `CP: ${combatPower || 0}`;

  meta.append(tipoBadge, cpBadge);
  card.append(img, nomeCard, meta);

  const treinadorEl = document.createElement('span');
  treinadorEl.className = 'treinador';
  treinadorEl.textContent = `Treinador: ${treinador || 'Sem treinador'}`;
  card.appendChild(treinadorEl);

  aplicarEstiloPorTipo(card, tipos);
  listaCards.appendChild(card);
  contadorCards.textContent = listaCards.querySelectorAll('.card-pokemon').length;
}

function aplicarEstiloPorTipo(card, tipos) {
  const estiloCard = {
    normal: { borda: '#7f8c8d', fundo: '#ececec' },
    water: { borda: '#2980d9', fundo: '#dcecff' },
    grass: { borda: '#3a9d3a', fundo: '#dff7df' },
    electric: { borda: '#d4a800', fundo: '#fff7c2' },
    poison: { borda: '#8e44ad', fundo: '#ead7f2' },
    fire: { borda: '#e25822', fundo: '#ffe3d6' },
    flying: { borda: '#8194c7', fundo: '#e8edff' },
    bug: { borda: '#7aa329', fundo: '#eff8cf' },
    fairy: { borda: '#d66b9b', fundo: '#ffe5f1' },
    fighting: { borda: '#b34b36', fundo: '#f8d8d1' },
    ground: { borda: '#ad8b45', fundo: '#f4e6c7' },
    rock: { borda: '#8d7b4f', fundo: '#e9e1cc' },
    ghost: { borda: '#67518f', fundo: '#e5dcf5' },
    steel: { borda: '#6f8094', fundo: '#e3e9ef' },
    ice: { borda: '#54aebd', fundo: '#d9f7fb' },
    dragon: { borda: '#6250bd', fundo: '#dfdafa' },
    dark: { borda: '#4d4b58', fundo: '#dedde2' }
  };

  const primeiroEstilo = estiloCard[tipos[0]] || estiloCard.normal;
  const segundoEstilo = estiloCard[tipos[1]];

  card.style.borderColor = primeiroEstilo.borda;

  if (segundoEstilo) {
    card.style.background = `linear-gradient(135deg, ${primeiroEstilo.fundo} 50%, ${segundoEstilo.fundo} 50%)`;
  } else {
    card.style.background = primeiroEstilo.fundo;
  }
}

document.querySelector('#botaolimpar').addEventListener('click', () => {
  clearTimeout(debounceBusca);
  controladorBusca?.abort();
  form.reset();
  pokemonAtual = null;
  listaCards.innerHTML = '';

  if (estadoVazio) {
    listaCards.appendChild(estadoVazio);
  }

  contadorCards.textContent = '0';
  statusBusca.className = 'status-busca';
  mostrarFeedback('Formulário e cards limpos com sucesso.', 'success');
  nomeInput.focus();
});
