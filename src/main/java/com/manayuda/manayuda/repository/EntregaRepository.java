package com.manayuda.manayuda.repository;

import com.manayuda.manayuda.model.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EntregaRepository extends JpaRepository<Entrega, Integer> {
    List<Entrega> findByComedorId(Integer idComedor);
}