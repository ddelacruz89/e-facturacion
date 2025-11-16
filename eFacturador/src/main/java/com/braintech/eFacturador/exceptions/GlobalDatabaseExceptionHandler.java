package com.braintech.eFacturador.exceptions;

import com.braintech.eFacturador.annotations.FieldDescription;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import java.lang.reflect.Field;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
@Slf4j
public class GlobalDatabaseExceptionHandler {

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Object> handleDataIntegrityViolation(
      DataIntegrityViolationException ex, WebRequest request) {
    Throwable root = ex.getRootCause();
    Map<String, Object> body = new HashMap<>();
    body.put("status", "ERROR");
    body.put("error", "Data integrity violation");

    // Manejo específico para claves únicas
    if (root instanceof PSQLException psqlEx) {
      var serverErrorMessage = psqlEx.getServerErrorMessage();
      if (serverErrorMessage != null) {
        String detail = serverErrorMessage.getDetail();
        String constraint = serverErrorMessage.getConstraint();
        if (constraint != null) log.error("psql_constraint", constraint);

        if ("23505".equals(psqlEx.getSQLState())) { // Unique violation
          String customMessage = buildCustomUniqueViolationMessage(detail, ex.getMessage());
          body.put("message", customMessage);
          if (detail != null) {
            log.debug("detail", detail);
          }
        } else {
          body.put("message", ex.getMessage());
        }
      }
    } else {
      body.put("message", ex.getMessage());
    }

    return new ResponseEntity<>(body, HttpStatus.CONFLICT);
  }

  /**
   * Construye un mensaje personalizado para violaciones de unique constraint usando las
   * anotaciones @FieldDescription de los campos.
   */
  private String buildCustomUniqueViolationMessage(String detail, String originalMessage) {
    if (detail == null) {
      return "Ya existe un registro con los mismos valores únicos.";
    }

    // Extraer los nombres de columnas del detalle
    // Formato: "Key (empresa_id, secuencia)=(1, 0) already exists."
    Pattern pattern = Pattern.compile("Key \\(([^)]+)\\)=\\(([^)]+)\\)");
    Matcher matcher = pattern.matcher(detail);

    if (matcher.find()) {
      String columns = matcher.group(1);
      String values = matcher.group(2);

      // Dividir las columnas y valores
      String[] columnArray = columns.split(",\\s*");
      String[] valueArray = values.split(",\\s*");

      // Intentar encontrar la entidad desde el mensaje de error
      String entityName = extractEntityName(originalMessage);

      // Construir mensaje con todos los campos
      StringBuilder message = new StringBuilder();
      int fieldCount = 0;

      for (int i = 0; i < columnArray.length; i++) {
        String columnName = columnArray[i].trim();
        String value = i < valueArray.length ? valueArray[i].trim() : "";

        String fieldDescription = getFieldDescriptionByColumnName(entityName, columnName);
        String displayName =
            fieldDescription != null ? fieldDescription : formatColumnName(columnName);

        if (fieldCount > 0) {
          if (fieldCount == columnArray.length - 1) {
            message.append(" y ");
          } else {
            message.append(", ");
          }
        }

        message.append(displayName);
        fieldCount++;
      }

      if (fieldCount == 0) {
        return "Ya existe un registro con los mismos valores únicos.";
      }

      // Construir mensaje final
      return fieldCount == 1
          ? "Ya existe un registro con esta " + message + "."
          : "Ya existe un registro con estos valores: " + message + ".";
    }

    return "Ya existe un registro con los mismos valores únicos.";
  }

  /** Extrae el nombre de la entidad del mensaje de error */
  private String extractEntityName(String message) {
    // Intentar extraer el nombre de la clase de la entidad
    Pattern pattern = Pattern.compile("\\[([a-zA-Z.]+)#");
    Matcher matcher = pattern.matcher(message);
    if (matcher.find()) {
      return matcher.group(1);
    }
    return null;
  }

