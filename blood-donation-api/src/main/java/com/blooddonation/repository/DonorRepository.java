package com.blooddonation.repository;

import com.blooddonation.models.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Integer> {
    List<Donor> findByStateAndCityAndIsEligible(String state, String city, boolean isEligible);
}