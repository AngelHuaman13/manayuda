package com.manayuda.manayuda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonacionRequest(
        @NotNull Integer idUsuario,
        @NotBlank @Size(max = 120) String producto,
        @NotNull @DecimalMin("0.01") BigDecimal cantidad,
        @NotBlank @Size(max = 20) String unidad,
        @FutureOrPresent LocalDate fechaVencimiento
) {}