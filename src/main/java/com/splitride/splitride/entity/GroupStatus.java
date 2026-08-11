package com.splitride.splitride.entity;

public enum GroupStatus {
    FORMING,     // still accepting members, matching in progress
    CONFIRMED,   // group is locked, ride is happening
    COMPLETED,   // ride finished
    CANCELLED
}