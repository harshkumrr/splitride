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

    @Override
    public RideGroup createRideRequest(String userEmail, String origin, String destination) {
        List<RideGroup> existingGroups = rideGroupRepository.findByOriginAndDestination(origin, destination);

        for (RideGroup group : existingGroups) {
            if (group.getStatus() == GroupStatus.FORMING) {
                return group;
            }
        }

        RideGroup newGroup = new RideGroup();
        newGroup.setOrigin(origin);
        newGroup.setDestination(destination);
        newGroup.setDepartureTime(LocalDateTime.now().plusMinutes(30));
        newGroup.setStatus(GroupStatus.FORMING);

        return rideGroupRepository.save(newGroup);
    }

}