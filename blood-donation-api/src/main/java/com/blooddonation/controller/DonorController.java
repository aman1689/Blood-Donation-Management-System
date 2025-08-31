// <<<<<<< HEAD
package com.blooddonation.controller;

import com.blooddonation.models.Donor;
import com.blooddonation.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    @Autowired
    private DonorRepository donorRepository;

    @GetMapping
    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Donor> registerDonor(@RequestBody Donor donor) {
        donor.setRegistrationDate(LocalDate.now());
        donor.setEligible(true);
        Donor savedDonor = donorRepository.save(donor);
        return new ResponseEntity<>(savedDonor, HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public List<Donor> findDonors(@RequestParam String state, @RequestParam String city) {
        return donorRepository.findByStateAndCityAndIsEligible(state, city, true);
    }
}
//=====
package com.blooddonation.controller;

import com.blooddonation.models.Donor;
import com.blooddonation.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

// >>>>>>> 863aa09fd6962b6b3916086163886ac33bcae165
