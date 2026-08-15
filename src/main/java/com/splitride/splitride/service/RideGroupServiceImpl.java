package com.splitride.splitride.service;

import com.splitride.splitride.entity.GroupStatus;
import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.repository.RideGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideGroupServiceImpl implements RideGroupService {

    @Autowired
    private RideGroupRepository rideGroupRepository;

    @Autowired
    private GroupMemberService groupMemberService;

    private static final double MAX_DISTANCE_KM = 1.0;
    private static final int MAX_TIME_WINDOW_MINUTES = 20;

    @Override
    public RideGroup createRideRequest(String userEmail, String origin, Double originLat, Double originLng, String destination) {
        List<RideGroup> existingGroups = rideGroupRepository.findByDestination(destination);

        RideGroup group = null;

        for (RideGroup g : existingGroups) {
            if (g.getStatus() != GroupStatus.FORMING) {
                continue;
            }
            if (g.getOriginLat() == null || g.getOriginLng() == null) {
                continue;
            }

            double distance = calculateDistanceKm(originLat, originLng, g.getOriginLat(), g.getOriginLng());
            long minutesApart = Math.abs(java.time.Duration.between(g.getCreatedAt(), LocalDateTime.now()).toMinutes());

            if (distance <= MAX_DISTANCE_KM && minutesApart <= MAX_TIME_WINDOW_MINUTES) {
                group = g;
                break;
            }
        }

        if (group == null) {
            group = new RideGroup();
            group.setOrigin(origin);
            group.setOriginLat(originLat);
            group.setOriginLng(originLng);
            group.setDestination(destination);
            group.setDepartureTime(LocalDateTime.now().plusMinutes(30));
            group.setStatus(GroupStatus.FORMING);
            group = rideGroupRepository.save(group);
        }

        groupMemberService.joinGroup(group, userEmail, destination);

        return group;
    }

    private double calculateDistanceKm(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // Earth's radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

}