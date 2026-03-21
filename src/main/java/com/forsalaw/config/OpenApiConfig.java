package com.forsalaw.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI forsaLawOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("ForsaLaw API")
                        .description("API Backend ForsaLaw - LegalTech. Utiliser **Authorize** pour ajouter le token JWT après login.")
                        .version("0.1"))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description(
                                                "Après login, copiez **uniquement** le token (chaîne commençant souvent par eyJ...). "
                                                        + "Ne préfixez pas par « Bearer » : Swagger l’ajoute tout seul. "
                                                        + "Si vous mettez « Bearer eyJ... », le header peut devenir « Bearer Bearer ... » et le token sera refusé (401).")));
    }
}
