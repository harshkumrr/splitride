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
import java.util.List;

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

}