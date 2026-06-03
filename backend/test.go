package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	pool, err := pgxpool.New(context.Background(), "postgres://uag:secret@localhost:5433/uag_db?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	// Let's run the exact same query with QueryRow to see if it fails
	where := "WHERE 1=1 AND o.status = $1"
	args := []interface{}{"Pending", 10, 0}
	
	q := fmt.Sprintf(`
		SELECT o.id, o.order_number, u.full_name, u.email, o.created_at::DATE, o.total, o.status,
		       (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
		FROM orders o
		JOIN users u ON o.user_id = u.id
		%s ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`, where)

	rows, err := pool.Query(context.Background(), q, args...)
	if err != nil {
		log.Fatal("Query error:", err)
	}
	defer rows.Close()
	fmt.Println("Success")
}
