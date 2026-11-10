# Imagen base: solo el runtime de Java 17 (JRE), más liviana que el JDK completo
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia el JAR generado por el job "build" del pipeline
COPY target/lab12026p.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]