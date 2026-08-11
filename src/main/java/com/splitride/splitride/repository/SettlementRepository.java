package com.splitride.splitride.repository;

import com.splitride.splitride.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroupMemberId(Long groupMemberId);

    List<Settlement> findByPaidFalse();

}