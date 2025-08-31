package com.blooddonation.controller;

import com.blooddonation.models.BloodInventory;
import com.blooddonation.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping
    public List<BloodInventory> getInventory() {
        return inventoryRepository.findAll();
    }
}
