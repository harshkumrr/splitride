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

    @Override
    public RideGroup createRideRequest(String userEmail, String origin, String destination) {
        List<RideGroup> existingGroups = rideGroupRepository.findByOriginAndDestination(origin, destination);

        RideGroup group = null;

        for (RideGroup g : existingGroups) {
            if (g.getStatus() == GroupStatus.FORMING) {
                group = g;
                break;
            }
        }

        if (group == null) {
            group = new RideGroup();
            group.setOrigin(origin);
            group.setDestination(destination);
            group.setDepartureTime(LocalDateTime.now().plusMinutes(30));
            group.setStatus(GroupStatus.FORMING);
            group = rideGroupRepository.save(group);
        }

        groupMemberService.joinGroup(group, userEmail, destination);

        return group;
    }

}