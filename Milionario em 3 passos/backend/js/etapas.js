(function (global) {
  "use strict";

  // As 3 etapas da folha "Se torne um milionário em 3 passos", na ordem da
  // folha, e o valor total economizado no fim. A tela (sheet-view.js), a
  // folha impressa e o que fica guardado (sheet.js) leem daqui, então os
  // títulos, os rótulos e os exemplos mudam aqui.
  //
  // Cada etapa: key (o nome no código), num, title, icon (o desenho, em
  // icons.js), lead (o que o aluno faz nela) e rows, as linhas da folha.
  // Cada linha: kind ("produto", "linha" ou "resultado", o jeito de pôr os
  // campos lado a lado) e fields.
  //
  // Cada campo: id (a chave no que fica guardado: não mude depois que os
  // alunos começarem, senão o que eles escreveram se perde), label, hint (o
  // pedaço do rótulo em letra normal, como "(por semana)"), sr (o resto do
  // rótulo pra quem usa leitor de tela, quando o rótulo se repete: "Preço
  // atual do produto 2"), type ("text", "money" ou "count"), placeholder,
  // max (quantas letras cabem) e:
  //   arrow:  a seta "→" antes do campo ("Preço atual → Novo preço")
  //   result: um resultado. A folha não faz conta nenhuma: o aluno calcula
  //           no sistema de cálculo da Financial Experts e escreve aqui. Os
  //           campos de resultado ficam verdes.
  //   icon:   o desenho do lado do rótulo (só nos resultados)
  //   unit:   a palavra depois do número, nos campos "count"

  function produto(n, ex) {
    var p = "marca_p" + n + "_";
    return {
      kind: "produto",
      fields: [
        { id: p + "produto", label: "Produto " + n, type: "text", placeholder: "Ex.: " + ex },
        { id: p + "marca", label: "Nova marca", sr: "do produto " + n, type: "text", placeholder: "A marca mais barata" },
        { id: p + "atual", label: "Preço atual", sr: "do produto " + n, type: "money" },
        { id: p + "novo", label: "Novo preço", sr: "do produto " + n, type: "money", arrow: true }
      ]
    };
  }

  // a economia por mês e até a aposentadoria: o fim de cada etapa
  function economia(key) {
    return {
      kind: "resultado",
      fields: [
        { id: key + "_mensal", label: "Economia mensal", type: "money", result: true, icon: "calendario" },
        { id: key + "_aposentadoria", label: "Economia até a aposentadoria", type: "money", result: true, icon: "cofrinho" }
      ]
    };
  }

  var LIST = [
    {
      key: "marca",
      num: 1,
      title: "Trocando uma marca",
      icon: "troca",
      lead: "Escolha 3 produtos que você compra sempre e troque cada um por uma marca mais barata. Escreva o preço de hoje e o preço da marca nova.",
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

  // o valor total economizado, no pé da folha (o aluno escreve o total que
  // calculou: a folha não soma nada)
  var TOTAL = { id: "total", label: "Valor total economizado", type: "money", result: true };

  // quantas letras cabem em cada tipo de campo, quando o campo não diz
  var MAX = { text: 60, money: 16, count: 3 };

  /* ============ os campos ============ */
  var byId = {};
  var ofEtapa = {};

  LIST.forEach(function (e) {
    ofEtapa[e.key] = [];
    e.rows.forEach(function (row) {
      row.fields.forEach(function (f) {
        f.max = f.max || MAX[f.type];
        f.etapa = e.key;
        byId[f.id] = f;
        ofEtapa[e.key].push(f.id);
      });
    });
  });
  TOTAL.max = MAX[TOTAL.type];
  byId[TOTAL.id] = TOTAL;

  var ALL = LIST.reduce(function (ids, e) { return ids.concat(ofEtapa[e.key]); }, []).concat(TOTAL.id);

  function byKey(key) {
    return LIST.filter(function (e) { return e.key === key; })[0] || null;
  }

  global.Etapas = {
    list: LIST,
    total: TOTAL,
    byKey: byKey,
    field: function (id) { return byId[id] || null; },
    idsOf: function (key) { return ofEtapa[key] || []; },
    allIds: function () { return ALL; }
  };
})(window);
