package com.splitride.splitride.service;

import com.splitride.splitride.entity.RideGroup;

import java.math.BigDecimal;

public interface SettlementService {

    void splitFare(RideGroup group, BigDecimal totalFare);

}