package com.manayuda.manayuda.controller;

import com.manayuda.manayuda.dto.EntregaRequest;
import com.manayuda.manayuda.dto.EntregaResponse;
import com.manayuda.manayuda.service.EntregaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas")
@RequiredArgsConstructor
public class EntregaController {

    private final EntregaService entregaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EntregaResponse crear(@Valid @RequestBody EntregaRequest request) {
        return entregaService.crear(request);
    }

    @GetMapping
    public List<EntregaResponse> listar(@RequestParam(required = false) Integer idComedor) {
        return entregaService.listar(idComedor);
    }
}