package com.dev.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.UsuarioDTO;
import com.dev.Backend.entity.PermissaoPessoa;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.service.PessoaService;

@RestController
@RequestMapping("/api/pessoa")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class PessoaController {

    @Autowired
    private PessoaService pessoaService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getUsuarioAtual() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Pessoa pessoa = pessoaService.buscarPorEmail(email);
        if (pessoa == null) {
            return ResponseEntity.notFound().build();
        }

        String cargo = "";
        if (pessoa.getPermissaoPessoas() != null && !pessoa.getPermissaoPessoas().isEmpty()) {
            PermissaoPessoa pp = pessoa.getPermissaoPessoas().get(0);
            if (pp.getPermissao() != null && pp.getPermissao().getNome() != null) {
                cargo = pp.getPermissao().getNome();
            }
        }

        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setNome(pessoa.getNome());
        usuarioDTO.setCargo(cargo);

        return ResponseEntity.ok(usuarioDTO);
    }

    @GetMapping("/")
    public List<Pessoa> buscarTodos() {
        return pessoaService.buscarTodos();
    }

    @PostMapping("/")
    public Pessoa inserir(@RequestBody Pessoa pessoa, @RequestBody PermissaoPessoa permissao) {
        return pessoaService.inserir(pessoa, "Cliente");
    }

    @PutMapping("/")
    public Pessoa alterar(@RequestBody Pessoa pessoa) {
        return pessoaService.alterar(pessoa);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        pessoaService.excluir(id);
        return ResponseEntity.ok().build();
    }
}