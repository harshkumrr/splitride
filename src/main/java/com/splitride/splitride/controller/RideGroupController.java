package com.splitride.splitride.controller;

import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.repository.RideGroupRepository;
import com.splitride.splitride.service.RideGroupService;
import com.splitride.splitride.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideGroupController {

    @Autowired
    private RideGroupService rideGroupService;

    @Autowired
    private SettlementService settlementService;

    @Autowired
    private RideGroupRepository rideGroupRepository;

    @PostMapping("/request")
    public RideGroup requestRide(@RequestBody Map<String, Object> request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String origin = (String) request.get("origin");
        String destination = (String) request.get("destination");
        Double originLat = request.get("originLat") != null ? Double.valueOf(request.get("originLat").toString()) : null;
        Double originLng = request.get("originLng") != null ? Double.valueOf(request.get("originLng").toString()) : null;
        Double destLat = request.get("destLat") != null ? Double.valueOf(request.get("destLat").toString()) : null;
        Double destLng = request.get("destLng") != null ? Double.valueOf(request.get("destLng").toString()) : null;

        return rideGroupService.createRideRequest(userEmail, origin, originLat, originLng, destination, destLat, destLng);
    }

    @PostMapping("/{groupId}/finalize")
    public String finalizeGroup(@PathVariable Long groupId, @RequestBody Map<String, String> request) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        BigDecimal totalFare = new BigDecimal(request.get("totalFare"));
        settlementService.splitFare(group, totalFare);

        group.setTotalFare(totalFare);
        rideGroupRepository.save(group);

        return "Fare split successfully among group members";
    }

}