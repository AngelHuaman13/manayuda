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

    @Transactional
    public DonacionResponse editar(Integer id, DonacionRequest req) {
        Donacion d = buscarDelDueno(id, req.idUsuario());
        exigirSinEntregas(d, "editar");

        d.setProducto(req.producto());
        d.setCantidad(req.cantidad());
        d.setUnidad(req.unidad());
        d.setFechaVencimiento(req.fechaVencimiento());

        // No hace falta llamar a save: al estar dentro de @Transactional, JPA guarda el cambio solo
        return toResponse(d);
    }

    @Transactional
    public void eliminar(Integer id, Integer idUsuario) {
        Donacion d = buscarDelDueno(id, idUsuario);
        exigirSinEntregas(d, "eliminar");
        donacionRepository.delete(d);
    }

    // Busca la donación y comprueba que quien la pide sea su dueño
    private Donacion buscarDelDueno(Integer id, Integer idUsuario) {
        Donacion d = donacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Donación no encontrada"));

        if (!d.getUsuario().getId().equals(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo quien registró la donación puede modificarla");
        }
        return d;
    }

    // Una donación con entregas ya forma parte del historial y no se toca
    private void exigirSinEntregas(Donacion d, String accion) {
        if (d.getEstado() != EstadoDonacion.DISPONIBLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede " + accion + ": la donación ya tiene entregas registradas");
        }
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