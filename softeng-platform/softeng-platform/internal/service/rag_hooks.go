package service

import (
	"context"
	"log"
)

// RagIndexHook 资源变更时异步同步向量索引
type RagIndexHook struct {
	ix *RagIndexer
}

func NewRagIndexHook(ix *RagIndexer) *RagIndexHook {
	return &RagIndexHook{ix: ix}
}

func (h *RagIndexHook) schedule(fn func(context.Context) error) {
	if h == nil || h.ix == nil || !h.ix.Configured() {
		return
	}
	go func() {
		if err := fn(context.Background()); err != nil {
			log.Printf("[RAG] sync hook: %v", err)
		}
	}()
}

func (h *RagIndexHook) OnApproved(resourceType, itemID string) {
	h.schedule(func(ctx context.Context) error {
		return h.ix.UpsertResource(ctx, resourceType, itemID)
	})
}

func (h *RagIndexHook) OnRejected(resourceType, itemID string) {
	h.schedule(func(ctx context.Context) error {
		return h.ix.DeleteResource(ctx, resourceType, itemID)
	})
}

func (h *RagIndexHook) OnResourceChanged(resourceType, itemID string) {
	h.schedule(func(ctx context.Context) error {
		return h.ix.SyncResource(ctx, resourceType, itemID)
	})
}

func (h *RagIndexHook) OnCommentAdded(commentID string) {
	h.schedule(func(ctx context.Context) error {
		return h.ix.UpsertComment(ctx, commentID)
	})
}

func (h *RagIndexHook) OnCommentDeleted(commentID string) {
	h.schedule(func(ctx context.Context) error {
		return h.ix.DeleteComment(ctx, commentID)
	})
}

func (h *RagIndexHook) OnCourseResourceAdded(kind, resourceID string) {
	h.schedule(func(ctx context.Context) error {
		return h.ix.UpsertCourseResource(ctx, kind, resourceID)
	})
}
