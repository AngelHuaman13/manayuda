package com.manayuda.manayuda.service;

import com.manayuda.manayuda.dto.EntregaRequest;
import com.manayuda.manayuda.dto.EntregaResponse;
import com.manayuda.manayuda.model.Comedor;
import com.manayuda.manayuda.model.Donacion;
import com.manayuda.manayuda.model.EstadoDonacion;
import com.manayuda.manayuda.model.Entrega;
import com.manayuda.manayuda.repository.ComedorRepository;
import com.manayuda.manayuda.repository.DonacionRepository;
import com.manayuda.manayuda.repository.EntregaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final DonacionRepository donacionRepository;
    private final ComedorRepository comedorRepository;

    @Transactional
    public EntregaResponse crear(EntregaRequest req) {
        Donacion donacion = donacionRepository.findById(req.idDonacion())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Donación no encontrada"));
        Comedor comedor = comedorRepository.findById(req.idComedor())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comedor no encontrado"));

        if (donacion.getEstado() == EstadoDonacion.ENTREGADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Esta donación ya fue entregada por completo");
        }
        if (donacion.getFechaVencimiento() != null
                && donacion.getFechaVencimiento().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Esta donación ya está vencida");
        }

        BigDecimal yaEntregado = entregaRepository.totalEntregado(donacion.getId());
        BigDecimal restante = donacion.getCantidad().subtract(yaEntregado);

        if (req.cantidadEntregada().compareTo(restante) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo quedan " + restante + " " + donacion.getUnidad() + " por entregar");
        }

        Entrega e = new Entrega();
        e.setDonacion(donacion);
        e.setComedor(comedor);
        e.setCantidadEntregada(req.cantidadEntregada());
        e.setObservaciones(req.observaciones());
        entregaRepository.save(e);

        BigDecimal nuevoTotal = yaEntregado.add(req.cantidadEntregada());
        donacion.setEstado(nuevoTotal.compareTo(donacion.getCantidad()) == 0
                ? EstadoDonacion.ENTREGADA
                : EstadoDonacion.ASIGNADA);

        return toResponse(e);
    }

    @Transactional(readOnly = true)
    public List<EntregaResponse> listar(Integer idComedor) {
        List<Entrega> lista = (idComedor == null)
                ? entregaRepository.findAll()
                : entregaRepository.findByComedorId(idComedor);
        return lista.stream().map(this::toResponse).toList();
    }

    private EntregaResponse toResponse(Entrega e) {
        return new EntregaResponse(
                e.getId(),
                e.getDonacion().getId(),
                e.getDonacion().getProducto(),
                e.getComedor().getId(),
                e.getComedor().getNombre(),
                e.getCantidadEntregada(),
                e.getDonacion().getUnidad(),
                e.getObservaciones());
    }
}