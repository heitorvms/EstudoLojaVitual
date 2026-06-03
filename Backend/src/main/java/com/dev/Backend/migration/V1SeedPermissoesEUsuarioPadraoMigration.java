package com.dev.Backend.migration;

import java.util.Date;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.entity.Permissao;
import com.dev.Backend.entity.PermissaoPessoa;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PermissaoPessoaReposotory;
import com.dev.Backend.repository.PermissaoReposotory;
import com.dev.Backend.repository.PessoaReposotory;

@Component
@Order(Integer.MAX_VALUE)
@ConditionalOnProperty(name = "app.seed.default-user.enabled", havingValue = "true", matchIfMissing = true)
public class V1SeedPermissoesEUsuarioPadraoMigration implements ApplicationRunner {

    private static final String EMAIL_PADRAO = "heitor@local.dev";
    private static final String SENHA_PADRAO = "123";
    private static final String NOME_PADRAO = "Heitor";
    private static final String CPF_PADRAO = "00000000000";
    private static final String PERFIL_PADRAO = "Admin";
    private static final List<String> PERFIS_SISTEMA = List.of("Admin", "Gerente");

    private final PermissaoReposotory permissaoRepository;
    private final PessoaReposotory pessoaRepository;
    private final PermissaoPessoaReposotory permissaoPessoaRepository;
    private final PasswordEncoder passwordEncoder;

    public V1SeedPermissoesEUsuarioPadraoMigration(
            PermissaoReposotory permissaoRepository,
            PessoaReposotory pessoaRepository,
            PermissaoPessoaReposotory permissaoPessoaRepository,
            PasswordEncoder passwordEncoder) {
        this.permissaoRepository = permissaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.permissaoPessoaRepository = permissaoPessoaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Date agora = new Date();
        PERFIS_SISTEMA.forEach(nome -> garantirPermissao(nome, agora));
        garantirUsuarioPadrao(agora);
    }

    private void garantirPermissao(String nome, Date agora) {
        if (!permissaoRepository.findByNome(nome).isEmpty()) {
            return;
        }
        Permissao permissao = new Permissao();
        permissao.setNome(nome);
        permissao.setDataCriacao(agora);
        permissao.setDataAtualizacao(agora);
        permissaoRepository.saveAndFlush(permissao);
    }

    private void garantirUsuarioPadrao(Date agora) {
        Pessoa pessoa = pessoaRepository.findFirstByEmailOrderByIdAsc(EMAIL_PADRAO).orElse(null);
        if (pessoa == null) {
            pessoa = new Pessoa();
            pessoa.setNome(NOME_PADRAO);
            pessoa.setCpf(CPF_PADRAO);
            pessoa.setEmail(EMAIL_PADRAO);
            pessoa.setSenha(passwordEncoder.encode(SENHA_PADRAO));
            pessoa.setDataCriacao(agora);
            pessoa.setDataAtualizacao(agora);
            pessoa = pessoaRepository.saveAndFlush(pessoa);
        } else {
            boolean alterado = false;
            if (pessoa.getCpf() == null || pessoa.getCpf().isBlank()) {
                pessoa.setCpf(CPF_PADRAO);
                alterado = true;
            }
            if (pessoa.getNome() == null || pessoa.getNome().isBlank()) {
                pessoa.setNome(NOME_PADRAO);
                alterado = true;
            }
            if (alterado) {
                pessoa.setDataAtualizacao(agora);
                pessoa = pessoaRepository.saveAndFlush(pessoa);
            }
        }

        Permissao admin = permissaoRepository.findByNome(PERFIL_PADRAO).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Permissão Admin não encontrada após seed"));

        boolean jaTemAdmin = pessoa.getPermissaoPessoas() != null
                && pessoa.getPermissaoPessoas().stream()
                        .anyMatch(pp -> PERFIL_PADRAO.equals(pp.getPermissao().getNome()));

        if (jaTemAdmin) {
            return;
        }

        PermissaoPessoa vinculo = new PermissaoPessoa();
        vinculo.setPessoa(pessoa);
        vinculo.setPermissao(admin);
        vinculo.setDataCriacao(agora);
        vinculo.setDataAtualizacao(agora);
        permissaoPessoaRepository.saveAndFlush(vinculo);
    }
}
