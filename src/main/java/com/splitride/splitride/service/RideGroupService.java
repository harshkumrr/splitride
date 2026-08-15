package com.splitride.splitride.service;

import com.splitride.splitride.entity.RideGroup;

public interface RideGroupService {

    RideGroup createRideRequest(String userEmail, String origin, Double originLat, Double originLng, String destination);

}