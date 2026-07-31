package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"softeng-platform/internal/repository"
)

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:Wan05609@tcp(127.0.0.1:3306)/softeng?charset=utf8mb4&parseTime=true"
	}
	db, err := repository.NewDatabase(dsn)
	if err != nil {
		panic(err)
	}
	repo := repository.NewCourseRepository(db)
	c, err := repo.GetByID(context.Background(), "1001")
	if err != nil {
		panic(err)
	}
	b, _ := json.MarshalIndent(map[string]interface{}{
		"learningPath":   c["learningPath"],
		"contentInsight": c["contentInsight"],
	}, "", "  ")
	fmt.Println(string(b))
}
