package com.splitride.splitride.repository;

import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.entity.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RideGroupRepository extends JpaRepository<RideGroup, Long> {

    List<RideGroup> findByStatus(GroupStatus status);

    List<RideGroup> findByOriginAndDestination(String origin, String destination);

    List<RideGroup> findByDestination(String destination);

}