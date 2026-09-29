package com.manayuda.manayuda.repository;

import com.manayuda.manayuda.model.Donacion;
import com.manayuda.manayuda.model.EstadoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonacionRepository extends JpaRepository<Donacion, Integer> {
    List<Donacion> findByEstado(EstadoDonacion estado);
}