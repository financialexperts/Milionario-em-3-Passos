(function (global) {
  "use strict";

  // A conta da folha: quanto a economia mensal de uma etapa vira até os 65
  // anos. É a mesma conta da Calculadora Financeira (backend/js/finance.js,
  // cópia idêntica da de lá): juros compostos por período, com o aporte no
  // fim de cada período,
  //
  //     VF = PMT · ((1 + i)^n − 1) / i
  //
  // O aporte é mensal, então o período é o mês: i é a taxa ao mês e n, o
  // número de meses (anos × 12). A taxa da folha é ao ano (10%); ao mês,
  // vale a equivalente em juros compostos, (1 + 10%)^(1/12) − 1 = 0,7974%
  // (12 meses a 0,7974% rendem os mesmos 10%). Ela é arredondada em 4 casas,
  // como a Calculadora Financeira aceita: com a taxa e os meses que a folha
  // mostra, a calculadora dá o mesmo valor, centavo por centavo.
  // Não toca no DOM.

  // a taxa ao mês equivalente à taxa ao ano, em 4 casas (0.007974 = 0,7974%)
  function aoMes(anual) {
    return Math.round((Math.pow(1 + anual, 1 / 12) - 1) * 1e6) / 1e6;
  }

  // quantos períodos (meses) cabem em tantos anos
  function meses(anos) { return anos * 12; }

  // quanto juntam aportes iguais todo mês, por tantos anos, à taxa ao ano
  function futuro(aporte, anos, anual) {
    if (!aporte || !anos) return 0;
    return global.Finance.futureValue(aoMes(anual), meses(anos), 0, aporte);
  }

  global.Juros = {
    aoMes: aoMes,
    meses: meses,
    futuro: futuro
  };
})(window);
