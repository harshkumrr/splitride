package com.splitride.splitride.service;

import com.splitride.splitride.entity.GroupMember;
import com.splitride.splitride.entity.RideGroup;

public interface GroupMemberService {

    GroupMember joinGroup(RideGroup group, String userEmail, String dropPoint);

}