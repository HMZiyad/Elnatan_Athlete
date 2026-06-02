package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/uag/backend/internal/models"
)

// CartRepository handles shopping cart database operations.
type CartRepository struct {
	db *pgxpool.Pool
}

func NewCartRepository(db *pgxpool.Pool) *CartRepository {
	return &CartRepository{db: db}
}

// GetOrCreate returns the user's cart, creating one if it doesn't exist.
func (r *CartRepository) GetOrCreate(ctx context.Context, userID uuid.UUID) (*models.Cart, error) {
	cart := &models.Cart{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1`, userID,
	).Scan(&cart.ID, &cart.UserID, &cart.CreatedAt, &cart.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		cart.ID = uuid.New()
		cart.UserID = userID
		err = r.db.QueryRow(ctx,
			`INSERT INTO carts (id, user_id) VALUES ($1, $2) RETURNING created_at, updated_at`,
			cart.ID, cart.UserID,
		).Scan(&cart.CreatedAt, &cart.UpdatedAt)
		if err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	// Load items
	items, err := r.ListItems(ctx, cart.ID)
	if err != nil {
		return nil, err
	}
	cart.Items = items

	// Calculate subtotal
	var subtotal float64
	for _, item := range items {
		subtotal += item.Price * float64(item.Quantity)
		cart.ItemCount += item.Quantity
	}
	cart.Subtotal = subtotal

	return cart, nil
}

func (r *CartRepository) ListItems(ctx context.Context, cartID uuid.UUID) ([]models.CartItem, error) {
	rows, err := r.db.Query(ctx, `
		SELECT ci.id, ci.cart_id, ci.product_id, p.name, ci.size, ci.color, ci.price, ci.quantity, p.image_url, ci.created_at, ci.updated_at
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.cart_id = $1`, cartID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var item models.CartItem
		if err := rows.Scan(&item.ID, &item.CartID, &item.ProductID, &item.Name, &item.Size, &item.Color,
			&item.Price, &item.Quantity, &item.ImageURL, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *CartRepository) AddItem(ctx context.Context, cartID, productID uuid.UUID, size, color string, price float64, qty int) (*models.CartItem, error) {
	item := &models.CartItem{ID: uuid.New(), CartID: cartID, ProductID: productID, Price: price, Quantity: qty}
	if size != "" {
		item.Size = &size
	}
	if color != "" {
		item.Color = &color
	}

	// Upsert — if same product+size+color, increment quantity
	err := r.db.QueryRow(ctx, `
		INSERT INTO cart_items (id, cart_id, product_id, size, color, price, quantity)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (cart_id, product_id, size, color)
		DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
		RETURNING id, quantity, created_at, updated_at`,
		item.ID, cartID, productID, size, color, price, qty,
	).Scan(&item.ID, &item.Quantity, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *CartRepository) UpdateItemQuantity(ctx context.Context, itemID, cartID uuid.UUID, qty int) error {
	res, err := r.db.Exec(ctx,
		`UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3`,
		qty, itemID, cartID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *CartRepository) RemoveItem(ctx context.Context, itemID, cartID uuid.UUID) error {
	res, err := r.db.Exec(ctx,
		`DELETE FROM cart_items WHERE id = $1 AND cart_id = $2`,
		itemID, cartID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *CartRepository) ClearCart(ctx context.Context, cartID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM cart_items WHERE cart_id = $1`, cartID)
	return err
}
