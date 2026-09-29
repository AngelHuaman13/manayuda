package com.manayuda.manayuda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record EntregaRequest(
        @NotNull Integer idDonacion,
        @NotNull Integer idComedor,
        @NotNull @DecimalMin("0.01") BigDecimal cantidadEntregada,
        @Size(max = 255) String observaciones
) {}