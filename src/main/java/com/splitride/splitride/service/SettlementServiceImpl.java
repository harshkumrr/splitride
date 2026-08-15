package com.splitride.splitride.service;

import com.splitride.splitride.entity.GroupMember;
import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.entity.Settlement;
import com.splitride.splitride.repository.GroupMemberRepository;
import com.splitride.splitride.repository.SettlementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettlementServiceImpl implements SettlementService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Override
    public void splitFare(RideGroup group, BigDecimal totalFare) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());

        if (members.isEmpty()) {
            return;
        }

        Map<GroupMember, Double> memberDistances = new HashMap<>();
        double totalDistance = 0.0;
        boolean allHaveCoordinates = true;

        for (GroupMember member : members) {
            if (member.getDropLat() == null || member.getDropLng() == null
                    || group.getOriginLat() == null || group.getOriginLng() == null) {
                allHaveCoordinates = false;
                break;
            }
            double distance = calculateDistanceKm(
                    group.getOriginLat(), group.getOriginLng(),
                    member.getDropLat(), member.getDropLng()
            );
            memberDistances.put(member, distance);
            totalDistance += distance;
        }

        if (!allHaveCoordinates || totalDistance == 0.0) {
            splitEvenly(members, totalFare);
            return;
        }

        for (GroupMember member : members) {
            double memberDistance = memberDistances.get(member);
            BigDecimal proportion = BigDecimal.valueOf(memberDistance / totalDistance);
            BigDecimal share = totalFare.multiply(proportion).setScale(2, RoundingMode.HALF_UP);

            member.setFareShare(share);
            groupMemberRepository.save(member);

            Settlement settlement = new Settlement();
            settlement.setGroupMember(member);
            settlement.setAmount(share);
            settlement.setPaid(false);
            settlementRepository.save(settlement);
        }
    }

    private void splitEvenly(List<GroupMember> members, BigDecimal totalFare) {
        BigDecimal share = totalFare.divide(BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);

        for (GroupMember member : members) {
            member.setFareShare(share);
            groupMemberRepository.save(member);

            Settlement settlement = new Settlement();
            settlement.setGroupMember(member);
            settlement.setAmount(share);
            settlement.setPaid(false);
            settlementRepository.save(settlement);
        }
    }

    private double calculateDistanceKm(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

}