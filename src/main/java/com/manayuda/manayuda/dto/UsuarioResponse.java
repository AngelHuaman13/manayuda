package com.manayuda.manayuda.dto;

import com.manayuda.manayuda.model.Rol;

public record UsuarioResponse(
        Integer id,
        String nombre,
        String email,
        Rol rol
) {}