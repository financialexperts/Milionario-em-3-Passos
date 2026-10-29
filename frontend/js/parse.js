(function (global) {
  "use strict";

  // Lê o número que o aluno digitou numa célula de dinheiro, do jeito
  // brasileiro ("1.800,00", "1800", "R$ 1.800"). Serve pra completar o
  // número quando o aluno sai da célula ("1.800" vira "1.800,00") e pra ler
  // a economia mensal, que vira o aporte da conta dos 65 anos (juros.js).
  //
  // Devolve o número, ou null quando não tem nada ou não deu pra entender.

  // Com vírgula, o ponto separa os milhares ("1.800,50"). Sem vírgula,
  // "1.800" é mil e oitocentos e "4.5" é quatro e meio (o ponto só é de
  // milhar em grupos de 3). Em "1.234.5", os pontos de milhar são os da
  // máscara (mask.js) e o último, com menos de 3 algarismos depois, é o
  // decimal.
  function number(s) {
    if (s.indexOf(",") >= 0) {
      if (s.indexOf(",") !== s.lastIndexOf(",")) return NaN;
      var parts = s.split(",");
      if (parts[0] && !/^\d{1,3}(\.\d{3})*$|^\d+$/.test(parts[0])) return NaN;
      if (!/^\d*$/.test(parts[1])) return NaN;
      return Number((parts[0].replace(/\./g, "") || "0") + "." + (parts[1] || "0"));
    }
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
    var m = /^(\d{1,3}(?:\.\d{3})+)\.(\d{1,2})$/.exec(s);
    if (m) return Number(m[1].replace(/\./g, "") + "." + m[2]);
    return /^\d*\.?\d+$|^\d+\.$/.test(s) ? Number(s) : NaN;
  }

  function money(text) {
    // o "R$" e os espaços não contam
    var s = String(text == null ? "" : text).replace(/R\$/gi, "").replace(/\s+/g, "");
    if (!s) return null;
    var n = number(s);
    return isFinite(n) && n >= 0 ? n : null;
  }

  global.Parse = {
    money: money
  };
})(window);
