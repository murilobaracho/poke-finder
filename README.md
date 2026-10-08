# Poke Finder

Aplicação web estática para buscar Pokémon na [PokeAPI](https://pokeapi.co/) e criar cards personalizados com nome, tipo, poder, imagem e treinador.

## Funcionalidades

- Busca automática de Pokémon pela PokeAPI.
- Preenchimento automático do tipo e do poder/base experience.
- Criação de cards somente após o cadastro.
- Exibição da imagem oficial do Pokémon.
- Campo opcional para o nome do treinador.
- Contador de Pokémon cadastrados.
- Botão para limpar o formulário e remover todos os cards.
- Layout responsivo para computador e celular.
- Sem backend ou instalação de dependências.

## Arquivos

```text
index.html  # Estrutura da página
style.css   # Estilos e layout
script.js   # Integração com a PokeAPI e lógica dos cards
```

## Como executar localmente

Basta abrir o arquivo `index.html` no navegador. Para evitar restrições do navegador em alguns ambientes, também é possível iniciar um servidor local:

```bash
python3 -m http.server 8000
```

Depois, acesse <http://localhost:8000>.

## Publicar no GitHub Pages

1. Crie um repositório público chamado `poke-finder` no GitHub.
2. Envie `index.html`, `style.css`, `script.js` e `README.md` para a raiz do repositório.
3. Acesse **Settings > Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`.
6. Clique em **Save**.

O endereço ficará semelhante a:

```text
https://SEU-USUARIO.github.io/poke-finder/
```

## Observação sobre o poder

A PokeAPI não fornece um campo oficial de CP. Por isso, o projeto utiliza `base_experience` como valor de poder exibido no card.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- PokeAPI
