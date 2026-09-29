package com.manayuda.manayuda.controller;

import com.manayuda.manayuda.dto.ComedorRequest;
import com.manayuda.manayuda.dto.ComedorResponse;
import com.manayuda.manayuda.service.ComedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comedores")
@RequiredArgsConstructor
public class ComedorController {

    private final ComedorService comedorService;

    @GetMapping
    public List<ComedorResponse> listar() {
        return comedorService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComedorResponse crear(@Valid @RequestBody ComedorRequest request) {
        return comedorService.crear(request);
    }
}