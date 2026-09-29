package com.manayuda.manayuda.dto;

public record ComedorResponse(
        Integer id,
        Integer idUsuario,
        String nombre,
        String direccion,
        String distrito,
        String telefono,
        Integer personasAtendidas
) {}