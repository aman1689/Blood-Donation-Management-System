// --- src/main/java/com/blooddonation/repository/InventoryRepository.java ---
package com.blooddonation.repository;

import com.blooddonation.models.BloodInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends JpaRepository<BloodInventory, String> {
}