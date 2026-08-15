package com.splitride.splitride.service;

import com.splitride.splitride.entity.GroupMember;
import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.entity.User;
import com.splitride.splitride.repository.GroupMemberRepository;
import com.splitride.splitride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GroupMemberServiceImpl implements GroupMemberService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public GroupMember joinGroup(RideGroup group, String userEmail, String dropPoint) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember member = new GroupMember();
        member.setUser(user);
        member.setGroup(group);
        member.setDropPoint(dropPoint);

        return groupMemberRepository.save(member);
    }

}