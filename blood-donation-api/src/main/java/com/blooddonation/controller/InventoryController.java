<<<<<<< HEAD
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
=======
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
>>>>>>> 863aa09fd6962b6b3916086163886ac33bcae165
