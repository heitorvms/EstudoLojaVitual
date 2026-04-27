package com.dev.Backend;

import net.sf.jasperreports.engine.*;
import java.io.File;

public class CompileReport {
    public static void main(String[] args) {
        try {
            String source = "src/main/resources/relatorios/RelatorioCotacaoSimples.jrxml";
            String dest1 = "src/main/resources/relatorios/RelatorioCotacao.jasper";
            String dest2 = "src/main/resources/relatorios/RelatorioCotacaoSimples.jasper";

            File src = new File(source);
            if (!src.exists()) {
                System.out.println("Arquivo JRXML não encontrado: " + source);
                System.out.println("Pulei a compilação. O projeto já inclui o arquivo JASPER em: " + dest2);
                return;
            }

            System.out.println("Compilando relatório (saída RelatorioCotacao.jasper): " + source);
            JasperCompileManager.compileReportToFile(source, dest1);
            System.out.println("✓ Relatório compilado com sucesso em: " + dest1);

            System.out.println("Compilando relatório (saída RelatorioCotacaoSimples.jasper): " + source);
            JasperCompileManager.compileReportToFile(source, dest2);
            System.out.println("✓ Relatório compilado com sucesso em: " + dest2);
        } catch (JRException e) {
            System.err.println("✗ Erro ao compilar relatório:");
            e.printStackTrace();
        }
    }
}
