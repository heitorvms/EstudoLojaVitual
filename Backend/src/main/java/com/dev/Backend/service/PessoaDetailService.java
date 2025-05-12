package com.dev.Backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PessoaReposotory;

@Service
public class PessoaDetailService implements UserDetailsService {

    @Autowired
    private PessoaReposotory pessoaReposotory;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Pessoa pessoa = pessoaReposotory.findByEmail(username);
        if (pessoa == null) {
            throw new UsernameNotFoundException("Pessoa não encontrada pelo email: " + username);
        }
        return pessoa;
    }
    
}
