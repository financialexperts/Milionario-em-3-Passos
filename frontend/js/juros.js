(function (global) {
  "use strict";

  // A conta da folha: quanto a economia mensal de uma etapa vira até os 65
  // anos. A economia de cada mês vira um aporte, investido à taxa da folha
  // (TAXA, em etapas.js) até lá. Não toca no DOM.
  //
  // A taxa é ao ano; ao mês, vale a equivalente (10% ao ano dá 0,797% ao
  // mês: 12 meses a 0,797% rendem os mesmos 10%). O aporte entra no fim de
  // cada mês, então o primeiro começa a render no mês seguinte e o último
  // não chega a render.

  // a taxa ao mês equivalente à taxa ao ano
  function aoMes(anual) {
    return Math.pow(1 + anual, 1 / 12) - 1;
  }

  // Quanto juntam aportes iguais todo mês, por um tanto de anos, à taxa ao
  // ano: aporte × ((1 + i)^n − 1) / i, com i a taxa ao mês e n os meses.
  function futuro(aporte, anos, anual) {
    var n = anos * 12;
    var i = aoMes(anual);
    if (!n || !aporte) return 0;
    if (!i) return aporte * n;
    return aporte * (Math.pow(1 + i, n) - 1) / i;
  }

  global.Juros = {
    aoMes: aoMes,
    futuro: futuro
  };
})(window);
