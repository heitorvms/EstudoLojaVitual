package com.dev.Backend.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ImportSpreadsheetResponseDTO {
    private int totalLinhas;
    private int validos;
    private int comErro;
    private int novosMateriais;
    private int materiaisExistentes;
    private List<MaterialImportadoDTO> materiais = new ArrayList<>();
}
