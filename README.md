# ⚡ Poke Finder

> Aplicação web leve e responsiva para buscar Pokémon via **PokeAPI** e gerar cards personalizados com estatísticas e dados do treinador.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PokeAPI](https://img.shields.io/badge/PokeAPI-EF5350?style=for-the-badge&logo=pokemon&logoColor=white)

---

## 📌 Demonstração & Visão Geral

O **Poke Finder** consome a PokeAPI em tempo real para permitir que o usuário crie e gerencie seus próprios cards de Pokémon sem a necessidade de banco de dados ou dependências externas.

### ✨ Funcionalidades Principais

- 🔍 **Busca Automática:** Consumo dinâmico da PokeAPI ao digitar ou selecionar um Pokémon.
- 📊 **Preenchimento Inteligente:** Preenche automaticamente o **tipo** e o **poder** (*Base Experience*).
- 🖼️ **Arte Oficial:** Exibe a sprite/imagem oficial do Pokémon no card.
- 🧢 **Personalização:** Campo para incluir o nome do treinador responsável pelo card.
- 🧮 **Contador Dinâmico:** Atualização em tempo real da quantidade de cards criados.
- 🧹 **Gestão Prática:** Botões para limpar formulário e remover cards individualmente ou em lote.
- 📱 **Totalmente Responsivo:** Interface otimizada tanto para telas mobile quanto desktop.

---

## 📂 Estrutura do Projeto

```text
├── index.html  # Estrutura e marcação da aplicação
├── style.css   # Estilização, variáveis e responsividade
└── script.js   # Lógica de consumo da API e manipulação do DOM
