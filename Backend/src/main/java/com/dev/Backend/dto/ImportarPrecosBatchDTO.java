package com.dev.Backend.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ImportarPrecosBatchDTO {
    private Long distribuidoraId;
    private List<MaterialImportadoDTO> itens = new ArrayList<>();
}
