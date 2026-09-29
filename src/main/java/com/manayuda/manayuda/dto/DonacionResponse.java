package com.manayuda.manayuda.dto;

import com.manayuda.manayuda.model.EstadoDonacion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonacionResponse(
        Integer id,
        Integer idUsuario,
        String producto,
        BigDecimal cantidad,
        String unidad,
        LocalDate fechaVencimiento,
        EstadoDonacion estado
) {}