  /**
   * Busca la descripción del campo usando @FieldDescription basándose en el nombre de la columna.
   * Busca en la clase y todas sus superclases.
   */
  private String getFieldDescriptionByColumnName(String entityClassName, String columnName) {
    if (entityClassName == null) {
      return null;
    }

    try {
      Class<?> entityClass = Class.forName(entityClassName);

      // Buscar en la clase actual y todas las superclases
      Class<?> currentClass = entityClass;
      System.out.println("DEBUG: Buscando columna '" + columnName + "' en jerarquía de clases...");
      while (currentClass != null && currentClass != Object.class) {
        System.out.println("  -> Revisando clase: " + currentClass.getName());
        Field[] fields = currentClass.getDeclaredFields();

        for (Field field : fields) {
          // Verificar si el campo tiene @Column o @JoinColumn con el nombre buscado
          Column columnAnnotation = field.getAnnotation(Column.class);
          JoinColumn joinColumnAnnotation = field.getAnnotation(JoinColumn.class);

          String fieldColumnName = null;
          if (columnAnnotation != null && !columnAnnotation.name().isEmpty()) {
            fieldColumnName = columnAnnotation.name();
          } else if (joinColumnAnnotation != null && !joinColumnAnnotation.name().isEmpty()) {
            fieldColumnName = joinColumnAnnotation.name();
          }

          // Si coincide el nombre de columna, buscar @FieldDescription
          if (columnName.equals(fieldColumnName)) {
            FieldDescription fieldDesc = field.getAnnotation(FieldDescription.class);

            // Debug: mostrar todas las anotaciones del campo
            System.out.println(
                "DEBUG ["
                    + currentClass.getSimpleName()
                    + "."
                    + field.getName()
                    + "] -> @FieldDescription = "
                    + (fieldDesc != null ? "'" + fieldDesc.value() + "'" : "NULL")
                    + ", Anotaciones totales: "
                    + field.getAnnotations().length);

            if (fieldDesc != null) {
              return fieldDesc.value();
            }
            // Si no tiene @FieldDescription, retornar el nombre del campo formateado
            return formatFieldName(field.getName());
          }
        }

        // Pasar a la superclase
        currentClass = currentClass.getSuperclass();
      }
    } catch (ClassNotFoundException e) {
      // Ignorar si no se encuentra la clase
    }

    return null;
  }

  /** Formatea el nombre del campo de camelCase a texto legible */
  private String formatFieldName(String fieldName) {
    // Remover sufijos comunes como "Id"
    if (fieldName.endsWith("Id")) {
      fieldName = fieldName.substring(0, fieldName.length() - 2);
    }

    // Convertir camelCase a palabras separadas
    return fieldName.replaceAll("([A-Z])", " $1").trim();
  }

  /** Formatea el nombre de columna de snake_case a texto legible */
  private String formatColumnName(String columnName) {
    if (columnName == null || columnName.isEmpty()) {
      return columnName;
    }

    // Convertir snake_case a palabras separadas con mayúscula inicial
    String[] parts = columnName.split("_");
    StringBuilder result = new StringBuilder();

    for (String part : parts) {
      if (!part.isEmpty()) {
        if (!result.isEmpty()) {
          result.append(" ");
        }
        result.append(Character.toUpperCase(part.charAt(0)));
        if (part.length() > 1) {
          result.append(part.substring(1).toLowerCase(Locale.ROOT));
        }
      }
    }

    return result.toString();
  }

  @ExceptionHandler(SQLException.class)
  public ResponseEntity<Object> handleSQLException(SQLException ex, WebRequest request) {
    Map<String, Object> body = new HashMap<>();
    body.put("status", "ERROR");
    body.put("error", "SQL Exception");
    body.put("message", ex.getMessage());
    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // Puedes agregar más handlers para otros errores SQL específicos aquí
}
