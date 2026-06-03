package com.braintech.eFacturador.controllers.despacho;

import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoSearchCriteria;
import com.braintech.eFacturador.dto.despacho.MarcarEstadoDTO;
import com.braintech.eFacturador.dto.despacho.MisEntregasRutaDTO;
import com.braintech.eFacturador.interfaces.despacho.DeOrdenDespachoService;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.storage.StorageServiceFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/v1/despacho/ordenes")
@AllArgsConstructor
@Slf4j
public class DeOrdenDespachoController {

  private final DeOrdenDespachoService ordenDespachoService;
  private final StorageServiceFactory storageServiceFactory;

  @GetMapping("/pendientes")
  public List<DeOrdenDespacho> getPendientes() {
    return ordenDespachoService.findPendientes();
  }

  @GetMapping("/{id}")
  public ResponseEntity<DeOrdenDespacho> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(ordenDespachoService.findById(id));
  }

  @RequierePermiso(menuUrl = "/despacho/ordenes", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<DeOrdenDespacho> create(@RequestBody DeOrdenDespacho orden) {
    return ResponseEntity.ok(ordenDespachoService.save(orden));
  }

  @RequierePermiso(menuUrl = "/despacho/ordenes", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<DeOrdenDespacho> update(
      @PathVariable Integer id, @RequestBody DeOrdenDespacho orden) {
    orden.setId(id);
    return ResponseEntity.ok(ordenDespachoService.save(orden));
  }

  @PostMapping("/buscar")
  public ResponseEntity<Page<DeOrdenDespachoResumenDTO>> buscar(
      @RequestBody DeOrdenDespachoSearchCriteria criteria) {
    return ResponseEntity.ok(ordenDespachoService.searchByCriteria(criteria));
  }

  @PatchMapping("/{id}/estado")
  public ResponseEntity<DeOrdenDespacho> marcarEstado(
      @PathVariable Integer id, @RequestBody MarcarEstadoDTO dto) {
    return ResponseEntity.ok(
        ordenDespachoService.marcarEstado(id, dto.getEstadoId(), dto.getNotas()));
  }

  @GetMapping("/mis-entregas")
  public ResponseEntity<List<MisEntregasRutaDTO>> getMisEntregas(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate fecha) {
    if (fecha == null) fecha = LocalDate.now();
    return ResponseEntity.ok(ordenDespachoService.getMisEntregas(fecha));
  }

  @RequierePermiso(menuUrl = "/despacho/ordenes", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    ordenDespachoService.disableById(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * Sube el recibo de entrega (foto/imagen) para una orden. El archivo se almacena en el proveedor
   * configurado por la empresa (AWS S3, Azure Blob o Local). Retorna la URL del archivo subido.
   */
  @PostMapping(value = "/{id}/recibo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Map<String, String>> uploadRecibo(
      @PathVariable Integer id, @RequestParam("file") MultipartFile file) throws IOException {
    String url =
        ordenDespachoService.uploadRecibo(
            id, file.getBytes(), file.getOriginalFilename(), file.getContentType());
    return ResponseEntity.ok(Map.of("reciboUrl", url));
  }

  /**
   * Sirve el archivo de recibo cuando el storage es LOCAL. La URL almacenada en DB tiene formato
   * "local://{empresaId}/{filename}". El conductor accede via este endpoint; el backend lee el
   * archivo del disco.
   */
  @GetMapping("/{id}/recibo/file")
  public ResponseEntity<Resource> serveReciboFile(@PathVariable Integer id) throws IOException {
    DeOrdenDespacho orden = ordenDespachoService.findById(id);
    String reciboUrl = orden.getReciboUrl();

    if (reciboUrl == null || !reciboUrl.startsWith("local://")) {
      return ResponseEntity.notFound().build();
    }

    // Formato: local://{empresaId}/{filename}
    String withoutScheme = reciboUrl.substring("local://".length());
    int slash = withoutScheme.indexOf('/');
    Integer empresaId = Integer.parseInt(withoutScheme.substring(0, slash));
    String filename = withoutScheme.substring(slash + 1);

    Path filePath = storageServiceFactory.resolveLocalPath(empresaId, filename);
    if (!Files.exists(filePath)) {
      return ResponseEntity.notFound().build();
    }

    String contentType = Files.probeContentType(filePath);
    if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

    Resource resource = new PathResource(filePath);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
        .contentType(MediaType.parseMediaType(contentType))
        .body(resource);
  }
}
