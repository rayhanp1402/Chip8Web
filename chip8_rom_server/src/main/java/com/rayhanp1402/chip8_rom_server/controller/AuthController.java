package com.rayhanp1402.chip8_rom_server.controller;

import com.rayhanp1402.chip8_rom_server.model.User;
import com.rayhanp1402.chip8_rom_server.service.UserService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login/google")
    public String googleLogin(OAuth2AuthenticationToken token) {
        Map<String, Object> attributes = token.getPrincipal().getAttributes();
        User user = userService.processGoogleLogin(attributes);
        return "Logged in successfully as " + user.getName();
    }
}
