package com.manayuda.manayuda.service;

import com.manayuda.manayuda.dto.ComedorRequest;
import com.manayuda.manayuda.dto.ComedorResponse;
import com.manayuda.manayuda.model.Comedor;
import com.manayuda.manayuda.model.Usuario;
import com.manayuda.manayuda.repository.ComedorRepository;
import com.manayuda.manayuda.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComedorService {

    private final ComedorRepository comedorRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<ComedorResponse> listar() {
        return comedorRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ComedorResponse crear(ComedorRequest req) {
        Usuario usuario = usuarioRepository.findById(req.idUsuario())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Comedor c = new Comedor();
        c.setUsuario(usuario);
        c.setNombre(req.nombre());
        c.setDireccion(req.direccion());
        c.setDistrito(req.distrito());
        c.setTelefono(req.telefono());
        c.setPersonasAtendidas(req.personasAtendidas() != null ? req.personasAtendidas() : 0);

        return toResponse(comedorRepository.save(c));
    }

    private ComedorResponse toResponse(Comedor c) {
        return new ComedorResponse(
                c.getId(),
                c.getUsuario().getId(),
                c.getNombre(),
                c.getDireccion(),
                c.getDistrito(),
                c.getTelefono(),
                c.getPersonasAtendidas());
    }
}