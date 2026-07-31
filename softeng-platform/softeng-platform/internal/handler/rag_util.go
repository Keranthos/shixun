package handler

import "fmt"

func extractCommentID(result map[string]interface{}) string {
	if result == nil {
		return ""
	}
	for _, k := range []string{"commentId", "comment_id", "id", "comment_Id"} {
		if v, ok := result[k]; ok && v != nil {
			return fmt.Sprintf("%v", v)
		}
	}
	return ""
}

func hookCourseUploadResources(h *CourseHandler, result map[string]interface{}) {
	if h.ragHook == nil || result == nil {
		return
	}
	if r1, ok := result["resource1"].(map[string]interface{}); ok {
		if id := r1["resource_id"]; id != nil {
			h.ragHook.OnCourseResourceAdded("web", fmt.Sprintf("%v", id))
		}
	}
	if r2, ok := result["resource2"].(map[string]interface{}); ok {
		if id := r2["resource_id"]; id != nil {
			h.ragHook.OnCourseResourceAdded("upload", fmt.Sprintf("%v", id))
		}
	}
}
