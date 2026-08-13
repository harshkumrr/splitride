package com.splitride.splitride.service;

import com.splitride.splitride.entity.User;

public interface UserService {

    User registerUser(User user);

    String loginUser(String email, String password);

}