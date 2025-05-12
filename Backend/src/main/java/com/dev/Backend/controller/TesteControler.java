package com.dev.Backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api")
public class TesteControler {


    @GetMapping("/")
    @CrossOrigin("http://localhost:3000/")
    public ResponseEntity<Void> buscarTodos() {
        return ResponseEntity.ok().build();
    }

}
