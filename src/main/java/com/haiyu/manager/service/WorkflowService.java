package com.haiyu.manager.service;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.haiyu.manager.dao.CraftMapper;
import com.haiyu.manager.dao.MaterialMapper;
import com.haiyu.manager.dao.ProcessDiagramMapper;
import com.haiyu.manager.pojo.Craft;
import com.haiyu.manager.pojo.Material;
import com.haiyu.manager.pojo.ProcessDiagram;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class  WorkflowService {

    @Resource
    private MaterialMapper materialMapper;
    @Resource
    private CraftMapper craftMapper;
    @Resource
    private ProcessDiagramMapper processDiagramMapper;

    public List<Material> getAllMaterials() {
        return materialMapper.selectAll();
    }

    public List<Craft> getAllCrafts() {
        return craftMapper.selectAll();
    }

    public ProcessDiagram getProcessDiagram(Integer id) {
        return processDiagramMapper.selectByPrimaryKey(id);
    }

    public void saveProcessDiagram(ProcessDiagram diagram) {
        // 如果没有 id 则插入，否则更新
        if(diagram.getId() == null){
            processDiagramMapper.insert(diagram);
        } else {
            processDiagramMapper.updateByPrimaryKey(diagram);
        }
    }

    /**
     * 根据流程图 JSON 数据和最终物料 id 计算所需基础物料数量
     * 这里的逻辑仅为示例，根据你的流程图结构做实际计算
     */
    public Map<Integer, Integer> calculateBaseMaterials(String processJson, Integer finalMaterialId) {
        JSONObject diagram = JSON.parseObject(processJson);
        JSONArray nodes = diagram.getJSONArray("nodes");
        // 此处假设所有 type 为 "material" 的节点为基础物料
        Map<Integer, Integer> baseMaterials = new HashMap<>();
        for (int i = 0; i < nodes.size(); i++) {
            JSONObject node = nodes.getJSONObject(i);
            if ("material".equals(node.getString("type"))) {
                Integer materialId = node.getInteger("id");
                int count = baseMaterials.getOrDefault(materialId, 0);
                baseMaterials.put(materialId, count + 1);
            }
        }
        // 根据实际情况结合工艺数据进行数量调整...
        return baseMaterials;
    }

}