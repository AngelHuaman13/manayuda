package com.manayuda.manayuda.repository;

import com.manayuda.manayuda.model.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface EntregaRepository extends JpaRepository<Entrega, Integer> {
    List<Entrega> findByComedorId(Integer idComedor);

    @Query("select coalesce(sum(e.cantidadEntregada), 0) from Entrega e where e.donacion.id = :idDonacion")
    BigDecimal totalEntregado(@Param("idDonacion") Integer idDonacion);
}