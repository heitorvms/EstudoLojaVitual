package com.dev.Backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.dev.Backend.entity.Pessoa;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    private String chaveSecreta = "chaveSecretaParaGerarTokenMuitoLongaEComplexa1234567890";
    private int validadeTokenNormal = 900000; // 900000 15 minutos // 5000 (para teste)
    private int validadeTokenRememberMe = 86400000; // 1 dia
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(chaveSecreta.getBytes());
    }

    public String gerarTokenUsername(Pessoa pessoa, boolean rememberMe) {
        int validade = rememberMe ? validadeTokenRememberMe : validadeTokenNormal;
        return Jwts.builder()
                .subject(pessoa.getUsername())
                .claim("rememberMe", rememberMe)
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + validade))
                .signWith(Keys.hmacShaKeyFor(chaveSecreta.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    public String getEmailToken(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
        return jws.getPayload().getSubject();
    }

    public boolean isRememberMeToken(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
        return jws.getPayload().get("rememberMe", Boolean.class);
    }

    public boolean validarToken(String token, HttpServletRequest request) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SignatureException e) {
            logger.error("Assinatura Inválida: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token expirado: {}", e.getMessage());
            request.setAttribute("validacaoToken", "Token expirado");
        } catch (MalformedJwtException | UnsupportedJwtException e) {
            logger.error("Token inválido ou não suportado: {}", e.getMessage());
        }
        return false;
    }
}