(function (global) {
  "use strict";

  // As 3 etapas da folha "Se torne um milionário em 3 passos", na ordem da
  // folha, a idade do aluno (antes delas), a taxa de juros e o valor total
  // economizado no fim. A tela (sheet-view.js), a folha impressa e o que
  // fica guardado (sheet.js) leem daqui, então os títulos, os rótulos, os
  // exemplos e as contas de cada etapa mudam aqui.
  //
  // Cada etapa: key (o nome no código), num, title, icon (o desenho, em
  // icons.js), lead (o que o aluno faz nela), rows (as linhas da folha) e
  // economia(n), a conta da economia mensal (veja "as economias", embaixo).
  // Cada linha: kind ("produto", "linha" ou "resultado", o jeito de pôr os
  // campos lado a lado) e fields. O resultado não tem campo: só o que a
  // folha calcula (a economia mensal e quanto ela vira até os 65 anos).
  //
  // Cada campo: id (a chave no que fica guardado: não mude depois que os
  // alunos começarem, senão o que eles escreveram se perde), label, hint (o
  // pedaço do rótulo em letra normal, como "(por semana)"), sr (o resto do
  // rótulo pra quem usa leitor de tela, quando o rótulo se repete: "Preço
  // atual do produto 2"), type ("text", "money" ou "count"), placeholder,
  // max (quantas letras cabem) e:
  //   arrow:  a seta "→" antes do campo ("Preço atual → Novo preço")
  //   unit:   a palavra depois do número, nos campos "count"

  // quantas semanas a folha conta num mês (a conta do hábito)
  var SEMANAS = 4;

  // a idade em que os aportes param: até lá o dinheiro fica investido
  var LIMITE = 65;

  function produto(n, ex) {
    var p = "marca_p" + n + "_";
    return {
      kind: "produto",
      produto: n,
      fields: [
        { id: p + "produto", label: "Produto " + n, type: "text", placeholder: "Ex.: " + ex },
        { id: p + "marca", label: "Nova marca", sr: "do produto " + n, type: "text", placeholder: "A marca mais barata" },
        { id: p + "consumo", label: "Consumo mensal", sr: "do produto " + n + ", uma estimativa", type: "count", unit: "un." },
        { id: p + "atual", label: "Preço atual", sr: "do produto " + n, type: "money" },
        { id: p + "novo", label: "Novo preço", sr: "do produto " + n, type: "money", arrow: true }
      ]
    };
  }

  // o fim de cada etapa: a economia por mês (o aporte mensal) e quanto ela
  // vira até os 65 anos. As duas a folha calcula sozinha.
  function economia(key) {
    return {
      kind: "resultado",
      fields: [],
      calcs: [
        { id: key + "_mensal", label: "Economia mensal", hint: "(o seu aporte)", icon: "calendario" },
        { id: key + "_65", label: "Investido até os " + LIMITE + " anos", icon: "cofrinho" }
      ]
    };
  }

  /* ============ as economias ============ */
  // Cada etapa calcula a própria economia mensal com o que o aluno escreveu.
  // n(id) é o número do campo (null enquanto ele está vazio). Devolve
  // { valor, falta, conta }: valor é a economia por mês (null enquanto falta
  // alguma coisa, e falta diz o quê); conta é a conta escrita por extenso,
  // pra o aluno ver de onde o número saiu.
  function money(v) { return global.Format.money(v); }

  // um produto da etapa 1: consumo × (preço atual − novo preço)
  function economiaProduto(n, k) {
    var p = "marca_p" + k + "_";
    var consumo = n(p + "consumo"), atual = n(p + "atual"), novo = n(p + "novo");
    if (consumo === null && atual === null && novo === null) return { vazio: true, valor: null };
    var faltam = [];
    if (consumo === null) faltam.push("o consumo mensal");
    if (atual === null) faltam.push("o preço atual");
    if (novo === null) faltam.push("o novo preço");
    if (faltam.length) {
      return { valor: null, falta: "Falta " + faltam.join(", ").replace(/, ([^,]*)$/, " e $1") + "." };
    }
    var valor = consumo * (atual - novo);
    return {
      valor: valor,
      conta: consumo + " un. × (" + money(atual) + " − " + money(novo) + ") = " + money(valor) + " por mês" +
        (valor < 0 ? " (a marca nova está mais cara)" : "")
    };
  }

  function economiaMarca(n) {
    var soma = 0, algum = false, partes = [];
    [1, 2, 3].forEach(function (k) {
      var c = economiaProduto(n, k);
      if (c.valor === null) return;
      algum = true;
      soma += c.valor;
      partes.push(money(c.valor));
    });
    if (!algum) return { valor: null, falta: "Preencha o consumo e os preços de um produto" };
    if (soma < 0) return { valor: null, falta: "Os novos preços estão mais caros que os de hoje" };
    return { valor: soma, conta: partes.length > 1 ? partes.join(" + ") + " = " + money(soma) + " por mês" : "" };
  }

  // o hábito: (vezes por semana hoje − vezes por semana depois) × custo de
  // cada vez × 4 semanas
  function economiaHabito(n) {
    var atual = n("habito_frequencia"), nova = n("habito_nova"), custo = n("habito_custo");
    if (atual === null || nova === null || custo === null) {
      return { valor: null, falta: "Preencha a frequência atual, a nova e o custo" };
    }
    if (nova > atual) return { valor: null, falta: "A nova frequência precisa ser menor que a atual" };
    var valor = (atual - nova) * custo * SEMANAS;
    return {
      valor: valor,
      conta: "(" + atual + " − " + nova + ") vezes por semana × " + money(custo) + " × " + SEMANAS + " semanas = " + money(valor) + " por mês"
    };
  }

  // o gasto recorrente: cancelando, a economia é o valor mensal inteiro
  function economiaGasto(n) {
    var valor = n("gasto_valor");
    if (valor === null) return { valor: null, falta: "Preencha o valor mensal atual" };
    return { valor: valor, conta: "Cancelando, você deixa de pagar " + money(valor) + " todo mês" };
  }

  var LIST = [
    {
      key: "marca",
      num: 1,
      title: "Trocando uma marca",
      icon: "troca",
      lead: "Escolha 3 produtos que você compra sempre e troque cada um por uma marca mais barata. Escreva quantos você usa por mês (uma estimativa), o preço de hoje e o preço da marca nova: a economia sai sozinha.",
      rows: [
        produto(1, "café"),
        produto(2, "sabão em pó"),
        produto(3, "refrigerante"),
        economia("marca")
      ],
      economia: economiaMarca
    },
    {
      key: "habito",
      num: 2,
      title: "Diminuindo um hábito",
      icon: "hamburguer",
      lead: "Escolha um hábito que pesa no bolso porque se repete toda semana, como o lanche fora ou o delivery: quantas vezes por semana ele acontece hoje, quantas vezes vai passar a acontecer e quanto custa cada vez. O mês conta como " + SEMANAS + " semanas.",
      rows: [
        {
          kind: "linha",
          fields: [
            { id: "habito_nome", label: "Hábito a reduzir", type: "text", placeholder: "Ex.: lanche fora, delivery, café na padaria" }
          ]
        },
        {
          kind: "linha",
          fields: [
            { id: "habito_frequencia", label: "Frequência atual", hint: "(por semana)", type: "count", unit: "vezes", max: 3 },
            { id: "habito_nova", label: "Nova frequência", hint: "(por semana)", type: "count", unit: "vezes", max: 3 },
            { id: "habito_custo", label: "Custo médio por ocorrência", type: "money" }
          ]
        },
        economia("habito")
      ],
      economia: economiaHabito
    },
    {
      key: "gasto",
      num: 3,
      title: "Diminuindo um gasto recorrente",
      icon: "assinatura",
      lead: "Escolha uma conta que vem todo mês, como uma assinatura ou um serviço, e cancele: a economia é o valor mensal inteiro.",
      rows: [
        {
          kind: "linha",
          fields: [
            { id: "gasto_nome", label: "Gasto recorrente", hint: "(ex.: assinatura, serviço)", type: "text", placeholder: "Ex.: streaming, academia, plano do celular" }
          ]
        },
        {
          kind: "linha",
          fields: [
            { id: "gasto_valor", label: "Valor mensal atual", type: "money" },
            { id: "gasto_alternativa", label: "Possível alternativa / cancelamento", type: "text", placeholder: "Ex.: cancelar, um plano mais barato" }
          ]
        },
        economia("gasto")
      ],
      economia: economiaGasto
    }
  ];

  // a idade do aluno: quanto falta pros 65 anos é o tempo que os aportes
  // ficam investidos (o primeiro campo da folha, antes das etapas)
  var IDADE = { id: "idade", label: "Sua idade", type: "count", unit: "anos", max: 2 };

  // a taxa de juros dos aportes, ao ano: 10%
  var TAXA = 0.10;

  // o valor total economizado, no pé da folha: a soma do que as 3 etapas
  // viram até os 65 anos (a folha calcula; não fica guardado)
  var TOTAL = { label: "Valor total economizado" };

  // quantas letras cabem em cada tipo de campo, quando o campo não diz
  var MAX = { text: 60, money: 16, count: 3 };

  /* ============ os campos ============ */
  var byId = {};
  var ofEtapa = {};

  LIST.forEach(function (e) {
    ofEtapa[e.key] = [];
    e.rows.forEach(function (row) {
      if (row.calcs) e.calc = { mensal: row.calcs[0].id, valor: row.calcs[1].id };
      row.fields.forEach(function (f) {
        f.max = f.max || MAX[f.type];
        f.etapa = e.key;
        byId[f.id] = f;
        ofEtapa[e.key].push(f.id);
      });
    });
  });
  byId[IDADE.id] = IDADE;

  var ALL = LIST.reduce(function (ids, e) { return ids.concat(ofEtapa[e.key]); }, [IDADE.id]);

  function byKey(key) {
    return LIST.filter(function (e) { return e.key === key; })[0] || null;
  }

  global.Etapas = {
    list: LIST,
    idade: IDADE,
    limite: LIMITE,
    semanas: SEMANAS,
    taxa: TAXA,
    total: TOTAL,
    byKey: byKey,
    economiaProduto: economiaProduto,
    field: function (id) { return byId[id] || null; },
    idsOf: function (key) { return ofEtapa[key] || []; },
    allIds: function () { return ALL; }
  };
})(window);
