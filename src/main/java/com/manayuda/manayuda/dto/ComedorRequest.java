package com.manayuda.manayuda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ComedorRequest(
        @NotNull Integer idUsuario,
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Size(max = 200) String direccion,
        @NotBlank @Size(max = 80) String distrito,
        @Size(max = 20) String telefono,
        @PositiveOrZero Integer personasAtendidas
) {}