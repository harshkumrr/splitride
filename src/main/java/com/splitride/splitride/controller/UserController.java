package com.splitride.splitride.controller;

import com.splitride.splitride.entity.User;
import com.splitride.splitride.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginRequest) {
        String token = userService.loginUser(loginRequest.get("email"), loginRequest.get("password"));
        return Map.of("token", token);
    }

}