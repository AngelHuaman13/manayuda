package com.manayuda.manayuda.dto;

import java.math.BigDecimal;

public record EntregaResponse(
        Integer id,
        Integer idDonacion,
        String producto,
        Integer idComedor,
        String comedor,
        BigDecimal cantidadEntregada,
        String unidad,
        String observaciones
) {}