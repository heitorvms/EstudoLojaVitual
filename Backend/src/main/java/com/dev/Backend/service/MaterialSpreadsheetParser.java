package com.dev.Backend.service;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.dev.Backend.dto.ImportSpreadsheetResponseDTO;
import com.dev.Backend.dto.MaterialImportadoDTO;
import com.dev.Backend.entity.MaterialDisponivel;

@Component
public class MaterialSpreadsheetParser {

    public static final String[] HEADERS = {"descricao", "dimensao", "tamanho", "preco"};

    @Autowired
    private MaterialMatcherService matcher;

    public ImportSpreadsheetResponseDTO parse(String nomeArquivo, InputStream stream,
                                                Long distribuidoraId) throws IOException {
        if (nomeArquivo == null) throw new IOException("Nome do arquivo é obrigatório.");
        String lower = nomeArquivo.toLowerCase();
        if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
            return parseXlsx(stream, distribuidoraId);
        }
        if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
            return parseCsv(stream, distribuidoraId);
        }
        throw new IOException("Formato não suportado. Use .csv ou .xlsx");
    }

    public byte[] gerarTemplateXlsx() throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Materiais");

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                header.createCell(i).setCellValue(HEADERS[i]);
            }

            Row exemplo1 = sheet.createRow(1);
            exemplo1.createCell(0).setCellValue("Tubo retangular com costura");
            exemplo1.createCell(1).setCellValue("15X35");
            exemplo1.createCell(2).setCellValue(6.0);
            exemplo1.createCell(3).setCellValue(25.90);

            Row exemplo2 = sheet.createRow(2);
            exemplo2.createCell(0).setCellValue("Tubo redondo");
            exemplo2.createCell(1).setCellValue("Ø30");
            exemplo2.createCell(2).setCellValue(6.0);
            exemplo2.createCell(3).setCellValue(19.80);

            for (int i = 0; i < HEADERS.length; i++) sheet.autoSizeColumn(i);

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                wb.write(out);
                return out.toByteArray();
            }
        }
    }

    private ImportSpreadsheetResponseDTO parseXlsx(InputStream stream, Long distribuidoraId) throws IOException {
        ImportSpreadsheetResponseDTO resp = new ImportSpreadsheetResponseDTO();
        List<MaterialImportadoDTO> itens = new ArrayList<>();
        DataFormatter fmt = new DataFormatter();

        try (Workbook wb = new XSSFWorkbook(stream)) {
            Sheet sheet = wb.getSheetAt(0);
            if (sheet == null) return resp;

            int[] idx = mapearColunas(fmt, sheet.getRow(0));

            int total = 0;
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isLinhaVazia(fmt, row)) continue;
                total++;

                String descricao = idx[0] >= 0 ? fmt.formatCellValue(row.getCell(idx[0])).trim() : "";
                String dimensao = idx[1] >= 0 ? fmt.formatCellValue(row.getCell(idx[1])).trim() : "";
                BigDecimal tamanho = lerNumero(row.getCell(idx[2]), fmt);
                BigDecimal preco = idx[3] >= 0 ? lerNumero(row.getCell(idx[3]), fmt) : null;

                itens.add(montar(r + 1, descricao, dimensao, tamanho, preco));
            }
            resp.setTotalLinhas(total);
        }
        finalizar(resp, itens, distribuidoraId);
        return resp;
    }

    private ImportSpreadsheetResponseDTO parseCsv(InputStream stream, Long distribuidoraId) throws IOException {
        ImportSpreadsheetResponseDTO resp = new ImportSpreadsheetResponseDTO();
        List<MaterialImportadoDTO> itens = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String linha;
            int numero = 0;
            int[] idx = {-1, -1, -1, -1};
            boolean headerLido = false;
            int total = 0;
            char sep = ';';

            while ((linha = br.readLine()) != null) {
                numero++;
                if (linha.isBlank()) continue;
                if (!headerLido) {
                    sep = detectarSeparador(linha);
                    idx = mapearColunasCsv(linha.split(escapeSeparador(sep), -1));
                    headerLido = true;
                    continue;
                }

                String[] cols = linha.split(escapeSeparador(sep), -1);
                total++;

                String descricao = idx[0] >= 0 && idx[0] < cols.length ? cols[idx[0]].trim() : "";
                String dimensao = idx[1] >= 0 && idx[1] < cols.length ? cols[idx[1]].trim() : "";
                BigDecimal tamanho = idx[2] >= 0 && idx[2] < cols.length ? parseNumero(cols[idx[2]]) : null;
                BigDecimal preco = idx[3] >= 0 && idx[3] < cols.length ? parseNumero(cols[idx[3]]) : null;

                itens.add(montar(numero, descricao, dimensao, tamanho, preco));
            }
            resp.setTotalLinhas(total);
        }
        finalizar(resp, itens, distribuidoraId);
        return resp;
    }

    private void finalizar(ImportSpreadsheetResponseDTO resp, List<MaterialImportadoDTO> itens,
                            Long distribuidoraId) {
        aplicarMatching(itens, distribuidoraId);

        int validos = 0;
        int comErro = 0;
        int novos = 0;
        int existentes = 0;
        for (MaterialImportadoDTO m : itens) {
            if (m.isValido()) validos++; else comErro++;
            String s = m.getStatusMatch();
            if ("MATERIAL_EXISTENTE".equals(s) || "APELIDO_CONHECIDO".equals(s)) existentes++;
            else if ("NOVO_MATERIAL".equals(s) || "AMBIGUO".equals(s)) novos++;
        }
        resp.setValidos(validos);
        resp.setComErro(comErro);
        resp.setNovosMateriais(novos);
        resp.setMateriaisExistentes(existentes);
        resp.setMateriais(itens);
    }

    /**
     * Cascata de matching:
     *  1) Apelido cadastrado pra (distribuidora, descrição normalizada)
     *  2) Match exato (descricao_norm + tamanho)
     *  3) Fuzzy (pg_trgm) - candidatos ambíguos
     *  4) NOVO_MATERIAL (será criado)
     */
    private void aplicarMatching(List<MaterialImportadoDTO> itens, Long distribuidoraId) {
        List<MaterialDisponivel> todos = matcher.listarTodos();

        for (MaterialImportadoDTO item : itens) {
            if (!item.isValido()) continue;

            if (distribuidoraId != null) {
                var porApelido = matcher.matchPorApelido(distribuidoraId,
                    item.getDescricao(), item.getDimensao());
                if (porApelido.isPresent()) {
                    item.setMaterialMatchId(porApelido.get().getId());
                    item.setMaterialMatchDescricao(porApelido.get().getDescricao());
                    item.setStatusMatch("APELIDO_CONHECIDO");
                    continue;
                }
            }

            var exato = matcher.matchExatoEmLista(item.getDescricao(), item.getDimensao(),
                item.getTamanho(), todos);
            if (exato.isPresent()) {
                item.setMaterialMatchId(exato.get().getId());
                item.setMaterialMatchDescricao(exato.get().getDescricao());
                item.setStatusMatch("MATERIAL_EXISTENTE");
                continue;
            }

            try {
                var candidatos = matcher.buscarCandidatosFuzzy(item.getDescricao(),
                    item.getDimensao(), item.getTamanho());
                if (!candidatos.isEmpty()) {
                    item.setCandidatos(candidatos);
                    item.setStatusMatch("AMBIGUO");
                    continue;
                }
            } catch (Exception ignored) {
                // pg_trgm pode não estar disponível; segue como NOVO
            }

            item.setMaterialMatchId(null);
            item.setStatusMatch("NOVO_MATERIAL");
        }
    }

    private MaterialImportadoDTO montar(int linha, String descricao, String dimensao,
                                        BigDecimal tamanho, BigDecimal preco) {
        MaterialImportadoDTO dto = new MaterialImportadoDTO();
        dto.setLinha(linha);
        dto.setDescricao(descricao);
        dto.setDimensao(dimensao);
        dto.setTamanho(tamanho);
        dto.setPrecoUnitario(preco);

        StringBuilder erros = new StringBuilder();
        if (descricao == null || descricao.isBlank()) erros.append("descrição vazia; ");
        if (tamanho == null || tamanho.signum() <= 0) erros.append("tamanho inválido; ");
        if (preco != null && preco.signum() < 0) erros.append("preço negativo; ");

        boolean valido = erros.length() == 0;
        dto.setValido(valido);
        if (!valido) dto.setErro(erros.toString().trim());
        return dto;
    }

    private int[] mapearColunas(DataFormatter fmt, Row header) {
        int[] idx = {-1, -1, -1, -1};
        if (header == null) return idx;
        for (int c = 0; c < header.getLastCellNum(); c++) {
            String nome = fmt.formatCellValue(header.getCell(c)).trim().toLowerCase();
            atribuirIndice(idx, nome, c);
        }
        return idx;
    }

    private int[] mapearColunasCsv(String[] cabecalho) {
        int[] idx = {-1, -1, -1, -1};
        for (int c = 0; c < cabecalho.length; c++) {
            atribuirIndice(idx, cabecalho[c].trim().toLowerCase(), c);
        }
        return idx;
    }

    private void atribuirIndice(int[] idx, String nome, int posicao) {
        if (nome.startsWith("descri")) idx[0] = posicao;
        else if (nome.startsWith("dimens")) idx[1] = posicao;
        else if (nome.startsWith("tamanh")) idx[2] = posicao;
        else if (nome.startsWith("pre")) idx[3] = posicao;
    }

    private boolean isLinhaVazia(DataFormatter fmt, Row row) {
        for (int c = 0; c < row.getLastCellNum(); c++) {
            String v = fmt.formatCellValue(row.getCell(c));
            if (v != null && !v.isBlank()) return false;
        }
        return true;
    }

    private BigDecimal lerNumero(Cell cell, DataFormatter fmt) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        return parseNumero(fmt.formatCellValue(cell));
    }

    private BigDecimal parseNumero(String texto) {
        if (texto == null) return null;
        String s = texto.trim().replace("R$", "").replace(" ", "");
        if (s.isEmpty()) return null;
        if (s.contains(",") && s.contains(".")) {
            s = s.replace(".", "").replace(",", ".");
        } else if (s.contains(",")) {
            s = s.replace(",", ".");
        }
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private char detectarSeparador(String header) {
        int virgulas = contar(header, ',');
        int pontoVirgula = contar(header, ';');
        int tabs = contar(header, '\t');
        if (tabs >= virgulas && tabs >= pontoVirgula && tabs > 0) return '\t';
        return pontoVirgula >= virgulas ? ';' : ',';
    }

    private int contar(String s, char c) {
        int n = 0;
        for (int i = 0; i < s.length(); i++) if (s.charAt(i) == c) n++;
        return n;
    }

    private String escapeSeparador(char sep) {
        return java.util.regex.Pattern.quote(String.valueOf(sep));
    }
}
