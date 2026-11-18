# Milionário em 3 passos

A folha **"Se torne um milionário em 3 passos"** para o aluno preencher, na tela, com os números dele: trocar uma marca, diminuir um hábito e diminuir um gasto recorrente. Tudo é calculado sozinho, enquanto o aluno digita: a **economia mensal** de cada etapa sai dos números que ele escreve, vira um **aporte mensal**, e a folha calcula quanto ele vira investido a **10% ao ano** até os **65 anos** (a mesma conta da Calculadora Financeira). O valor total é a soma das 3 etapas.

- **A folha** (`index.html`): a idade (e quanto falta pros 65 anos), as 3 etapas da folha original, cada uma num cartão, e o valor total economizado no fim. Veja [A folha](#a-folha).
- **O login** é o mesmo da Teoria das caixas, do Fluxo de Caixa e das Escolhas da Vanessa e da Karine, com o mesmo banco (Supabase): quem já tem conta lá entra aqui com o mesmo e-mail e a mesma senha. O que o aluno escreve fica guardado na conta dele. Veja [O login e o banco](#o-login-e-o-banco).

Não tem build nem instalação: é uma página `.html` + alguns arquivos `.js` e `.css` estáticos, na identidade visual da Financial Experts (a mesma da Teoria das caixas). Para rodar, basta publicar a pasta no GitHub Pages (ou abrir o `index.html` no navegador, com internet, por causa do login).

---

## A folha

1. **A abertura.** O título, o que fazer e, ao lado, as 3 etapas (cada uma leva até o cartão dela e ganha o selo verde quando fica completa). Embaixo, como preencher em 3 passos: a idade, as etapas, com os preços de hoje, e as economias (calculadas sozinhas).

2. **Até os 65 anos.** Antes das etapas, o aluno escreve a **idade**, e a folha calcula o **tempo investido** até os 65 anos, em anos e em meses (os períodos da conta). Do lado, a **taxa de juros**: 10% ao ano, que na conta mensal vira 0,7974% ao mês. (As folhas antigas, que guardavam "quanto falta pros 65 anos", viram a idade sozinhas ao abrir.)

3. **As 3 etapas.** Um cartão por etapa, na cor dela, com a faixa da folha à esquerda ("Etapa 1", o número grande e o desenho) e os campos à direita, com os mesmos rótulos da folha original:

   | Etapa | Os campos |
   | --- | --- |
   | 1. Trocando uma marca (azul) | Produto, Nova marca, Consumo mensal (uma estimativa, em unidades), Preço atual → Novo preço (3 produtos) |
   | 2. Diminuindo um hábito (dourada) | Hábito a reduzir, Frequência atual (por semana), Nova frequência (por semana), Custo médio por ocorrência |
   | 3. Diminuindo um gasto recorrente (roxa) | Gasto recorrente, Valor mensal atual, Possível alternativa / cancelamento |

   Toda etapa termina com os **resultados**, em verde, calculados sozinhos a cada tecla: a **Economia mensal** (o aporte mensal) e o **Investido até os 65 anos**. Embaixo, a conta por extenso, pra o aluno ver de onde o número saiu. Enquanto falta alguma coisa, a caixa diz o quê.

   | Etapa | A economia mensal |
   | --- | --- |
   | 1. Trocando uma marca | a soma, nos produtos preenchidos, de consumo × (preço atual − novo preço); cada produto mostra a conta dele embaixo |
   | 2. Diminuindo um hábito | (frequência atual − nova frequência) × custo por ocorrência × 4 semanas (`SEMANAS`) |
   | 3. Diminuindo um gasto recorrente | o valor mensal atual inteiro (o gasto é cancelado) |

   Cada campo tem a marca de preenchido (o círculo da folha), que fica verde quando o aluno escreve alguma coisa. O cartão mostra quantos campos da etapa já foram preenchidos e, com todos, vira "Etapa completa".

   Nos campos de dinheiro, só entram números: os pontos de milhar aparecem sozinhos enquanto o aluno digita ("1800" vira "1.800") e, ao sair do campo, o número se completa ("1.800,00"). A frequência, o consumo e a idade aceitam só algarismos.

4. **O valor total economizado.** No pé da folha, como na original: a soma do que as 3 etapas viram até os 65 anos (das etapas que já têm a economia mensal), com o aporte total por mês embaixo.

**A conta** (`frontend/js/juros.js`) é a da Calculadora Financeira, com a função dela (`backend/js/finance.js`, cópia idêntica): juros compostos por período, com o aporte no fim de cada período, `VF = PMT × ((1 + i)^n − 1) / i`. O aporte é mensal, então o período é o mês: `n` = anos até os 65 × 12 e `i` = a taxa ao mês equivalente a 10% ao ano, `(1,10)^(1/12) − 1`, arredondada em 4 casas como a Calculadora Financeira aceita: **0,7974% ao mês**. Assim, digitando na Calculadora Financeira (01 Valor final) a taxa e os meses que a folha mostra, sai o mesmo valor, centavo por centavo. Por exemplo, R$ 100 por mês por 30 anos (0,7974% · 360 períodos · parcela R$ 100) dão **R$ 206.276,99** nas duas. Os valores calculados não ficam guardados: saem de novo do que o aluno escreveu toda vez.

Enquanto o aluno preenche, dois medidores ficam grudados no alto: quantas etapas estão completas e quantos campos já foram preenchidos (são 23, contando a idade). Ao lado do título "A sua folha", um aviso mostra onde ela está guardada: **Salvo na sua conta**, **Salvando…** ou **Salvo só neste navegador** (com o motivo ao parar o mouse em cima).

A página não tem botão de imprimir. Quem imprimir pelo menu do navegador (Ctrl+P) recebe só a folha "Se torne um milionário em 3 passos", do jeito da original, numa página A4: o título, o nome do aluno e o mês, a idade, o tempo investido e a taxa, uma caixa por etapa (com a economia mensal e o valor até os 65 anos) e o valor total no pé (com as cores do tema claro, mesmo com o tema escuro ligado).

**Apagar a folha** apaga tudo (na conta e no navegador) e começa de novo (pergunta antes).

---

## O login e o banco

A página abre numa tela de **Entrar / Criar conta**, a mesma da Teoria das caixas e do Fluxo de Caixa, e com o **mesmo banco**: o projeto Supabase `xorqsuqjmvkyzgagdxfz`, em [`frontend/js/config.js`](frontend/js/config.js). Quem já tem conta lá entra com o mesmo e-mail e a mesma senha, e quem cria a conta aqui também pode usar ela lá. A folha só aparece depois que o aluno entra. No alto, ficam o nome dele e o botão **Sair**.

- **Criar conta** pede o nome completo, o e-mail e uma senha de pelo menos 6 caracteres. O nome vai pros dados do login e pra tabela `profiles` (a mesma dos outros sistemas).
- **Continuar com o Google**, no alto de Entrar e de Criar conta, entra com a conta do Google, sem senha. Quem ainda não tem conta ganha uma na hora, com o nome do Google (que também vai pra `profiles`), e quem já tem conta com o mesmo e-mail entra nela mesma.
- **Esqueceu a senha?** manda um link pro e-mail, que volta pra esta página.
- **Sair** volta pra tela de entrar.

### A tabela das folhas

A folha de cada aluno fica na tabela **`worksheets`**, no mesmo Supabase (já criada): uma linha por aluno e por folha, separadas pela coluna `sheet` (aqui, `milionario-3-passos`), do mesmo jeito que a `game_scores` separa os jogos. Outra folha preenchível dos sistemas pode usar a mesma tabela, com outro nome em `sheet`.

| Coluna | O que guarda |
| --- | --- |
| `user_id` | o aluno (a conta do login); com `sheet`, é a chave da linha |
| `sheet` | qual folha (`milionario-3-passos`) |
| `player_name` | o nome que o aluno cadastrou no login (pra achar no painel) |
| `data` | o que o aluno escreveu: `{ "id do campo": "texto" }` (os ids estão no `backend/js/etapas.js`) |
| `updated_at` | quando a folha mudou pela última vez |

Cada aluno só lê, grava e apaga a própria folha (RLS), e só quem está logado acessa a tabela.

Sem acesso à tabela (ou sem internet), a folha funciona igual: ela fica guardada só naquele navegador, e o aviso no alto diz **Salvo só neste navegador** (com o motivo ao parar o mouse em cima). Quando o banco voltar, a folha vai pra ele ao abrir a página de novo.

Como a folha é guardada:

- Ela fica **no banco e no navegador**: abre na hora, sem esperar o banco. Ao abrir, vale a mais nova das duas (quem preencheu em outro computador vê a folha de lá).
- A cada mudança, a folha vai pro banco um instante depois que o aluno para de digitar (e na hora, se ele fechar a página antes).

Pra os links do e-mail (trocar a senha, confirmar a conta) voltarem pra este sistema, o endereço dele tem que estar em **Authentication → URL Configuration → Redirect URLs**, no painel do Supabase (no GitHub Pages, algo como `https://financialexperts.github.io/Milionario-em-3-Passos/**`).

O **Continuar com o Google** volta pelo mesmo endereço, então também depende dessa lista. E o Google precisa estar ligado em **Authentication → Sign In / Providers → Google**, com o Client ID e o Client Secret de um cliente OAuth do Google Cloud (que tem que ter `https://xorqsuqjmvkyzgagdxfz.supabase.co/auth/v1/callback` em *URIs de redirecionamento autorizados*). Enquanto ele estiver desligado, o botão só avisa que o login com o Google ainda não está disponível.

---

## Estrutura de arquivos

```
index.html                      a folha: abertura, a idade e o tempo até os 65 anos, as 3 etapas,
                                o valor total e a folha impressa
frontend/
  css/styles.css                o visual da Financial Experts (o mesmo da Teoria das
                                caixas): cores, cartões, botões, medidores e o login
  css/passos.css                o visual que é só desta folha, e a folha impressa
  img/                          logos e favicon
  js/config.js                  o projeto Supabase do login (o mesmo dos outros sistemas)
  js/supabaseClient.js          liga o cliente do Supabase
  js/auth.js                    a tela de entrar / criar conta / esqueci a senha
  js/google-auth.js             o botão "Continuar com o Google" (a mesma cópia em todos os sistemas)
  js/session.js                 o login: qual tela aparece, quem entrou, o botão de sair;
                                a folha só começa depois dele
  js/ui.js                      tema claro/escuro, o brilho do vidro e as animações dos
                                ícones
  js/format.js                  formatação de dinheiro, da taxa e do mês
  js/icons.js                   os desenhos dos ícones (e os das 3 etapas)
  js/parse.js                   lê o número que o aluno digitou num campo de dinheiro
  js/mask.js                    a máscara dos campos de dinheiro: os pontos de milhar
                                enquanto o aluno digita
  js/juros.js                   a conta: quanto o aporte mensal vira até os 65 anos
  js/sheet.js                   o estado da folha: o que o aluno escreveu, o que já foi
                                preenchido e o guardar no navegador
  js/sync.js                    o guardar no banco (tabela worksheets)
  js/sheet-view.js              a idade, as etapas, os campos, as contas automáticas,
                                os medidores e a folha impressa
  js/sheet-app.js               liga tudo: abrir e apagar
backend/
  js/etapas.js                  as 3 etapas (títulos, campos, rótulos, exemplos e a
                                conta da economia mensal de cada uma), a idade e a taxa
  js/finance.js                 a conta de juros compostos (cópia idêntica da
                                Calculadora Financeira)
```

Os arquivos em `backend/js/` não tocam no DOM: são os dados e as contas. O `sheet.js`, o `sync.js`, o `parse.js`, o `mask.js` e o `juros.js` também não: os primeiros guardam o que o aluno escreveu e o `juros.js` faz a conta; a tela só lê deles.

Os ícones se mexem quando o mouse passa, quando o aluno toca neles ou quando recebem o foco do teclado. Quem pede menos movimento no sistema operacional não vê animação nenhuma.

---

## Onde mexer para mudar cada coisa

| Para mudar… | Edite |
| --- | --- |
| Os títulos, os rótulos, os exemplos e o texto de cada etapa | `LIST`, em `backend/js/etapas.js` |
| Um campo a mais ou a menos | `rows` da etapa, em `backend/js/etapas.js` (o `id` de um campo que já existe não deve mudar: o que os alunos escreveram nele se perde) |
| A taxa de juros (10% ao ano) | `TAXA`, em `backend/js/etapas.js` (os textos da página acompanham) |
| O campo da idade e a idade final (65) | `IDADE` e `LIMITE`, em `backend/js/etapas.js` |
| A conta da economia mensal de cada etapa | `economiaMarca()`, `economiaHabito()` e `economiaGasto()`, em `backend/js/etapas.js` (as semanas do mês: `SEMANAS`) |
| A conta do valor até os 65 anos | `futuro()` e `aoMes()`, no `frontend/js/juros.js` (a fórmula é a `futureValue()` do `backend/js/finance.js`; se ela mudar na Calculadora Financeira, copie de novo) |
| O valor total | `TOTAL`, em `backend/js/etapas.js`, e `syncContas()`, no `frontend/js/sheet-view.js` |
| As cores das etapas | `.etapa--1`, `.etapa--2` e `.etapa--3`, no começo do `frontend/css/passos.css` |
| Os desenhos das etapas | `troca`, `hamburguer` e `assinatura`, no `frontend/js/icons.js` |
| O aviso de onde a folha está guardada | `STATUS`, no `frontend/js/sheet-view.js` |
| A folha impressa | `sheetHTML()`, no `frontend/js/sheet-view.js`, e o fim do `frontend/css/passos.css` |
| A tabela e o nome da folha no banco | `TABLE` e `SHEET`, no `frontend/js/sync.js` |
| Quanto esperar depois da última tecla pra mandar pro banco | `WAIT`, no `frontend/js/sync.js` |
| **Login:** o projeto Supabase | `frontend/js/config.js` |
| Os textos da tela de entrar e as mensagens de erro | `markup()` e `friendlyError()`, no `frontend/js/auth.js` |
| Os textos fixos (título, como preencher, rodapé) | o `index.html` |

---

## O que fica guardado

- **A folha**, no banco (tabela `worksheets`) e no navegador, na chave `milionario-3-passos:` + o id da conta. Num computador compartilhado, cada aluno vê só a folha dele.
- **O tema** claro ou escuro, na chave `tema` (a mesma da Teoria das caixas, do Fluxo de Caixa e das Escolhas da Vanessa e da Karine: publicados no mesmo endereço, os sistemas lembram do mesmo tema).
- **A sessão do login**, guardada pelo próprio Supabase.

Numa janela anônima (ou com o armazenamento bloqueado), tudo funciona igual; a folha continua indo pro banco.
