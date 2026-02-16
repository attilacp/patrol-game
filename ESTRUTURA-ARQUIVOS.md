ARQUIVO: README.md

LOCALIZAÇÃO: raiz do projeto

===============================================



\# PATROL - Quiz Multiplayer Otimizado



Sistema de quiz multiplayer em tempo real com Firebase.



\## 📦 Estrutura Otimizada



```

patrol-optimized/

├── index.html              # Página principal

├── css/

│   └── main.css           # CSS consolidado

└── js/

&nbsp;   ├── config.js          # Configurações Firebase e do jogo

&nbsp;   ├── utils.js           # Utilitários gerais

&nbsp;   ├── templates.js       # Templates HTML

&nbsp;   ├── auth.js            # Sistema de autenticação

&nbsp;   ├── teams.js           # Sistema de equipes

&nbsp;   ├── questions.js       # Sistema de perguntas (upload Excel)

&nbsp;   ├── rooms.js           # Sistema de salas multiplayer

&nbsp;   ├── game.js            # Lógica do jogo

&nbsp;   ├── events.js          # Event listeners

&nbsp;   └── init.js            # Inicialização

```



\## ✨ Melhorias na Otimização



\### 1. \*\*Consolidação de Arquivos\*\*

\- ❌ ANTES: ~100+ arquivos JavaScript

\- ✅ AGORA: 10 arquivos JavaScript organizados



\### 2. \*\*Redução de Código\*\*

\- Removidas duplicações

\- Funções consolidadas

\- Código minimalista e focado



\### 3. \*\*CSS Unificado\*\*

\- Um único arquivo CSS com variáveis CSS

\- Organização por seções

\- Responsivo por padrão



\### 4. \*\*Carregamento Simplificado\*\*

\- Ordem de carregamento clara

\- Sem dependências circulares

\- Inicialização automática



\### 5. \*\*Event Listeners Otimizados\*\*

\- Eventos adicionados uma única vez

\- Sem duplicações

\- Gerenciamento centralizado



\## 🚀 Como Usar



\### 1. Fazer Login

\- Email/Senha

\- ou Google



\### 2. Criar ou Entrar em Sala

\- \*\*Mestre\*\*: Cria sala e recebe código

\- \*\*Jogador\*\*: Digita código para entrar



\### 3. Configurar (Mestre)

\- Adicionar equipes

\- Carregar arquivo Excel de perguntas

\- Configurar recorrência

\- Iniciar jogo



\### 4. Jogar

\- Responder perguntas (C = Certo, E = Errado)

\- Primeira equipe a 15 pontos vence

\- Rodízio automático por regras



\## 📝 Formato do Arquivo Excel



Cada aba = um assunto diferente



| A (Enunciado) | B (Gabarito) | C (Comentário) | D (Comentário 2) | E (Comentário 3) |

|---------------|--------------|----------------|------------------|------------------|

| Nome do Assunto | Recorrência (baixa/media/alta) | - | - | - |

| Pergunta 1    | C ou E       | Explicação     | Detalhes         | Info extra       |

| Pergunta 2    | CERTO        | Explicação     | -                | -                |



\## 🎮 Regras do Jogo



\### Pontuação

\- ✅ Acerto: +1 ponto

\- ❌ Erro: 0 pontos

\- ⏭️ Pular: 0 pontos



\### Rodízio de Equipes

\- \*\*Erro\*\*: Roda para próxima equipe

\- \*\*5 acertos consecutivos\*\*: Roda para próxima equipe



\### Vitória

\- Primeira equipe a \*\*15 pontos\*\* vence



\## ⌨️ Atalhos de Teclado



\- `C` = Certo

\- `E` = Errado

\- `S` = Pular

\- `Enter` = Próxima / Pódio



\## 🔧 Configuração



Edite `js/config.js` para alterar:



```javascript

game: {

&nbsp;   winningScore: 15,              // Pontos para vencer

&nbsp;   consecutiveForRotation: 5,     // Consecutivos para rodar

&nbsp;   defaultRecurrence: 'alta'      // Recorrência padrão

}

```



\## 📊 Recursos



\- ✅ Multiplayer em tempo real (Firebase)

\- ✅ Upload de perguntas via Excel

\- ✅ Sistema de recorrência (baixa/media/alta)

\- ✅ Ordem aleatória de perguntas

\- ✅ Múltiplos comentários por pergunta

\- ✅ Pódio automático

\- ✅ Atalhos de teclado

\- ✅ Responsivo (mobile/tablet/desktop)



\## 🐛 Debug



No console do navegador, digite:

```javascript

patrolStatus()

```



Isso mostrará o status de todos os sistemas.



\## 📈 Performance



\### Tamanho dos Arquivos

\- \*\*CSS\*\*: ~8 KB (antes: ~50 KB em múltiplos arquivos)

\- \*\*JavaScript\*\*: ~60 KB total (antes: ~500 KB+)



\### Tempo de Carregamento

\- ✅ Inicialização em ~2 segundos

\- ✅ Sem delays perceptíveis

\- ✅ Transições suaves entre telas



\## 🔒 Segurança



\- Autenticação via Firebase

\- Validação de códigos de sala

\- Separação Mestre/Jogador

\- Dados sincronizados em tempo real



\## 📱 Compatibilidade



\- ✅ Chrome/Edge (recomendado)

\- ✅ Firefox

\- ✅ Safari

\- ✅ Mobile (iOS/Android)



\## 💡 Dicas



1\. \*\*Mestre\*\*: Sempre use conexão estável

2\. \*\*Perguntas\*\*: Mantenha enunciados claros

3\. \*\*Equipes\*\*: Nomes curtos funcionam melhor

4\. \*\*Excel\*\*: Não deixe células vazias no meio



\## 🔄 Próximas Melhorias Possíveis



\- \[ ] Sistema de notas por pergunta

\- \[ ] Estatísticas detalhadas

\- \[ ] Exportar resultados

\- \[ ] Timer por pergunta

\- \[ ] Perguntas bomba

\- \[ ] Chat entre jogadores

\- \[ ] Sons e notificações



\## 📄 Licença



Uso educacional e interno.



---



\*\*Desenvolvido para PRF-CE\*\* 🇧🇷

