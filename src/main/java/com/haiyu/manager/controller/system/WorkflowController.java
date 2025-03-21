package com.haiyu.manager.controller.system;

import com.haiyu.manager.pojo.Craft;
import com.haiyu.manager.pojo.Material;
import com.haiyu.manager.pojo.ProcessDiagram;
import com.haiyu.manager.service.WorkflowService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("workflow")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/workflow")
    public String workflowPage() {
        return "workflow/workflow"; // 返回 Thymeleaf 模板 workflow.html
    }

    @GetMapping("/materials")
    @ResponseBody
    public List<Material> getMaterials() {
        return workflowService.getAllMaterials();
    }

    @GetMapping("/crafts")
    @ResponseBody
    public List<Craft> getCrafts() {
        return workflowService.getAllCrafts();
    }

    @PostMapping("/processDiagram/save")
    @ResponseBody
    public String saveProcessDiagram(@RequestBody ProcessDiagram diagram) {
        workflowService.saveProcessDiagram(diagram);
        return "success";
    }

    @GetMapping("/queryWorkflow")
    public String queryWorkflow() {
        return "workflow/queryWorkflow"; // 返回 Thymeleaf 模板 workflow.html
    }

    @GetMapping("/diagrams")
    @ResponseBody
    public List<ProcessDiagram> getDiagrams() {
        return workflowService.getAllDiagrams();
    }

    // 根据ID查询单个流程图
    @GetMapping("/diagrams/{id}")
    @ResponseBody
    public ProcessDiagram getDiagramById(@PathVariable Integer id) {
        return workflowService.getProcessDiagram(id);
    }
}
