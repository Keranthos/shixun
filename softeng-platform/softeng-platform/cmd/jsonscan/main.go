package main
import (
  "database/sql"
  "fmt"
  _ "github.com/go-sql-driver/mysql"
)
func main() {
  db, _ := sql.Open("mysql", "root:Wan05609@tcp(127.0.0.1:3306)/softeng?charset=utf8mb4")
  defer db.Close()
  var raw interface{}
  db.QueryRow("SELECT learning_path FROM courses WHERE course_id=1001").Scan(&raw)
  fmt.Printf("type=%T\n", raw)
  if b, ok := raw.([]byte); ok { fmt.Println(string(b)[:120]) }
}
