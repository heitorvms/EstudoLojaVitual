import { addLocale, locale } from "primereact/api";

addLocale("pt-BR", {
  firstDayOfWeek: 0,
  dayNames: ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
  dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
  monthNames: [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ],
  monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  today: "Hoje",
  clear: "Limpar",
  weekHeader: "Sem",
  chooseYear: "Escolher ano",
  chooseMonth: "Escolher mês",
  chooseDate: "Escolher data",
  prevMonth: "Mês anterior",
  nextMonth: "Próximo mês",
  prevYear: "Ano anterior",
  nextYear: "Próximo ano",
  accept: "Sim",
  reject: "Não",
  emptyMessage: "Nenhum resultado encontrado",
  emptyFilterMessage: "Nenhum resultado encontrado",
});

locale("pt-BR");
