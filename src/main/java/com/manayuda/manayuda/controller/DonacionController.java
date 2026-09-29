package com.manayuda.manayuda.controller;

import com.manayuda.manayuda.dto.DonacionRequest;
import com.manayuda.manayuda.dto.DonacionResponse;
import com.manayuda.manayuda.model.EstadoDonacion;
import com.manayuda.manayuda.service.DonacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donaciones")
@RequiredArgsConstructor
public class DonacionController {

    private final DonacionService donacionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DonacionResponse crear(@Valid @RequestBody DonacionRequest request) {
        return donacionService.crear(request);
    }

    @GetMapping
    public List<DonacionResponse> listar(@RequestParam(required = false) EstadoDonacion estado) {
        return donacionService.listar(estado);
    }
}