import React from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FormGrid } from "../../styles/oficinaLayout";
import { deIsoData, hojeIso, paraIsoData } from "../../utils/datas";

const TURNOS = [
  { label: "Diurno", value: false },
  { label: "Noturno", value: true },
];

export const novoLancamento = () => ({
  funcionarioId: null,
  noturno: false,
  dataTrabalho: hojeIso(),
  horas: 1,
  valorHora: 0,
});

const valorHoraDoTurno = (funcionario, noturno) =>
  Number((noturno ? funcionario?.valorHoraNoturno : funcionario?.valorHora) || 0);

export const lancamentoValido = (lancamento) =>
  Boolean(lancamento.funcionarioId && lancamento.horas && lancamento.dataTrabalho);

export default function LancamentoHorasForm({ funcionarios, lancamento, onChange }) {
  const atualizar = (alteracao) => {
    const novo = { ...lancamento, ...alteracao };
    const funcionario = funcionarios.find((f) => f.id === novo.funcionarioId);
    if (funcionario && ("funcionarioId" in alteracao || "noturno" in alteracao)) {
      novo.valorHora = valorHoraDoTurno(funcionario, novo.noturno);
    }
    onChange(novo);
  };

  return (
    <FormGrid>
      <div>
        <label>Funcionário</label>
        <Dropdown
          placeholder="Selecione"
          options={funcionarios.map((f) => ({ label: f.nome, value: f.id }))}
          value={lancamento.funcionarioId}
          onChange={(e) => atualizar({ funcionarioId: e.value })}
        />
      </div>
      <div>
        <label>Data</label>
        <Calendar
          value={deIsoData(lancamento.dataTrabalho)}
          onChange={(e) => atualizar({ dataTrabalho: paraIsoData(e.value) })}
          dateFormat="dd/mm/yy"
          maxDate={new Date()}
          showIcon
        />
      </div>
      <div>
        <label>Turno</label>
        <Dropdown options={TURNOS} value={lancamento.noturno} onChange={(e) => atualizar({ noturno: e.value })} />
      </div>
      <div>
        <label>Horas</label>
        <InputNumber value={lancamento.horas} onValueChange={(e) => atualizar({ horas: e.value })} min={0} maxFractionDigits={2} />
      </div>
      <div>
        <label>Valor/hora</label>
        <InputNumber value={lancamento.valorHora} onValueChange={(e) => atualizar({ valorHora: e.value })} mode="currency" currency="BRL" locale="pt-BR" />
      </div>
    </FormGrid>
  );
}
