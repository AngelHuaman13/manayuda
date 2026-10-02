package com.manayuda.manayuda.controller;

import com.manayuda.manayuda.dto.LoginRequest;
import com.manayuda.manayuda.dto.UsuarioResponse;
import com.manayuda.manayuda.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public UsuarioResponse login(@Valid @RequestBody LoginRequest request) {
        return usuarioService.login(request);
    }
}