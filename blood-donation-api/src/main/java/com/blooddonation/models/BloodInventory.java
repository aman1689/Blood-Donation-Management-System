<<<<<<< HEAD
package com.blooddonation.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inventory")
public class BloodInventory {
    @Id
    @Column(name = "blood_type")
    private String bloodType;
    private int units;
    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    // Getters and Setters
    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }
    public int getUnits() { return units; }
    public void setUnits(int units) { this.units = units; }
    public LocalDate getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }
=======
package com.blooddonation.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inventory")
public class BloodInventory {
    @Id
    @Column(name = "blood_type")
    private String bloodType;
    private int units;
    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    // Getters and Setters
    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }
    public int getUnits() { return units; }
    public void setUnits(int units) { this.units = units; }
    public LocalDate getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }
>>>>>>> 863aa09fd6962b6b3916086163886ac33bcae165
}