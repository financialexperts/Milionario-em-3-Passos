(function (global) {
  "use strict";

  // As 3 etapas da folha "Se torne um milionário em 3 passos", na ordem da
  // folha, o prazo até os 65 anos (antes delas), a taxa de juros e o valor
  // total economizado no fim. A tela (sheet-view.js), a folha impressa e o
  // que fica guardado (sheet.js) leem daqui, então os títulos, os rótulos e
  // os exemplos mudam aqui.
  //
  // Cada etapa: key (o nome no código), num, title, icon (o desenho, em
  // icons.js), lead (o que o aluno faz nela) e rows, as linhas da folha.
  // Cada linha: kind ("produto", "linha" ou "resultado", o jeito de pôr os
  // campos lado a lado), fields e, no resultado, calc: o que a folha
  // calcula (quanto a economia mensal vira até os 65 anos; from é o id da
  // economia mensal).
  //
  // Cada campo: id (a chave no que fica guardado: não mude depois que os
  // alunos começarem, senão o que eles escreveram se perde), label, hint (o
  // pedaço do rótulo em letra normal, como "(por semana)"), sr (o resto do
  // rótulo pra quem usa leitor de tela, quando o rótulo se repete: "Preço
  // atual do produto 2"), type ("text", "money" ou "count"), placeholder,
  // max (quantas letras cabem) e:
  //   arrow:  a seta "→" antes do campo ("Preço atual → Novo preço")
  //   result: a economia mensal, que o aluno calcula e escreve (fica
  //           verde). Ela vira o aporte mensal; quanto ele vira até os 65
  //           anos, a folha calcula (juros.js).
  //   icon:   o desenho do lado do rótulo (só nos resultados)
  //   unit:   a palavra depois do número, nos campos "count"

  function produto(n, ex) {
    var p = "marca_p" + n + "_";
    return {
      kind: "produto",
      fields: [
        { id: p + "produto", label: "Produto " + n, type: "text", placeholder: "Ex.: " + ex },
        { id: p + "marca", label: "Nova marca", sr: "do produto " + n, type: "text", placeholder: "A marca mais barata" },
        { id: p + "consumo", label: "Consumo mensal", sr: "do produto " + n + ", uma estimativa", type: "count", unit: "un." },
        { id: p + "atual", label: "Preço atual", sr: "do produto " + n, type: "money" },
        { id: p + "novo", label: "Novo preço", sr: "do produto " + n, type: "money", arrow: true }
      ]
    };
  }

  // o fim de cada etapa: a economia por mês, que o aluno escreve e vira o
  // aporte mensal, e quanto ela vira até os 65 anos, que a folha calcula
  function economia(key) {
    return {
      kind: "resultado",
      fields: [
        { id: key + "_mensal", label: "Economia mensal", hint: "(o seu aporte)", type: "money", result: true, icon: "calendario" }
      ],
      calc: { id: key + "_65", from: key + "_mensal", label: "Investido até os 65 anos", icon: "cofrinho" }
    };
  }

  var LIST = [
    {
      key: "marca",
      num: 1,
      title: "Trocando uma marca",
      icon: "troca",
      lead: "Escolha 3 produtos que você compra sempre e troque cada um por uma marca mais barata. Escreva quantos você usa por mês (uma estimativa), o preço de hoje e o preço da marca nova.",
      rows: [
        produto(1, "café"),
        produto(2, "sabão em pó"),
        produto(3, "refrigerante"),
        economia("marca")
      ]
    },
    {
      key: "habito",
      num: 2,
      title: "Diminuindo um hábito",
      icon: "hamburguer",
      lead: "Escolha um hábito que pesa no bolso porque se repete toda semana, como o lanche fora ou o delivery, e quanto ele custa cada vez.",
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
            { id: "habito_custo", label: "Custo médio por ocorrência", type: "money" }
          ]
        },
        economia("habito")
      ]
    },
    {
      key: "gasto",
      num: 3,
      title: "Diminuindo um gasto recorrente",
      icon: "assinatura",
      lead: "Escolha uma conta que vem todo mês, como uma assinatura ou um serviço, e o que dá para fazer no lugar dela: trocar por uma opção mais barata ou cancelar.",
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
      ]
    }
  ];

  // quanto falta pro aluno fazer 65 anos: o tempo que os aportes ficam
  // investidos (o primeiro campo da folha, antes das etapas)
  var PRAZO = { id: "anos_65", label: "Quanto falta para os 65 anos", type: "count", unit: "anos", max: 2 };

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
      if (row.calc) e.calc = row.calc;
      row.fields.forEach(function (f) {
        f.max = f.max || MAX[f.type];
        f.etapa = e.key;
        byId[f.id] = f;
        ofEtapa[e.key].push(f.id);
      });
    });
  });
  byId[PRAZO.id] = PRAZO;

  var ALL = LIST.reduce(function (ids, e) { return ids.concat(ofEtapa[e.key]); }, [PRAZO.id]);

  function byKey(key) {
    return LIST.filter(function (e) { return e.key === key; })[0] || null;
  }

  global.Etapas = {
    list: LIST,
    prazo: PRAZO,
    taxa: TAXA,
    total: TOTAL,
    byKey: byKey,
    field: function (id) { return byId[id] || null; },
    idsOf: function (key) { return ofEtapa[key] || []; },
    allIds: function () { return ALL; }
  };
})(window);
