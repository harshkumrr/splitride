package com.splitride.splitride.controller;

import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.service.RideGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideGroupController {

    @Autowired
    private RideGroupService rideGroupService;

    @PostMapping("/request")
    public RideGroup requestRide(@RequestBody Map<String, String> request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String origin = request.get("origin");
        String destination = request.get("destination");

        return rideGroupService.createRideRequest(userEmail, origin, destination);
    }

}