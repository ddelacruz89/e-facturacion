package com.braintech.eFacturador.config;

import com.braintech.eFacturador.dao.helpdesk.HdEstadoRepository;
import com.braintech.eFacturador.dao.helpdesk.HdPrioridadRepository;
import com.braintech.eFacturador.jpa.helpdesk.HdEstado;
import com.braintech.eFacturador.jpa.helpdesk.HdPrioridad;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@AllArgsConstructor
public class HelpdeskCatalogoInitializer implements CommandLineRunner {

  private final HdEstadoRepository estadoRepository;
  private final HdPrioridadRepository prioridadRepository;

  @Override
  @Transactional
  public void run(String... args) {
    seedEstados();
    seedPrioridades();
  }

  private void seedEstados() {
    if (estadoRepository.count() > 0) return;

    log.info("Inicializando catálogo hd_estado...");
    estadoRepository.saveAll(
        List.of(
            new HdEstado(
                "PEND_ASIG",
                "Pendiente asignación",
                "Ticket recién creado, sin soporte asignado",
                1,
                false),
            new HdEstado("ASIG", "Asignado", "Soporte asignado, pendiente de iniciar", 2, false),
            new HdEstado("PROC", "En proceso", "Soporte trabajando activamente", 3, false),
            new HdEstado("ESP", "En espera", "Bloqueado esperando respuesta del cliente", 4, false),
            new HdEstado("COMP", "Completado", "Resuelto satisfactoriamente", 5, true),
            new HdEstado("CANC", "Cancelado", "Cancelado antes de resolver", 6, true)));
    log.info("hd_estado inicializado con {} registros.", estadoRepository.count());
  }

  private void seedPrioridades() {
    List<HdPrioridad> catalog =
        List.of(
            new HdPrioridad("CRITICA", "Crítica", 0, 0),
            new HdPrioridad("ALTA", "Alta", 4, 1),
            new HdPrioridad("MEDIA", "Media", 24, 2),
            new HdPrioridad("BAJA", "Baja", 72, 3));

    long nuevas =
        catalog.stream()
            .filter(p -> !prioridadRepository.existsById(p.getId()))
            .peek(prioridadRepository::save)
            .count();
    if (nuevas > 0) log.info("hd_prioridad: {} registro(s) nuevos insertados.", nuevas);
  }
}
