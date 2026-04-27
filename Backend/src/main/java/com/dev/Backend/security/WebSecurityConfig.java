package com.dev.Backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dev.Backend.service.PessoaDetailService;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private final JwtUtil jwtUtil;
    private final PessoaDetailService pessoaDetailService;

    public WebSecurityConfig(JwtUtil jwtUtil, PessoaDetailService pessoaDetailService) {
        this.jwtUtil = jwtUtil;
        this.pessoaDetailService = pessoaDetailService;
    }

    @Bean
    public AuthFilterToken authFilterToken() {
        return new AuthFilterToken(jwtUtil, pessoaDetailService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthEntryPointJwt unauthorizedHandler) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/pessoa-gerenciamento/**", "/login").permitAll()
                .requestMatchers("/api/permissao_pessoa/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/cotacoes").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/cotacoes/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/cotacoes/**").authenticated()
                .requestMatchers("/api/distribuidoras/**").permitAll()
                .requestMatchers("/api/pessoa/me").authenticated()
                .requestMatchers("/api/pessoa/**").hasAnyAuthority("gerente") //apenas gerentes
                .anyRequest().authenticated())
            .addFilterBefore(authFilterToken(), UsernamePasswordAuthenticationFilter.class);
    
        return http.build();

    }
}   