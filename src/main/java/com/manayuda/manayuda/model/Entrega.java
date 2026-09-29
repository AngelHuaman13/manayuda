package com.manayuda.manayuda.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "entrega")
@Getter @Setter @NoArgsConstructor
public class Entrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_donacion")
    private Donacion donacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_comedor")
    private Comedor comedor;

    @Column(name = "cantidad_entregada", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidadEntregada;

    @Column(name = "fecha_entrega", insertable = false, updatable = false)
    private LocalDateTime fechaEntrega;

    @Column(length = 255)
    private String observaciones;
}