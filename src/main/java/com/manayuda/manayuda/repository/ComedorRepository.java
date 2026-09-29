package com.manayuda.manayuda.repository;

import com.manayuda.manayuda.model.Comedor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComedorRepository extends JpaRepository<Comedor, Integer> {
    List<Comedor> findByDistrito(String distrito);
}