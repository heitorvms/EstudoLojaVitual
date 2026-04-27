package com.dev.Backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.PessoaClienteRequestDTO;
import com.dev.Backend.dto.UsuarioPermissaoDTO;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.security.JwtUtil;
import com.dev.Backend.service.PessoaClienteService;
import com.dev.Backend.service.PessoaGerenciamentoService;
import com.dev.Backend.service.PessoaService;

@RestController
@RequestMapping("/api/pessoa-gerenciamento")
@CrossOrigin
public class PessoaGerenciamentoController {

    @Autowired
    private PessoaService pessoaService;

    @Autowired
    private PessoaClienteService pessoaClienteService;

    @Autowired
    private PessoaGerenciamentoService pessoaGerenciamentoService;
  
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @GetMapping("/gerenciamento-usuarios")
    public ResponseEntity<List<UsuarioPermissaoDTO>> listarUsuariosComPermissoes() {
        List<Pessoa> pessoas = pessoaService.buscarTodos();
        List<UsuarioPermissaoDTO> resultado = pessoas.stream().map(pessoa -> {
            List<String> permissoes = pessoa.getPermissaoPessoas()
                .stream()
                .map(pp -> pp.getPermissao().getNome())
                .collect(Collectors.toList());
            return new UsuarioPermissaoDTO(pessoa.getId(), pessoa.getNome(), pessoa.getEmail(), permissoes);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/alterar-permissao")
    @CrossOrigin("http://localhost:3000/")
    public ResponseEntity<?> alterarPermissao(@RequestBody UsuarioPermissaoDTO dto) {
        try {
            pessoaService.alterarPermissao(dto.getId(), dto.getPermissoes().get(0));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao alterar permissão: " + e.getMessage());
        }
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrar(@RequestBody PessoaClienteRequestDTO pessoa) {
        try {
            pessoaClienteService.registrar(pessoa);
            return ResponseEntity.ok("Conta criada com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao criar conta: " + e.getMessage());
        }
    }

    @PostMapping("/senha-codigo")
    @CrossOrigin("http://localhost:3000/")
    public String recuperarCodigo(@RequestBody Pessoa pessoa) {
        return pessoaGerenciamentoService.solicitarCodigo(pessoa.getEmail());
    }

    @PostMapping("/senha-alterar")
    @CrossOrigin("http://localhost:3000/")
    public String recuperarSenha(@RequestBody Pessoa pessoa) {
        return pessoaGerenciamentoService.alterarSenha(pessoa);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getSenha())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Pessoa autenticado = (Pessoa) authentication.getPrincipal();
        String token = jwtUtil.gerarTokenUsername(autenticado, loginRequest.isRememberMe());
        HashMap<String, String> map = new HashMap<>();
        map.put("token", token);
        return ResponseEntity.ok(map);
    }
}

class LoginRequest {
    private String email;
    private String senha;
    private boolean rememberMe;
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public boolean isRememberMe() { return rememberMe; }
    public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
}