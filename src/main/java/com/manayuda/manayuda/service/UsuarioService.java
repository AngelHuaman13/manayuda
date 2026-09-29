package com.manayuda.manayuda.service;

import com.manayuda.manayuda.dto.UsuarioRequest;
import com.manayuda.manayuda.dto.UsuarioResponse;
import com.manayuda.manayuda.model.Rol;
import com.manayuda.manayuda.model.Usuario;
import com.manayuda.manayuda.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse registrar(UsuarioRequest req) {
        if (req.rol() == Rol.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No se puede registrar un administrador desde aquí");
        }
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El email ya está registrado");
        }

        Usuario u = new Usuario();
        u.setNombre(req.nombre());
        u.setEmail(req.email());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setRol(req.rol());

        return toResponse(usuarioRepository.save(u));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(this::toResponse).toList();
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol());
    }
}