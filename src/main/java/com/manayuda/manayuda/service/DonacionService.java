package com.manayuda.manayuda.service;

import com.manayuda.manayuda.dto.DonacionRequest;
import com.manayuda.manayuda.dto.DonacionResponse;
import com.manayuda.manayuda.model.Donacion;
import com.manayuda.manayuda.model.EstadoDonacion;
import com.manayuda.manayuda.model.Rol;
import com.manayuda.manayuda.model.Usuario;
import com.manayuda.manayuda.repository.DonacionRepository;
import com.manayuda.manayuda.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonacionService {

    private final DonacionRepository donacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public DonacionResponse crear(DonacionRequest req) {
        Usuario usuario = usuarioRepository.findById(req.idUsuario())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (usuario.getRol() != Rol.DONANTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo los donantes pueden registrar donaciones");
        }

        Donacion d = new Donacion();
        d.setUsuario(usuario);
        d.setProducto(req.producto());
        d.setCantidad(req.cantidad());
        d.setUnidad(req.unidad());
        d.setFechaVencimiento(req.fechaVencimiento());
        d.setEstado(EstadoDonacion.DISPONIBLE);

        return toResponse(donacionRepository.save(d));
    }

    @Transactional(readOnly = true)
    public List<DonacionResponse> listar(EstadoDonacion estado) {
        List<Donacion> lista = (estado == null)
                ? donacionRepository.findAll()
                : donacionRepository.findByEstado(estado);

        LocalDate hoy = LocalDate.now();
        return lista.stream()
                // Las vencidas que no se entregaron ya no se muestran
                .filter(d -> d.getEstado() == EstadoDonacion.ENTREGADA
                        || d.getFechaVencimiento() == null
                        || !d.getFechaVencimiento().isBefore(hoy))
                .map(this::toResponse)
                .toList();
    }

    private DonacionResponse toResponse(Donacion d) {
        return new DonacionResponse(
                d.getId(),
                d.getUsuario().getId(),
                d.getProducto(),
                d.getCantidad(),
                d.getUnidad(),
                d.getFechaVencimiento(),
                d.getEstado());
    }
}