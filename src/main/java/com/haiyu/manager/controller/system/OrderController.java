package com.haiyu.manager.controller.system;

import com.haiyu.manager.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private WorkflowService workflowService;

    @PostMapping("/calculate")
    public Map<Integer, Integer> calculateMaterials(@RequestParam("diagramJson") String diagramJson,
                                                    @RequestParam("finalMaterialId") Integer finalMaterialId) {
        return workflowService.calculateBaseMaterials(diagramJson, finalMaterialId);
    }
}