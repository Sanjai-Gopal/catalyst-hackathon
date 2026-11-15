      if (typeof window !== 'undefined') {
    window.__webmcp_manifest = {
      name: "CareNest AI Agent Tools",
      version: "1.0.0",
      tools: [
        {
          name: "read_medication_schedule",
          description: "Read active medication schedule and adherence status",
          inputSchema: { type: "object", properties: { slot: { type: "string", enum: ["morning", "afternoon", "evening", "night"] } } }
        },
        {
          name: "log_medication_adherence",
          description: "Log adherence confirmation for a scheduled medication",
          inputSchema: { type: "object", properties: { medId: { type: "string" } }, required: ["medId"] }
        }
      ]
    };
    if ('modelContext' in navigator && typeof navigator.modelContext.registerTool === 'function') {
      try {
        navigator.modelContext.registerTool({
          name: "read_medication_schedule",
          description: "Read active medication schedule",
          inputSchema: { type: "object", properties: {} },
          execute: async () => JSON.parse(localStorage.getItem('carenest_medications') || '[]')
        });
      } catch (e) {}
    }
  }
